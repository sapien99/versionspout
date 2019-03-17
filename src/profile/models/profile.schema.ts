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
    email: { type: String },
    htmlEmail: { type: Boolean, default: true },
    created: { type: Date, default: Date.now },
    updated: { type: Date },
    
    notificationChannels: [NotificationChannelSchema],

    defaults: {
        notificationChannels: [{ type: String }],        
        ignorePatterns: [{ type: String }],        
    },

    subscribedVersions: [{
        type: { type: String },                
        notificationChannels: [{ type: String }],        
        ignorePatterns: [{ type: String }],                
        semver: { type: String },                
        subject: { type: String },        
    }]
}, {
    versionKey: false
});