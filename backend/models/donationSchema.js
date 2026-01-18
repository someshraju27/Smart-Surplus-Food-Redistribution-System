import mongoose from "mongoose";

const donationSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  foodName: { type: String, required: true },
  quantity: { type: Number, required: true },
  expiryIn: { type: Date, required: true }, // Expiry time in hours
  address:{type: String, required: true}, // Store address
  latitude: { type: Number, required: true }, // Store latitude
  longitude: { type: Number, required: true }, // Store longitude
  status: { type: String, enum: ["pending", "assigned", "accepted","completed"], default: "pending" },
  imageUrl: {type:String},
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Volunteer" },
  acceptedByVolunteer: { type: Boolean, default: false }
});

export default mongoose.model("Donation", donationSchema);
