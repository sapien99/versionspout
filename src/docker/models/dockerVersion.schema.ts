import * as mongoose from 'mongoose';

export const DockerVersionSchema = new mongoose.Schema({
    _id: { type: String },
    repository: { type: String },
    image: { type: String },    
    fetched: { type: Date, default: Date.now },
    tags: [{
        _id: { type: String },
        tag: { type: String },    
        updated: { type: Date },
        size: { type: Number },
        hashes: [{
            _id: { type: String },
            hash: { type: String }
        }]
    }]    
});