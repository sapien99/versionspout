import * as mongoose from 'mongoose';

export const DockerTagSchema = new mongoose.Schema({
    type: { type: String },
    tag: { type: String },
    isSemver: { type: Boolean },
    published: { type: Date },        
    data: { type: mongoose.Schema.Types.Mixed },    
}, { _id: false, versionKey: false })

export const DockerManifestSchema = new mongoose.Schema({
    _id: { type: String },
    type: { type: String },    
    subject: { type: String },    
    fetched: { type: Date, default: Date.now, expires: 300 },
    tags: [DockerTagSchema]    
}, { versionKey: false });