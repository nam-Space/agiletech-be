const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    date_time: { type: Date, default: Date.now },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users'
    },
    tags: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tags'
        }
    ],
});

const Photo = mongoose.model.Posts || mongoose.model("Posts", postSchema);

module.exports = Photo;
