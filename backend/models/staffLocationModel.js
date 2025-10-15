import mongoose from "mongoose";
import { User } from "./UserModel";

const staffLocationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    // 2. Geographical Coordinates (The Geofence Anchor)
    latitude: {
        type: Number,
        required: true,
        min: -90,  
        max: 90
    },
    longitude: {
        type: Number,
        required: true,
        min: -180, 
        max: 180
    },

    // 3. Status and Auditing // use in PHASE 3 in location validation...................
    active: { // will be used to get the location of staff in phase 3
        type: Boolean,
        default: true,
        // Only one location should be marked 'active' at a time for the validation process.
    },

    // 4. Reference to the User who set the location (for security and audit)
    setBy: {
        type: mongoose.Schema.Types.ObjectId, // Link to the 'User' model
        ref: 'User',
        required: true,
        // Must be set by an authenticated Staff or Admin user.
    }

}, { timestamps: true }); 

// Indexing by 'active' status ensures fast querying for the current location.
staffLocationSchema.index({ active: 1 });

export const StaffLocation = mongoose.model("StaffLocation", staffLocationSchema);
