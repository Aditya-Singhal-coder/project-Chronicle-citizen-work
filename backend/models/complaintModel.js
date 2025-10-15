import mongoose from "mongoose";
import { User } from "./UserModel";

const complaintSchema = new mongoose.Schema({
    // (Who submitted it)
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId, // References the User who submitted the complaint
        ref: 'User',
        required: true
    },

    // 2. Location Data 
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

    // 3. Complaint Details
    title: { 
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000 
    },
    type: { // Pre-defined categories for staff filtering
        type: String,
        required: true,
        enum: ['Road Damage', 'Water Leakage', 'Garbage Not Collected', 'Other Municipal Issue'],
        default: 'Other Municipal Issue'
    },
    
    // 4. Media and Evidence
    photoUrl: {
        type: String,
        required: true, 
        trim: true,
    },

    // 5. Ticket Lifecycle Status (Crucial for the Citizen Portal/Tracking)
    status: {
        type: String,
        enum: ['OPEN', 'IN PROGRESS', 'RESOLVED', 'CLOSED'],
        default: 'OPEN'
    },

    // 6. Metadata for Tracking and Auditing
    resolutionNotes: { // For staff to update upon resolution
        type: String,
        trim: true,
        default: null
    },
    resolvedBy: { // References the Staff User who resolved the ticket
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    
    
    // Timestamps for submission and updates
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date
    }

}, { timestamps: true }); // Using Mongoose timestamps adds 'createdAt' and 'updatedAt' automatically.
                           // NOTE: I kept 'createdAt' above for clarity, but you can rely on the option here.

// Add an index to speed up common citizen portal queries (finding their own tickets)
complaintSchema.index({ submittedBy: 1, status: 1 });

export const Complaint = mongoose.model("Complaint", complaintSchema);
