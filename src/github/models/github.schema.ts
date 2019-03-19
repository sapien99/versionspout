import * as mongoose from 'mongoose';

export const GithubReleaseSchema = new mongoose.Schema({
    type: { type: String },
    tag: { type: String },
    isSemver: { type: Boolean },
    created: { type: Date },        
    data: { type: mongoose.Schema.Types.Mixed },    
}, { _id: false, versionKey: false })

export const GithubRepositorySchema = new mongoose.Schema({
    _id: { type: String },
    type: { type: String },    
    subject: { type: String },    
    fetched: { type: Date, default: Date.now },
    tags: [GithubReleaseSchema]    
}, { versionKey: false });