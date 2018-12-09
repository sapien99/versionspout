import * as mongoose from 'mongoose';

export const DockerVersionSchema = new mongoose.Schema({
    repository: String,
    image: Number,
    tag: String,
    fetched: Date,
    updated: Date,
    size: Number,
});