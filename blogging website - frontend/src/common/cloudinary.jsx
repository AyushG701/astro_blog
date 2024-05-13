import axios from "axios";

// export const uploadImage = async (img) => {
//   let imgUrl = null;

//   // // Fetch the upload URL from the server
//   // await axios
//   //   .get(import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url")
//   //   .then(async ({ data: { uploadUrl } }) => {
//   //     // Use Axios to upload the image to the obtained upload URL
//   //     await axios({
//   //       method: "PUT",
//   //       url: uploadUrl,
//   //       headers: { "Content-Type": "multipart/form-data" }, // Removed the extra space
//   //       data: formData, // Use FormData to send image data
//   //     }).then(() => {
//   //       imgUrl = uploadUrl.split("?")[0];
//   //     });
//   //   });

//   // return imgUrl;

//   try {
//     const formData = new FormData();
//     formData.append("file", img);
//     formData.append("upload_preset", "astroblogs");
//     formData.append("folder", "astro-blog");

//     // Fetch the upload URL from the server
//     const { data } = await axios.get(
//       import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url",
//     );

//     // Use Axios to upload the image to the obtained upload URL
//     await axios.post(data.uploadUrl, formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     // Set the image URL (assuming the upload was successful)
//     imgUrl = data.uploadUrl.split("?")[0];
//   } catch (error) {
//     console.error("Error uploading image:", error);
//   }

//   return imgUrl;
// };

export const uploadImage = async (img) => {
  try {
    const formData = new FormData();
    formData.append("file", img);
    formData.append("upload_preset", "astroblogs");
    formData.append("folder", "astro-blog");

    const { data } = await axios.post(
      import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url",
      formData, // Sending the image data in the request
    );
    const response = await axios.post(data.uploadUrl, formData);

    if (response.status === 200) {
      const imgUrl = data.uploadUrl.split("?")[0];
      return imgUrl;
    } else {
      throw new Error("Upload failed");
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};
