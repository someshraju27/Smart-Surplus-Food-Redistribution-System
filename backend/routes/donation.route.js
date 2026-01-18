import express from "express";
import Donation from "../models/donationSchema.js";
import Volunteer from "../models/volunteerSchema.js";
import PendingRequest from "../models/pendingRequest.js";
import authenticateToken from "../authMiddleware.js";
import { findNearestVolunteer } from "../utils/distanceCalculator.js";
import mongoose from "mongoose";

const router = express.Router();

// Constants
const CLUSTER_RADIUS = 2000; // 2km in meters

router.post("/donation/create/:id", async (req, res) => {
    try {
        const donorId = req.params.id;  // Getting donorId from URL

        console.log("Received donorId:", donorId);  // Debugging log

        const { foodName, foodType, quantity, expiryIn, address,latitude, longitude } = req.body;

        if (!donorId) {
            return res.status(400).json({ message: "donorId is missing in request parameters" });
        }
        const expiryDate = new Date(Date.now() + expiryIn * 60 * 60 * 1000); 
        const newDonation = new Donation({
            donorId,  // Ensure this is correct
            foodName,
            foodType,
            quantity,
            expiryIn: expiryDate,
            address,
            latitude,
            longitude,
            status: "pending"
        });

        await newDonation.save();
        res.status(201).json({ message: "Donation created successfully", donation: newDonation });
    } catch (error) {
        console.error("Error creating donation:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

/**
 * ✅ Get All Donations
 */
router.get('/donation/all', async (req, res) => {
    try {
        const donations = await Donation.find().populate("donorId", "name role");

        if (!donations.length) return res.status(404).json({ message: "No donations found" });

        res.status(200).json(donations);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});

/**
 * ✅ Get Available Donations (Pending)
 */

router.get('/donation/available', async (req, res) => {
    try {
        const donations = await Donation.find({ status: "pending" }).populate("donorId", "name role");
        res.status(200).json(donations);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});

/**
 * ✅ Assign a Donation to a Volunteer
 */
router.patch('/donation/assign', authenticateToken, async (req, res) => {
    try {
        const { donationId, volunteerId } = req.body;

        // Find donation
        const donation = await Donation.findById(donationId);
        if (!donation) return res.status(404).json({ message: "Donation not found" });

        // Find volunteer
        const volunteer = await Volunteer.findById(volunteerId);
        if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });

        // Assign donation to the volunteer
        donation.assignedTo = volunteer._id;
        donation.status = "assigned";
        await donation.save();

        // Add to volunteer's assignedRequests
        volunteer.assignedRequests.push(donationId);
        await volunteer.save();

        res.status(200).json({ message: "Donation assigned successfully", donation });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

/**
 * ✅ Accept a Donation (Volunteer confirms they will handle it)
 */
// router.patch("/accept/:donationId", authenticateToken, async (req, res) => {
//     try {
//         const { donationId } = req.params;
//         const userId = req.user.id;

//         // Find volunteer
//         const volunteer = await Volunteer.findOne({ userId });
//         if (!volunteer) return res.status(403).json({ message: "You are not a volunteer!" });

//         // Find donation
//         const donation = await Donation.findById(donationId);
//         if (!donation) return res.status(404).json({ message: "Donation not found" });

//         // Ensure volunteer is assigned to this donation
//         if (!donation.assignedTo.includes(volunteer._id)) {
//             return res.status(403).json({ message: "You are not assigned to this donation!" });
//         }

//         // Mark as accepted
//         donation.acceptedByVolunteer = true;
//         await donation.save();

//         // Move to acceptedOrders
//         volunteer.acceptedOrders.push(donationId);
//         await volunteer.save();

//         res.status(200).json({ message: "Donation accepted successfully", donation });
//     } catch (err) {
//         res.status(500).json({ message: "Internal Server Error", error: err.message });
//     }
// });

/**
 * ✅ Accept a Donation (Volunteer confirms)
 * Fix: Direct comparison instead of .includes()
 */
router.patch("/accept/:donationId", authenticateToken, async (req, res) => {
    try {
        const { donationId } = req.params;
        const userId = req.user.id;

        const volunteer = await Volunteer.findOne({ userId });
        if (!volunteer) return res.status(403).json({ message: "You are not a volunteer!" });

        const donation = await Donation.findById(donationId);
        if (!donation) return res.status(404).json({ message: "Donation not found" });

        // FIX: assignedTo is an ID, not an array. Use .equals()
        if (!donation.assignedTo || !donation.assignedTo.equals(volunteer._id)) {
            return res.status(403).json({ message: "You are not assigned to this donation!" });
        }

        donation.status = "accepted"; // Update status string
        donation.acceptedByVolunteer = true;
        await donation.save();

        // Move from assigned to accepted
        volunteer.assignedRequests = volunteer.assignedRequests.filter(id => id.toString() !== donationId);
        volunteer.acceptedRequests.push(donationId);
        await volunteer.save();

        res.status(200).json({ message: "Donation accepted!", donation });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

/**
 * ✅ Complete Donation
 * Logic: Ensure image proof is linked so Donor can see it.
 */
router.patch("/complete/:donationId", authenticateToken, async (req, res) => {
    try {
        const { donationId } = req.params;
        const userId = req.user.id;

        const volunteer = await Volunteer.findOne({ userId }).populate('completedRequests.donationId');
        const donation = await Donation.findById(donationId);

        if (!volunteer || !donation) return res.status(404).json({ message: "Not found" });

        // Find the image proof the volunteer just uploaded (from their completedRequests array)
        const completionRecord = volunteer.completedRequests.find(
            req => req.donationId.toString() === donationId
        );

        donation.status = "completed";
        // Link the image to the donation so the Donor Dashboard can display it
        if (completionRecord) {
            donation.imageUrl = completionRecord.helpingImage; 
        }
        
        await donation.save();

        res.status(200).json({ message: "Mission Accomplished!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/**
 * ✅ Volunteer rejects a donation request
 */
router.patch("/volunteer/reject/:volunteerId/:donationId", async (req, res) => {
    try {
        const { volunteerId, donationId } = req.params;

        const volunteer = await Volunteer.findById(volunteerId);
        const donation = await Donation.findById(donationId);

        if (!volunteer || !donation) {
            return res.status(404).json({ message: "Volunteer or Donation not found!" });
        }

        if (!volunteer.assignedRequests.includes(donationId)) {
            return res.status(400).json({ message: "Donation not assigned to this volunteer!" });
        }

        // Remove the donation from the volunteer's assigned requests
        volunteer.assignedRequests = volunteer.assignedRequests.filter(id => id.toString() !== donationId);
        await volunteer.save();

        // Reset the donation status
        donation.assignedTo = null;
        donation.status = "pending";
        donation.acceptedByVolunteer = false;
        await donation.save();

        // Reassign the donation to the next nearest volunteer
        const nearestVolunteer = await findNearestVolunteer(donation.latitude, donation.longitude);
        if (nearestVolunteer) {
            donation.assignedTo = nearestVolunteer._id;
            donation.status = "assigned";
            await donation.save();

            nearestVolunteer.assignedRequests.push(donationId);
            await nearestVolunteer.save();
        }

        res.status(200).json({ message: "Donation request rejected and reassigned!" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

/**
 * ✅ Mark Donation as Completed (Only Assigned Volunteers)
 */

// router.patch("/complete/:donationId", authenticateToken, async (req, res) => {
//     try {
//         const { donationId } = req.params;
//         const userId = req.user.id;

//         // Find volunteer
//         const volunteer = await Volunteer.findOne({ userId });
//         if (!volunteer) return res.status(403).json({ message: "You are not a volunteer!" });

//         // Find donation
//         const donation = await Donation.findById(donationId);
//         if (!donation) return res.status(404).json({ message: "Donation not found" });

//         // Ensure volunteer is assigned
//         if (!donation.assignedTo.includes(volunteer._id)) {
//             return res.status(403).json({ message: "You are not assigned to this donation!" });
//         }

//         // Update status
//         donation.status = "completed";
//         // donation.imageUrl = imageUrl;
//         await donation.save();

//         // Update volunteer's records
//         volunteer.assignedRequests = volunteer.assignedRequests.filter(id => id.toString() !== donationId);
//         volunteer.acceptedRequests = volunteer.acceptedRequests.filter(id => id.toString() !== donationId);
//         volunteer.completedRequests.push(donationId);
//         await volunteer.save();

//         // volunteer.completedOrders.



//         res.status(200).json({message: "Donation marked as completed!" });
//     } catch (err) {
//         res.status(500).json({ message: "Internal Server Error", error: err.message });
//     }
// });

/**
 * ✅ Get Donation Details
 */
router.get('/individualDonation/:id', async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id)
            .populate("donorId", "name role")
            .populate("assignedTo", "userId"); // Get assigned volunteer details

        if (!donation) return res.status(404).json({ message: "Donation not found" });

        res.status(200).json(donation);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});


router.get('/donation/:id', authenticateToken,async (req, res) => {
    try {
        console.log("Fetching donations for user:", req.params.id);
        
        const donations = await Donation.find({ donorId : req.params.id });
        // console.log("donations", donations);
        
        if (!donations) return res.status(404).json({ message: "Donation not found" });
        res.status(200).json(donations);
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});

export default router;
