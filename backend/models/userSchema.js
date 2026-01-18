import mongoose from "mongoose";

const userDataSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true
    },
    email: { 
        type: String,
        required: true
    },
    password: { 
        type: String,
        required: true
    },
    role: { 
        type: String,
        enum: ["volunteer", "donor", "user"],
        default: "user"
    },
    address: { 
        type: String,
        required: true
    },
    phonenum: { 
        type: String,
        required: true
    }
});

export default mongoose.model("User", userDataSchema);
