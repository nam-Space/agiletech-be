
const User = require("../db/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const ms = require("ms");
const { comparePassword, createRefreshToken, updateUserToken, hashPassword } = require("../utils/auth");

require("dotenv").config();

const loginUser = async (request, response) => {
    try {
        const { username, password } = request.body;
        const user = await User.findOne({ username }, { __v: 0 });

        if (!user) {
            response
                .status(400)
                .send({ isError: true, message: "Username is invalid!" });
            return;
        }

        const checkValidPassword = await comparePassword(password, user?.password);

        if (!checkValidPassword) {
            response
                .status(400)
                .send({ isError: true, message: "Password is invalid!" });
            return;
        }

        const accessToken = jwt.sign(
            {
                user: {
                    _id: user._id,
                    username: user.username,
                    fullName: user.fullName,
                },
            },
            process.env.SECRET_KEY,
            {
                expiresIn: process.env.JWT_ACCESS_EXPIRE,
            },
        );

        const refresh_token = createRefreshToken({
            _id: user._id,
            username: user.username,
            fullName: user.fullName,
        });

        await updateUserToken(refresh_token, user._id);

        response.cookie("refresh_token", refresh_token, {
            httpOnly: true,
            maxAge: ms(process.env.JWT_REFRESH_EXPIRE), //1 day,
        });

        response.json({
            isError: false,
            accessToken,
            refresh_token,
            user,
        });
    } catch (error) {
        response.status(400).send({ isError: true, error });
    }
}

const registerUser = async (request, response) => {
    try {
        const {
            username,
            fullName,
            password,
            re_password,
        } = request.body;

        if (!username || !fullName || !password || !re_password) {
            response.status(400).send({
                isError: true,
                message:
                    "Username, fullName, password, re-password are required field!",
            });
            return;
        }

        const user = await User.findOne({ username }, { __v: 0 });

        if (user) {
            response.status(400).send({
                isError: true,
                message: "Username is exist!",
            });
            return;
        }

        if (re_password !== password) {
            response.status(400).send({
                isError: true,
                message: "Password and re-password must be identical!",
            });
            return;
        }

        const res = await User.create({
            username,
            fullName,
            password: await hashPassword(password),
        });
        response.send({
            data: res,
            isError: false,
        });
    } catch (error) {
        response.status(400).send({ isError: true, error });
    }
}

const refreshToken = async (request, response) => {
    try {
        const refresh_token = request.cookies["refresh_token"];

        const data = jwt.verify(refresh_token, process.env.SECRET_KEY);

        if (data.user) {
            const user = await User.findOne({
                _id: data.user._id,
            });

            if (user) {
                const refresh_token = createRefreshToken({
                    _id: user._id,
                    username: user.username,
                    fullName: user.fullName,
                });

                await updateUserToken(refresh_token, user._id);

                response.clearCookie("refresh_token");
                response.cookie("refresh_token", refresh_token, {
                    httpOnly: true,
                    maxAge: ms(process.env.JWT_REFRESH_EXPIRE), //1 day,
                });

                const accessToken = jwt.sign(
                    {
                        user: {
                            _id: user._id,
                            username: user.username,
                            fullName: user.fullName,
                        },
                    },
                    process.env.SECRET_KEY,
                    {
                        expiresIn: process.env.JWT_ACCESS_EXPIRE,
                    },
                );

                response.send({
                    isError: false,
                    accessToken,
                    refresh_token,
                });
            } else {
                response.clearCookie("refresh_token");
                response.status(400).send({
                    isError: true,
                    message: "Cannot get user! Maybe server got accident!",
                });
            }
        } else {
            response.clearCookie("refresh_token");
            response.status(400).send({
                isError: true,
                message: "Refresh token is invalid! Maybe something wrong with cookie!",
            });
        }
    } catch (error) {
        response
            .status(400)
            .send({ isError: true, error, message: "Refresh token is invalid!" });
    }
}

const logoutUser = async (request, response) => {
    try {
        const refresh_token = request.cookies["refresh_token"];
        const data = jwt.verify(refresh_token, process.env.SECRET_KEY);

        if (data.user) {
            await User.updateOne(
                {
                    _id: data.user._id,
                },
                {
                    $unset: { refresh_token: 1 },
                },
            );
            response.clearCookie("refresh_token");
            response.send({
                isError: false,
                message: "OK!",
            });
        } else {
            response
                .status(403)
                .send({ isError: true, message: "Access token is not invalid!" });
        }
    } catch (error) {
        response.status(400).send({ isError: true, error });
    }
}

const getAccountUser = async (request, response) => {
    try {
        const token = request.headers["authorization"];

        const data = jwt.verify(token.split(" ")[1], process.env.SECRET_KEY);

        response.send({
            data: data.user,
            isError: false,
        });
    } catch (error) {
        response.status(400).send({ isError: true, error });
    }
}

module.exports = {
    loginUser,
    registerUser,
    refreshToken,
    logoutUser,
    getAccountUser
}
