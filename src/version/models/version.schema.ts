import * as mongoose from 'mongoose';

export const VersionTagSchema = new mongoose.Schema({
    type: { type: String },
    tag: { type: String },
    isSemver: { type: Boolean },
    published: { type: Date },        
    data: { type: mongoose.Schema.Types.Mixed },    
}, { _id: false, versionKey: false })

export const VersionManifestSchema = new mongoose.Schema({
    _id: { type: String },
    type: { type: String },
    repository: { type: String },
    subject: { type: String },    
    fetched: { type: Date, default: Date.now },
    tags: [VersionTagSchema]    
}, { versionKey: false });