import mongoose from "mongoose";

const donorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Donation" }], // Pending donations
    donationsCompleted: [{ type: mongoose.Schema.Types.ObjectId, ref: "Donation" }],
  },
  { timestamps: true }
);

export default mongoose.model("Donor", donorSchema);
