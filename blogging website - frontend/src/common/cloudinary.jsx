import axios from "axios";

export const uploadImage = async (img) => {
  try {
    const response = await axios.get(
      import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url",
    );
    const uploadUrl = response.data.uploadUrl;

    await axios.put(uploadUrl, img, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log(uploadUrl);
    const imgUrl = uploadUrl.split("?")[0];
    console.log(imgUrl);
    return imgUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    // Handle the error (e.g., throw, return a default URL, show an error message)
    return null;
  }
};
