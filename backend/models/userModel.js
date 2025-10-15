import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,//" user@example.com ", it will be saved as "user@example.com"
        lowercase:true,
        minlength: [6,"Email must be atleast 6 character long"],
        maxlength: [64,"Email Should be less than 64 characters"]

    },
    password:{
            type:String,
            required:true,
            select:false
        
    },
    role: { 
        type: String,
        enum: ['Citizen', 'Staff', 'Admin'],
        default: 'Citizen'
    }
}, { timestamps: true });


// How to use it (Registration): In registration controller,  call this method to hash the password before creating the user document:

userSchema.statics.hashPassword= async function(password){
    return await bcrypt.hash(password,10);
}
userSchema.methods.isValidPassword= async function(password){
    return await bcrypt.compare(password,this.password);
}



userschema.methods.generateJWT = function() { // async not strictly needed here
    const token = jwt.sign(
        // Include the User ID and Role in the payload
        { 
            id: this._id,
            email: this.email,
            role: this.role // Essential for Role-Based Access
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
    return token;
};


export const User = mongoose.model("User", userSchema); // Use capital 'U' for model convention