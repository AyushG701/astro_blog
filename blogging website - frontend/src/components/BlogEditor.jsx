import React, { useRef } from "react";
import { Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import logo from "../imgs/logo.png";
import blogBanner from "../imgs/blog banner.png";
import { toast } from "react-hot-toast";
import { uploadImage } from "../common/cloudinary";
import { useState } from "react";

const BlogEditor = ({ title }) => {
  //   const [theme, setTheme] = useContext(ThemeContext);

  const [banner, setBanner] = useState(blogBanner);

  let blogBannerRef = useRef();
  const handleBannerUpload = (e) => {
    let img = e.target.files[0];
    if (img) {
      let loadingToast = toast.loading("uploading...");
      uploadImage(img)
        .then((url) => {
          if (url) {
            toast.dismiss(loadingToast);
            toast.success("uploaded 👍");

            setBanner.current.src = url;
          }
        })
        .catch((err) => {
          toast.dismiss(loadingToast);
          return toast.error(err.message);
        });
    }
    console.log(img);
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
