const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String },
    fullName: { type: String },
    password: { type: String },
    refresh_token: { type: String },
});

module.exports = mongoose.model.Users || mongoose.model("Users", userSchema);
