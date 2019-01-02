import * as mongoose from 'mongoose';

export const ProfileSchema = new mongoose.Schema({
    email: String,
    dockerVersions: [{
        allowedRange: String,
        currentVersion: String,
        artifact: String
    }]
});