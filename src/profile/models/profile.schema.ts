import * as mongoose from 'mongoose';

export const ProfileSchema = new mongoose.Schema({    
    _id: { type: String },
    email: String,
    created: { type: Date, default: Date.now },
    updated: { type: Date },
    dockerVersions: [{
        allowedRange: { type: String },
        currentVersion: { type: String },
        artifact: { type: String },
    }]
});