import * as mongoose from 'mongoose';

export const DockerVersionTagSchema = new mongoose.Schema({
    tag: { type: String },
    isSemver: { type: Boolean },
    created: { type: Date },        
    hashes: [{ type: String }],    
}, { _id: false, versionKey: false })

export const DockerVersionSchema = new mongoose.Schema({
    _id: { type: String },
    repository: { type: String },
    image: { type: String },    
    fetched: { type: Date, default: Date.now },
    tags: [DockerVersionTagSchema]    
}, { versionKey: false });