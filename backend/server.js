import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import userRoute from './routes/user.route.js';
import donationRoute from './routes/donation.route.js';
import donorRoutes from './routes/donor.route.js';
import volunteerRoutes from './routes/volunteer.route.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH","PUT", "DELETE"],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', userRoute);
app.use('/api', donationRoute);
app.use('/api', donorRoutes);
app.use('/api', volunteerRoutes);

// MongoDB Connection
try {
    await mongoose.connect(`mongodb+srv://someshraju27:${process.env.MONGODB_PASSWORD}@cluster0.v2fyo.mongodb.net/?appName=Cluster0`, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
} catch (err) {
    console.error("MongoDB Connection Error:", err);
}

// Server listener
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(process.env.JWT_SECRET);
});
