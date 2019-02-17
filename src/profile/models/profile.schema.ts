import * as mongoose from 'mongoose';

export const NotificationStatusSchema = new mongoose.Schema({        
    _id: String,
    email: String,
    channel: String,
    image: String,
    tag: String,
    data: Date
}, {
    versionKey: false
});

export const NotificationChannelSchema = new mongoose.Schema({    
    name: { type: String }, 
    type: { type: String },   
    config: { type: Object }
}, {
    versionKey: false,
    _id : false
});

export const UserProfileSchema = new mongoose.Schema({    
    _id: { type: String },
    email: String,
    created: { type: Date, default: Date.now },
    updated: { type: Date },
    
    notificationChannels: [NotificationChannelSchema],

    defaults: {
        notificationChannels: [{ type: String }],        
        semverIgnorePatterns: [{ type: String }],        
    },

    subscribedDockerVersions: [{
        notificationChannels: [{ type: String }],        
        semverIgnorePatterns: [{ type: String }],        
        semverRange: { type: String },        
        repository: { type: String },
        image: { type: String },            
        tag: { type: String },            
    }]
}, {
    versionKey: false
});