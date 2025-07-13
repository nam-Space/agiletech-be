const User = require("../db/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const ms = require("ms");


require("dotenv").config();

function verifyToken(req, res, next) {
    const token = req.headers["authorization"];
    if (typeof token !== "undefined") {
        jwt.verify(token.split(" ")[1], process.env.SECRET_KEY, (err, decoded) => {
            if (err) {
                res.status(403).send({
                    isError: true,
                    message: "Invalid token",
                });
            } else {
                req.user = decoded.user;
                next();
            }
        });
    } else {
        res.status(401).send({
            isError: true,
            message: "Unauthorized",
        });
    }
}

const hashPassword = async (password) => {
    const hash = await bcrypt.hashSync(password, 10);
    return hash;
};

const comparePassword = async (password, hashPassword) => {
    return await bcrypt.compareSync(password, hashPassword);
};

const createRefreshToken = (user) => {
    const refresh_token = jwt.sign({ user }, process.env.SECRET_KEY, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE,
    });

    return refresh_token;
};

const updateUserToken = async (refresh_token, _id) => {
    return await User.updateOne(
        {
            _id,
        },
        {
            refresh_token: refresh_token,
        },
    );
};

module.exports = {
    verifyToken,
    hashPassword,
    comparePassword,
    createRefreshToken,
    updateUserToken
}