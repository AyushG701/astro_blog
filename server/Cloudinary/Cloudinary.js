import React from "react";
import "dotenv/config";
// import cloudinary from "cloudinary";
import { v2 as cloudinary } from "cloudinary";
const Cloudinary = () => {
  return (
    // cloudanary config
    cloudinary.config({
      cloud_name: process.env.CLOUD_KEY,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    })
  );
};

export default Cloudinary;
