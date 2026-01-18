import express from "express";
import Volunteer from "../models/volunteerSchema.js";
import Donation from "../models/donationSchema.js";
import authenticateToken from "../authMiddleware.js";
import User from "../models/userSchema.js";
import { findNearestVolunteer } from "../utils/distanceCalculator.js";
import axios from "axios";
import { helpingImageUpload} from "../utils/cloundinaryConfig.js";



const router = express.Router();

// Constants
const CLUSTER_RADIUS = 2000; // 2km in meters
const OVERPASS_API_URL = "http://overpass-api.de/api/interpreter";

/**
 * 📌 Convert User to Volunteer
 */
router.post("/volunteer/:id", authenticateToken, async (req, res) => {
    try {
        console.log("Received request with ID:", req.params.id);
        console.log("Request body:", req.body);

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found!" });

        if (user.role === "volunteer") {
            return res.status(201).json({ message: "User is already a volunteer!" });
        }

        user.role = "volunteer";
        await user.save();

        let volunteer = await Volunteer.findOne({ userId: user._id });

        if (!volunteer) {
            volunteer = new Volunteer({
                userId: user._id,
                latitude: 0, // Default latitude
                longitude: 0, // Default longitude
                assignedRequests: [],
                acceptedOrders: [],
                completedOrders: [],
                isAvailable: true,
            });
            await volunteer.save();
        }
        volunteer.isAvailable = true; // Set availability to true
        await volunteer.save();

        res.status(201).json({ message: "User is now a volunteer!", volunteer });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

/**
 * 📌 Get Volunteer Details
 */

router.get("/volunteer/:id", authenticateToken, async (req, res) => {
    try {
        const volunteer = await Volunteer.findOne({ userId: req.params.id })
            .populate("userId", "name role")
            .lean();

        if (!volunteer) return res.status(404).json({ message: "Volunteer not found!" });

        res.status(200).json(volunteer);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


router.get("/volunteer", authenticateToken, async (req, res) => {
    try {
        // Fetch user data based on the authenticated user's ID
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


/**
 * 📌 Update Volunteer Location
 */
router.patch("/volunteer/detectLocation/:id", authenticateToken, async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        if (!latitude || !longitude) {
            return res.status(400).json({ message: "Latitude and Longitude are required!" });
        }

        const volunteer = await Volunteer.findOneAndUpdate(
            { userId: req.params.id },
            { latitude, longitude }
        );

        if (!volunteer) return res.status(404).json({ message: "Volunteer not found!" });

        res.status(200).json({ message: "Location updated successfully!", volunteer });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

/**
 * 📌 Get Volunteer Location
 */
router.get("/volunteer/getLocation/:id", async (req, res) => {
    try {
        const volunteer = await Volunteer.findOne({ userId: req.params.id });
        if (!volunteer) return res.status(404).json({ message: "Volunteer not found!" });

        if (!volunteer.latitude || !volunteer.longitude) {
            return res.status(400).json({ message: "Location not set!" });
        }

        res.status(200).json({
            message: "Location retrieved successfully!",
            id: volunteer.userId,
            location: {
                latitude: volunteer.latitude,
                longitude: volunteer.longitude
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


/**
 * 📌 AI assigns a donation to a nearby volunteer
 */
router.patch("/volunteer/assign", async (req, res) => {
    try {
        const { donationId } = req.body;
        console.log("Received request to assign donation:", donationId); // Debugging log
        const donation = await Donation.findById(donationId);

        if (!donation) return res.status(404).json({ message: "Donation not found!" });

        const nearestVolunteer = await findNearestVolunteer(donation.latitude, donation.longitude);
        console.log("Nearest volunteer:", nearestVolunteer); // Debugging log

        if (!nearestVolunteer) return res.status(404).json({ message: "No nearby volunteers found!" });

        if (donation.status !== "pending") {
            return res.status(400).json({ message: "Donation is not available for assignment!" });
        }

        // Assign the donation to the volunteer
        donation.assignedTo = nearestVolunteer.userId;
        donation.status = "assigned";
        donation.acceptedByVolunteer = false;
        await donation.save();

        nearestVolunteer.assignedRequests.push(donationId);
        await nearestVolunteer.save();

        res.status(200).json({ message: "Donation assigned to volunteer successfully!" });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

router.get("/volunteer/assignedRequests/:id", async (req, res) => {
    try {
        const volunteer = await Volunteer.findOne({ userId: req.params.id })
            .populate("assignedRequests")
            .lean();

        if (!volunteer) return res.status(404).json({ message: "Volunteer not found!" });

        res.status(200).json(volunteer.assignedRequests);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


/**
 * 📌 Volunteer accepts a donation request
 */

router.patch("/volunteer/accept/:userId/:donationId", async (req, res) => {
    try {
      const { userId, donationId } = req.params;
  
      const volunteer = await Volunteer.findOne({ userId: userId });
      const donation = await Donation.findById(donationId);
  
      if (!volunteer || !donation) {
        return res.status(404).json({ message: "Volunteer or Donation not found!" });
      }
  
      if (!volunteer.assignedRequests.includes(donationId)) {
        return res.status(400).json({ message: "Donation not assigned to this volunteer!" });
      }
  
      // Update donation status
      donation.acceptedByVolunteer = true;
      donation.status = "accepted";
      await donation.save();
  
      // Update volunteer's assigned and accepted lists
    //   volunteer.assignedRequests = volunteer.assignedRequests.filter(
    //     (id) => id.toString() !== donationId
    //   );
      volunteer.acceptedRequests.push(donationId);
      await volunteer.save();
  
      res.status(200).json({ message: "Donation request accepted!" });
    } catch (error) {
      console.error("💥 Error accepting donation:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  });
  

/**
 * 📌 Volunteer rejects a donation request
 */


router.put("/volunteer/reject/:userId/:donationId", async (req, res) => {
    console.log("route hit");
    
    try {
      const { userId, donationId } = req.params;
  
      console.log("Received request to reject donation:", donationId);
      console.log("User ID:", userId);
  
      const volunteer = await Volunteer.findOne({ userId: userId });
      console.log("Volunteer found:", volunteer);
  
      const donation = await Donation.findById(donationId);
      console.log("Donation found:", donation);
  
      if (!volunteer) {
        return res.status(404).json({ message: `Volunteer not found for userId: ${userId}` });
      }
      if (!donation) {
        return res.status(404).json({ message: `Donation not found for ID: ${donationId}` });
      }
  
      if (!volunteer.assignedRequests.includes(donationId)) {
        return res.status(400).json({ message: "Donation not assigned to this volunteer!" });
      }
  
      // Remove from assignedRequests
      volunteer.assignedRequests = volunteer.assignedRequests.filter(id => id.toString() !== donationId);
      await volunteer.save();
  
      // Reset donation
      donation.assignedTo = null;
      donation.status = "pending";
      donation.acceptedByVolunteer = false;
      await donation.save();
  
      // Reassign to next volunteer (excluding this one)
      const nearestVolunteer = await findNearestVolunteer(donation.latitude, donation.longitude, [userId]);
  
      if (nearestVolunteer) {
        donation.assignedTo = nearestVolunteer.userId;
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
    
  

// function multerErrorHandler(err, req, res, next) {
//     if (err instanceof multer.MulterError) {
//       console.error("Multer error:", err);
//       return res.status(400).json({ message: "Multer error", error: err.message });
//     } else if (err) {
//       console.error("Upload middleware error:", err);
//       return res.status(500).json({ message: "Upload error", error: err.message });
//     }
//     next();
//   }
  

/**
 * 📌 Volunteer completes a donation (uploads proof image)
 */




router.patch(
    "/volunteer/completed/:userId/:donationId",
    helpingImageUpload.single("helpingImage"), // ✅ this stays as-is
    // multerErrorHandler, // ✅ custom error middleware added next
    async (req, res) => {
      console.log("✅ File received:", req.file); // now this will print if image uploaded correctly
  
      try {
        const { userId, donationId } = req.params;
  
        if (!req.file) {
          return res.status(400).json({ message: "Image proof is required!" });
        }
  
        const imageUrl = req.file.path;
  
        if (!userId || !donationId) {
          return res.status(400).json({ message: "User ID and Donation ID are required!" });
        }
  
        const volunteer = await Volunteer.findOne({ userId });
        const donation = await Donation.findById(donationId);
  
        if (!volunteer || !donation) {
          return res.status(404).json({ message: "Volunteer or Donation not found!" });
        }
  
        if (!volunteer.acceptedRequests.includes(donationId)) {
          return res.status(400).json({ message: "Donation not accepted by this volunteer!" });
        }
  
        volunteer.acceptedRequests = volunteer.acceptedRequests.filter(
          id => id.toString() !== donationId
        );
  
        volunteer.assignedRequests = volunteer.assignedRequests.filter(
          id => id.toString() !== donationId
        );
  
        volunteer.completedRequests.push({
          donationId,
          helpingImage: imageUrl,
        });
  
        await volunteer.save();
  
        // const donation = await Donation.findById(donationId);
        if (donation) {
            donation.status = "completed";
            donation.imageUrl = imageUrl; // <--- ADD THIS FIELD TO YOUR DONATION SCHEMA
            await donation.save();
        }


  
        res.status(200).json({ message: "Donation completed successfully!" });
      } catch (error) {
        console.error("🔴 Internal Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
      }
    }
  ); 

  
router.patch('/volunteerLogout/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        user.role = "user";
        await user.save();
        console.log(user);
        
        const volunteer = await Volunteer.findOne({ userId: req.params.id });
        if (!volunteer) return res.status(404).json({ message: "Volunteer not found!" });
        volunteer.isAvailable = false; // Set availability to false
        await volunteer.save();
        

        res.status(200).json({ message: "Volunteer logged out successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


/**
 * 📌 Fetch nearby beggar hotspots
 */
/**
 * @swagger
 * /api/hotspots:
 *   get:
 *     summary: Get nearby shelter hotspots
 *     description: Returns shelters within 5km radius of given coordinates
 *     tags: [Hotspots]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: Latitude coordinate
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           format: float
 *         description: Longitude coordinate
 *     responses:
 *       200:
 *         description: Array of shelter hotspots
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hotspots:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Hotspot'
 *       400:
 *         description: Missing or invalid coordinates
 *       404:
 *         description: No hotspots found
 *       500:
 *         description: Server error
 */
router.get("/hotspots", async (req, res) => {
    try {
        const { latitude, longitude, radius = 5000 } = req.query;
        
        // Validation
        if (!latitude || !longitude) {
            return res.status(400).json({ 
                success: false,
                message: "Coordinates required",
                example: "/api/hotspots?latitude=XX.XXXX&longitude=YY.YYYY"
            });
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        const rad = Math.min(parseInt(radius), 10000);

        // For testing - return mock data
        const mockResponse = {
            success: true,
            hotspots: [{
                id: 1,
                type: "node",
                name: "Test Shelter",
                lat: lat + 0.001,
                lng: lng + 0.001,
                tags: { amenity: "shelter" }
            }],
            count: 1,
            radius: rad
        };

        return res.json(mockResponse);

    } catch (error) {
        console.error("Hotspots error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

export default router;
