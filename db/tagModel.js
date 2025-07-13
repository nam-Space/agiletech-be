const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    date_time: { type: Date, default: Date.now },
});

module.exports = mongoose.model.Tags || mongoose.model("Tags", tagSchema);
