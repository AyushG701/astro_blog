import React, { useRef } from "react";
import { Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import logo from "../imgs/logo.png";
import blogBanner from "../imgs/blog banner.png";
import { Toaster, toast } from "react-hot-toast";
// import { uploadFile, getSignatureForUpload } from "../common/cloudinary";
import { useState } from "react";
import axios from "axios";
const BlogEditor = ({ title }) => {
  //   const [theme, setTheme] = useContext(ThemeContext);
  const [banner, setBanner] = useState(blogBanner);
  let blogBannerRef = useRef();

  const handleBannerUpload = async (e) => {
    e.preventDefault();

    try {
      const cloudName = import.meta.env.VITE_CLOUD_KEY; // Retrieve Cloudinary cloud name
      const signatureResponse = await axios.get(
        "http://localhost:3000/get-signature",
      ); // Get signature from server
      const formData = new FormData(); // Create FormData object

      // Append file data and signature details to FormData
      formData.append("file", e.target.files[0]);
      formData.append("api_key", import.meta.env.VITE_API_KEY);
      formData.append("signature", signatureResponse.data.signature);
      formData.append("timestamp", signatureResponse.data.timestamp);

      // Show loading toast while image is being uploaded
      let loadingToast = toast.loading("Uploading");

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

      // Remove loading toast and show success toast
      toast.dismiss(loadingToast);
      toast.success("Uploaded");

      // Update banner image if upload was successful
      if (cloudinaryResponse.data.secure_url) {
        updateBannerImage(cloudinaryResponse.data.secure_url);
      }

      console.log("File uploaded successfully:", cloudinaryResponse.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      // Handle specific error cases and provide user feedback
      showUploadErrorToast();
    }
  };

  // Function to update banner image in UI
  const updateBannerImage = (imageUrl) => {
    blogBannerRef.current.src = imageUrl; // Assuming blogBannerRef is properly initialized
  };
  // Function to show upload error toast
  const showUploadErrorToast = () => {
    // Display error message to the user
    toast.dismiss(loadingToast);
    return toast.error("Error uploading file. Please try again later.");
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
  // used for title needed when i dont want user to press enter as title is only one line
  const handleTitleKeyDown = (e) => {
    if (e.keyCode == 13) {
      e.preventDefault();
    }
  };
  // when we are using the title input basically scrolls so we stop that behavour and handle the text height
  const handleTitleChange = (e) => {
    let input = e.target;
    console.log(input.scrollHeight);
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
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
      <Toaster />
      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full ">
            {/* blog banner upload  */}
            <div className="relative aspect-video bg-white border-grey border-4 hover:opacity-80">
              <label htmlFor="upload_banner">
                <img
                  onError={handleErrorImg}
                  className="z-20 "
                  ref={blogBannerRef}
                  src={blogBanner}
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
