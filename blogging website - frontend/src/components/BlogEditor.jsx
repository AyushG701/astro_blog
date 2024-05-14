import React, { useRef } from "react";
import { Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import logo from "../imgs/logo.png";
import blogBanner from "../imgs/blog banner.png";
import { toast } from "react-hot-toast";
// import { uploadFile, getSignatureForUpload } from "../common/cloudinary";
import { useState } from "react";
import axios from "axios";
const BlogEditor = ({ title }) => {
  //   const [theme, setTheme] = useContext(ThemeContext);
  const [banner, setBanner] = useState(blogBanner);
  const handleBannerUpload = async (e) => {
    e.preventDefault();
    const cloud_name = import.meta.env.VITE_CLOUD_KEY;

    try {
      // Get signature from the server
      const signatureResponse = await axios.get(
        "http://localhost:3000/get-signature",
      );

      // Create FormData object to send file data
      const formData = new FormData();
      formData.append("file", e.target.files[0]);
      formData.append("api_key", import.meta.env.VITE_API_KEY); // Assuming api_key is defined somewhere
      formData.append("signature", signatureResponse.data.signature);
      formData.append("timestamp", signatureResponse.data.timestamp);

      // Send file to Cloudinary
      const cloudinaryResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            // Calculate and update upload progress
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100,
            );
            console.log(progress);
          },
        },
      );
      console.log(cloudinaryResponse.data);
      // Send image info back to the server
      const photoData = {
        public_id: cloudinaryResponse.data.public_id,
        version: cloudinaryResponse.data.version,
        signature: cloudinaryResponse.data.signature,
      };

      await axios.post(
        "http://localhost:3000/do-something-with-photo",
        photoData,
      );

      console.log("File uploaded successfully:", cloudinaryResponse.data);
      // After successful upload, fetch updated photo URLs
      const updatedPhotoResponse = await axios.get(
        "http://localhost:3000/view-photos",
      );

      const updatedPhotoUrls = updatedPhotoResponse.data;

      // Update the banner state with the new image URL
      setBanner(updatedPhotoUrls[0]); // Assuming you only want the first photo
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  const handlePublishEvent = (e) => {
    console.log(e);
  };
  const handleSaveDraft = (e) => {
    console.log(e);
  };
  const handleErrorImg = (e) => {
    console.log(e);
  };
  const handleTitleKeyDown = (e) => {
    console.log(e);
  };
  const handleTitleChange = (e) => {
    console.log(e);
  };

  return (
    <>
      {/* navpar for the editor section with publish or save draft options */}
      <nav className="navbar">
        <Link to="/" className="flex-none w-10">
          <img className="" src={logo} alt="" />
        </Link>

        <p className="max-md:hidden text-black line-clamp-1 w-full">
          {/* {title.length ? title : "New Blog"} */}
          hasdkf
        </p>

        <div className="flex gap-4 ml-auto ">
          <button onClick={handlePublishEvent} className="btn-dark py-2 ">
            Publish
          </button>
          <button onClick={handleSaveDraft} className="btn-light py-2 ">
            Save Draft
          </button>
        </div>
      </nav>

      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full ">
            {/* blog banner upload  */}
            <div className="relative aspect-video bg-white border-grey border-4 hover:opacity-80">
              <label htmlFor="upload_banner">
                <img
                  onError={handleErrorImg}
                  className="z-20 "
                  src={banner}
                  alt=""
                />
                <input
                  id="upload_banner"
                  type="file"
                  accept=".png , .jpg , .jpeg"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>

            <textarea
              defaultValue={title}
              placeholder="Blog Title"
              className=" bg-white text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-[40%]"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            ></textarea>

            <hr className="w-full opacity-10 m-5 " />

            <div id="text-Editor" className="font-gelasio"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
