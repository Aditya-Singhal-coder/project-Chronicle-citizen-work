import express, { Router, urlencoded } from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/authRouter.js"; // Assumed path for auth routes
import connectDB from "./db/index.js"; // Assumed path for DB connection
import cookieParser from "cookie-parser"; // server se user ke browser ki cookies to access krne ke liye

dotenv.config(); 

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(urlencoded({extended: true}));
//app.use(express.static("public"));
app.use(cookieParser());

// --- Routes ---
app.get("/", (req, res) => {
    res.send("Caravan Chronicle API is running...");
});

app.get("/ping", (req, res) => {
  res.json({ message: "✅ Server is running fine" });
});

app.use("/api/auth", authRouter); // Using '/api/auth' as the base path

// --- Database Connection and Server Startup ---

// Use an async function to manage connection sequence
const startServer = async () => {
    const PORT = process.env.PORT || 5001;
    
    try {
        console.log("Connecting to DB...");
        await connectDB();
        console.log("✅ DB Connected, starting server...");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Access the API at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("CRITICAL ERROR: Database connection failed. Server not started.", error);
        process.exit(1); 
    }
}

// Execute the startup function
startServer();
