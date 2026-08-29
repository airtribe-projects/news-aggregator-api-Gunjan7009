const express = require("express");
const { randomBytes } = require("crypto");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const User = require("../models/User")
const NewsCache = require("../models/NewsCache")

exports.signup = async (req, res) => {
    try {
        const { name, email, password, preferences } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required",
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long",
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            businessId: randomBytes(6).toString("base64url"),
            name,
            email,
            password: hashedPassword,
            preferences: preferences || [],
        };

        await User.create(newUser);

        res.status(200).json({
            message: "User registered successfully",
        });
    } catch (error) {
        console.error("Error during signup:", error.message);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

exports.login = async (req, res) => {

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const token = JWT.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(200).json({
            message: "User logged in successfully",
            token,
        });
    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

exports.getPreferences = async (req, res) => {


    try {
        const userId = req.user.id;
        const user = await User.findOne({ _id: userId });

        if (!user) {
            return res.status(400).json({
                message: "User not found",
            });
        }

        res.status(200).json({
            message: "Preferences retrieved successfully",
            preferences: user.preferences,
        });

    }
    catch (error) {
        console.error("Error retrieving preferences:", error.message);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};

exports.updatePreferences = async (req, res) => {
    try {
        const { preferences } = req.body

        if (!preferences) {
            return res.status(400).json({
                message: "Preferences are required",
            });
        }

        if (!Array.isArray(preferences)) {
            return res.status(400).json({
                message: "Preferences must be an array",
            });
        }

        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found",
            });
        }

        user.preferences = preferences;
        await user.save();

        await NewsCache.deleteOne({
          userId: user._id,
        });

        res.status(200).json({
            preferences: user.preferences,
            message: "Preferences updated successfully",
        });
    } catch (error) {
        console.error("Error updating preferences:", error.message);
        res.status(500).json({
            message: "Internal server error",
        });
    }
};
