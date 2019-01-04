import * as mongoose from 'mongoose';

export const ProfileSchema = new mongoose.Schema({    
    _id: { type: String },
    email: String,
    created: { type: Date, default: Date.now },
    updated: { type: Date },
    dockerVersions: [{
        allowedRange: { type: String },        
        repository: { type: String },
        image: { type: String },            
        tag: { type: String },            
    }]
}, {
    versionKey: false
});