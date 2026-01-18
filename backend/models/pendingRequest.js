import mongoose from "mongoose";

const pendingRequestSchema = new mongoose.Schema(
  {
    donationId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Donation", 
      required: true 
    },
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", required: true },

    latitude: { 
      type: Number, 
      required: true 
    }, // Store latitude
    longitude: { 
      type: Number, 
      required: true 
    }, // Store longitude
  },
  { timestamps: true }
);



export default mongoose.model("PendingRequest", pendingRequestSchema);
// module.exports = mongoose.model("PendingRequest", pendingRequestSchema);