import mongoose from "mongoose";


// connect database
const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}`);
        console.log(`MongoDB is connected  !! DB Host: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("MongoDB connection failed:",error);
        process.exit(1)
    }
}

export default connectDB