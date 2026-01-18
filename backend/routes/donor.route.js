import express from 'express';
import User from '../models/userSchema.js';
import Donor from '../models/donorSchema.js';
import authenticateToken from '../authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/donor/:id
 * @desc    Register a user as a donor
 * @access  Private (Requires authentication)
 */

router.post("/donor/:id", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) return res.status(404).json({ message: "User not found!" });

        // Check if the user is already a donor
        if (user.role === "donor") {
            return res.status(400).json({ message: "User is already a donor!" });
        }

        // Update user role to donor
        user.role = "donor";
        await user.save();
        console.log(user);

        // Check if donor entry already exists
        let donor = await Donor.findOne({ userId: user._id });

        // Create donor entry if not exists
        if (!donor) {
            donor = new Donor({
                userId: user._id,
                donationHistory: [],
                totalDonations: 0
            });
            await donor.save();
        }

        res.status(201).json({ message: "User is now a donor!", donor });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

router.get("/donor", authenticateToken, async (req, res) => {
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
 * Get all donor details (including user info & completed donations)
 */

router.get("/donorDetails/:userId", async (req, res) => {
    try {
        const { id } = req.params;

        // Find donor using userId
        const donor = await Donor.findOne({ userId: id })
            .populate("donorId", "name role")  // Populate user details
            .populate("donationsCompleted"); // Populate completed donations

        if (!donor) {
            return res.status(404).json({ message: "Donor profile not found!" });
        }

        res.status(200).json(donor);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

router.patch('/donarLogout/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        user.role = "user";
        await user.save();
        console.log(user);
        
        res.status(200).json({ message: "Donar logged out successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

export default router;
