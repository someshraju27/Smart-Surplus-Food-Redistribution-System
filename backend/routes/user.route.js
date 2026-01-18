import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userSchema.js';
import authenticateToken from '../authMiddleware.js';
import Donation from '../models/donationSchema.js';

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, address, phonenum } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword, address, phonenum });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    // Fetch all users and exclude passwords
    const users = await User.find({}).select("-password");

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users:", err.message); // Log the actual error
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
});

router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: "Not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ message: "Not found" });
    }
    res.status(200).json({ message: "Deleted Successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Check if the input is an email or username
    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { name: emailOrUsername }]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Validate Password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign({ email: user.email, id: user._id, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      token
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

router.get("/home", authenticateToken, async (req, res) => {
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

router.get("/myDonations", authenticateToken, async (req, res) => {
  try {
    const myDonations = await Donation.find({ donorId: req.user.id });
    if (!myDonations.length) {
      return res.status(404).json({ message: "No donations found for this user" });
    }
    res.status(200).json(myDonations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
