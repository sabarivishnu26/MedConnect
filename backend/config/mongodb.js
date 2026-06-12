import mongoose from "mongoose";
import logger from "./logger.js";

const connectDB = async () => {
    mongoose.connection.on("connected", () => logger.info("MongoDB connected successfully"));
    mongoose.connection.on("error", (err) => {
        logger.error("MongoDB connection error", { error: err.message });
    });
    await mongoose.connect(`${process.env.MONGODB_URI}`);
}
export default connectDB;
