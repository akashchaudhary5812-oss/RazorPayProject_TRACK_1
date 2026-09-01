const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const registerUser = async (req, res) => {

    const { userName, password, email } = req.body;
    if (!userName || !password || !email) {
        return res.status(400).json({
            success: false,
            message: "All Fields are Required!"
        })
    }

    try {
        const user = await userModel.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "User Already Exists!"
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await userModel.create({
            userName,
            password: hashedPassword,
            email
        });

        const token = jwt.sign({
            userId: newUser._id
        }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        });

        res.status(201).json({
            success: true,
            message: "User Registered Successfully!",
            token,
            user
        });

    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error!"
        })
    }

}


const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "All Fields are Required!"
        })
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found!"
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid Password!"
            })
        }

        const token = jwt.sign({
            userId: user._id
        }, process.env.JWT_SECRET, {
            expiresIn: "7d"
        });

        res.status(200).json({
            success: true,
            message: "User Logged In Successfully!",
            token,
            user
        });

    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error!"
        })
    }
}