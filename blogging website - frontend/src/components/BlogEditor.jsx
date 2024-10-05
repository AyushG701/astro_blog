import React, { useContext, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import logo from "../imgs/logo.png";
import darklogo from "../imgs/logo-dark.png";
import lightBanner from "../imgs/blog banner light.png";
import darkBanner from "../imgs/blog banner dark.png";

import { Toaster, toast } from "react-hot-toast";
// import { uploadFile, getSignatureForUpload } from "../common/cloudinary";
import { useState } from "react";
import axios from "axios";
import { EditorContext } from "../pages/Editor";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./Tools";
import { ThemeContext, UserContext } from "../App";
const BlogEditor = () => {
  //   const [theme, setTheme] = useContext(ThemeContext);
  // const [banner, setBanner] = useState(blogBanner);
  const navigate = useNavigate();
  const { blog_id } = useParams();
  let { theme } = useContext(ThemeContext);

  let {
    blog,
    blog: { title, banner, content, tags, des },
    setBlog,
    textEditor,
    setTextEditor,
    setEditorState,
  } = useContext(EditorContext);

  let {
    userAuth: { access_token },
  } = useContext(UserContext);
  // useeffect
  useEffect(() => {
    if (!textEditor.isReady) {
      setTextEditor(
        new EditorJS({
          holder: "text-Editor",
          data: Array.isArray(content) ? content[0] : content,
          tools: tools,
          placeholder: "Lets write an awasome Story",
        }),
      );
    }
  }, []);

  //upload the Banner image
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
      let url = cloudinaryResponse.data.secure_url;
      console.log(url);
      updateBannerImage(url);

      console.log("File uploaded successfully:", cloudinaryResponse.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      // Handle specific error cases and provide user feedback
      showUploadErrorToast(loadingToast);
    }
  };

  // Function to update banner image in UI
  const updateBannerImage = (url) => {
    // blogBannerRef.current.src = imageUrl; // Assuming blogBannerRef is properly initialized
    setBlog({ ...blog, banner: url });
  };
  // Function to show upload error toast
  const showUploadErrorToast = (loadingToast) => {
    // Display error message to the user
    toast.dismiss(loadingToast);
    return toast.error("Error uploading file. Please try again later.");
  };

  // function to handle the publish event
  const handlePublishEvent = (e) => {
    console.log(e);
    if (!banner.length) {
      return toast.error("upload blog banner to publish it ");
    }
    if (!title.length) {
      return toast.error("write blog title to publish it ");
    }

    if (textEditor.isReady) {
      textEditor
        .save()
        .then((data) => {
          if (data.blocks.length) {
            setBlog({
              ...blog,
              content: data,
            });

            setEditorState("published");
          } else {
            return toast.error("write somwthing to publich");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  // handle the save Draft
  const handleSaveDraft = (e) => {
    // Prevent the function from running if the button is disabled
    if (e.target.className.includes("disable")) {
      return;
    }

    // Validate the title field
    if (!title.length) {
      return toast.error("Write a title before Saving Draft");
    }

    // Display a loading toast message indicating that the post is being published
    let loadingToast = toast.loading("Saving post...");
    // Disable the publish button to prevent multiple submissions
    e.target.classList.add("disable");

    if (textEditor.isReady) {
      // Get the content from the editor
      textEditor.save().then((content) => {
        // Create the blog object with necessary fields
        let blogOBJ = {
          title,
          banner,
          content,
          tags,
          des,
          draft: true, // Set the draft status to true for saving
        };

        console.log(blog_id); // Log the blog ID for debugging purposes

        // Send a POST request to the server to create the blog
        axios
          .post(
            import.meta.env.VITE_SERVER_DOMAIN + "/create-blog",
            { ...blogOBJ, id: blog_id }, // Include the blog ID if it exists
            {
              headers: {
                Authorization: `Bearer ${access_token}`, // Add the authorization header with the user's token
              },
            },
          )
          .then(() => {
            // Re-enable the publish button
            e.target.classList.remove("disable");
            // Dismiss the loading toast
            toast.dismiss(loadingToast);
            // Show a success message
            toast.success("Saved 👍");

            // Navigate to the user's blog dashboard after a short delay
            resetEditor();
            setTimeout(() => {
              navigate(`/dashboard/blogs?tab=draft`);
            }, 500);
          })
          .catch(({ response }) => {
            // Re-enable the publish button in case of an error
            e.target.classList.remove("disable");
            // Dismiss the loading toast
            toast.dismiss(loadingToast);
            // Show an error message with the response error
            return toast.error(response.data.error);
          });
      });
    }
  };

  const handleErrorImg = (e) => {
    console.log(e);
    let img = e.target;
    img.src = theme == "light" ? lightBanner : darkBanner;
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
    // console.log(input.scrollHeight);
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    setBlog({ ...blog, title: input.value });
  };
  const resetEditor = () => {
    setTextEditor({ isReady: false });
  };
  return (
    <>
      {/* navpar for the editor section with publish or save draft options */}
      <nav className="navbar">
        <Link to="/" className="flex-none w-10">
          <img className="" src={theme == "light" ? darklogo : logo} alt="" />
        </Link>

        <p className="max-md:hidden text-black line-clamp-1 w-full">
          {title.length ? title : "New Blog"}
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
              className=" bg-white text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40 "
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
