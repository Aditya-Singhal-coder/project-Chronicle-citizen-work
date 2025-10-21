import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        minlength: [6, "Email must be at least 6 characters long"],
        maxlength: [64, "Email should be less than 64 characters"],
        validate: {
            validator: (v) => validator.isEmail(v),
            message: "Invalid email format"
        }
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    role: {
        type: String,
        enum: ['Citizen', 'Staff', 'Admin'],
        default: 'Citizen'
    },
    refreshToken: {
        type: String,
    }

}, { timestamps: true });

// Hash password
userSchema.statics.hashPassword = async function(password) {
    return await bcrypt.hash(password, 10);
};

// Compare password
userSchema.methods.isPasswordCorret = async function(password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // only hash if modified

    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (err) {
        next(err);
    }
});

// JWT generator
userSchema.methods.generateJWT = function() {
    return jwt.sign(
        { 
            id: this._id,
            email: this.email,
            role: this.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
// Access token is usually short live than refresh token
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);
