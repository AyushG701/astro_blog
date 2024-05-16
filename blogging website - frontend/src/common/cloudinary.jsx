import axios from "axios";

export const uploadImage = async (img) => {
  try {
    const cloudName = import.meta.env.VITE_CLOUD_KEY; // Retrieve Cloudinary cloud name
    const signatureResponse = await axios.get(
      "http://localhost:3000/get-signature",
    ); // Get signature from server
    const formData = new FormData(); // Create FormData object

    // Append file data and signature details to FormData
    formData.append("file", img);
    formData.append("api_key", import.meta.env.VITE_API_KEY);
    formData.append("signature", signatureResponse.data.signature);
    formData.append("timestamp", signatureResponse.data.timestamp);

    // Send file to Cloudinary
    const cloudinaryResponse = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          // Calculate and update upload progress
          const progress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100,
          );
          // Update progress bar or UI element if needed
        },
      },
    );

    // Update banner image if upload was successful
    let url = cloudinaryResponse.data.secure_url;
    console.log(url);
    return url;
  } catch (error) {
    console.error("Error uploading image:", error);
    // Handle the error (e.g., throw, return a default URL, show an error message)
    return null;
  }
};
