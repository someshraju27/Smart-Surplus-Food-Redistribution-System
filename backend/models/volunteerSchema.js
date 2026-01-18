import mongoose from "mongoose";

const volunteerSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    assignedRequests: [ // Assigned but not accepted
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Donation", 
        default: [] 
      }
    ],
    acceptedRequests: [ // Accepted requests
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Donation", 
        default: [] 
      }
    ],
    completedRequests: [ // Completed requests with proof of delivery
      {
        donationId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Donation", 
          required: true 
        },
        helpingImage: { 
          type: String, 
          required: true 
        }, // Proof of delivery
      },
    ],
    latitude: { 
      type: Number, 
      required: true 
    }, // Store latitude
    longitude: { 
      type: Number, 
      required: true 
    }, // Store longitude
    isAvailable: { type: Boolean, default: false }, // Availability status
  },
  { timestamps: true }
);

export default mongoose.model("Volunteer", volunteerSchema);
