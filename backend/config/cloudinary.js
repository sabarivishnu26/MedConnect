import {v2 as cloudinary} from "cloudinary";
import { pickEnv } from "../utils/env.js";
import logger from "./logger.js";

const connectCloudinary = async () =>{
    const cloud_name = pickEnv(["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_NAME"]);
    const api_key = pickEnv(["CLOUDINARY_API_KEY"]);
    const api_secret = pickEnv(["CLOUDINARY_API_SECRET", "CLOUDINARY_SECRET_KEY"]);

    if (!cloud_name || !api_key || !api_secret) {
        // Don't crash the server; uploads will return a clear error.
        logger.warn("Cloudinary env vars missing/incomplete; image uploads will be disabled.");
        return;
    }

    cloudinary.config({
        cloud_name,
        api_key,
        api_secret
    })      
}

export default connectCloudinary;