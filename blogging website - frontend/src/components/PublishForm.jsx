import React, { useContext, useEffect } from "react";
import AnimationWrapper from "../common/page-animation";
import { EditorContext } from "../pages/Editor";
import Tags from "./Tags";
import toast from "react-hot-toast";
import axios from "axios";
import { UserContext } from "../App";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

const PublishForm = () => {
  let characterLength = 200;
  let tagLimit = 10;
  const {
    blog: { banner, tags, title, des, content },
    setEditorState,
    setBlog,
    blog,
  } = useContext(EditorContext);
  const handleClosed = () => {
    setEditorState("editor");
  };

  const handleBlogTitleChange = (e) => {
    e.preventDefault();
    let input = e.target;
    setBlog({
      ...blog,
      title: input.value,
    });
  };

  const handleBogdecsriptionChange = (e) => {
    e.preventDefault();
    let input = e.target;

    setBlog({
      ...blog,
      des: input.value,
    });
  };

  const handleTitleKeyDowm = (e) => {
    if (e.keyCode == 13) {
      e.preventDefault();
    }
  };

  const handlePublishBlog = (e) => {
    e.preventDefault();
  };

  const handleKeyDown = (e) => {
    if (e.keyCode == 13 || e.keyCode == 188) {
      e.preventDefault();
      let tag = e.target.value;
      if (tags.length < tagLimit) {
        if (!tags.includes(tag) && tag.length) {
          setBlog({
            ...blog,
            tags: [...tags, tag],
          });
        }
      } else {
        toast.error(`you can max ${tagLimit} tags`);
      }

      e.target.value = "";
    }
  };

  return (
    <AnimationWrapper>
      {/* Section wrapper with responsive grid layout */}
      <section className="w-screen min-h-screen grid items-center lg:grid-cols-2 py-16 lg:gap-4 ">
        {/* Close button to exit the editor */}
        <button
          onClick={handleClosed} // Function to handle closing the editor
          className="w-12 h-12 right-[5vw] z-10 absolute top-[5%] lg:top-[10%]"
        >
          <i className="fi fi-rr-circle-xmark"></i>{" "}
          {/* FontAwesome X mark icon */}
        </button>

        {/* Left side: Preview section */}
        <div className="max-w-[550px] center mt-4">
          <p className="text-dark-grey mb-1 ">Preview</p>
          <div className="w-full aspect-video rounded-lg overflow-hidden bg-grey mt-4">
            <img src={banner} className="" alt="" />{" "}
            {/* Preview of the blog banner */}
          </div>
          <h1 className=" text-4xl font-medium mt-2 leading-tight line-clamp-2 ">
            {title} {/* Preview of the blog title */}
          </h1>
          <p className="font-gelasio line-clamp-2 text-xl leading-7 mt-4">
            {des} {/* Preview of the blog description */}
          </p>
        </div>

        {/* Right side: Blog editing form */}
        <div className="border-grey lg:border-1 lg:pl-8">
          <p className="text-dark-grey mb-2 mt-9 ">Blog Title</p>
          <input
            type="text"
            placeholder="Blog Title"
            defaultValue={title}
            className="input-box pl-4"
            onChange={handleBlogTitleChange} // Handle blog title change
          />

          <p className="text-dark-grey mb-2 mt-9 ">
            Short Description about your blog
          </p>
          <textarea
            onKeyDown={handleTitleKeyDowm} // Handle key down events
            className="h-40 resize-none leading-7 pl-4 input-box "
            maxLength={characterLength} // Limit the length of the description
            defaultValue={des}
            onChange={handleBogdecsriptionChange} // Handle description change
          ></textarea>
          <p className="mt-1 text-dark-grey text-sm text-right">
            {characterLength - des.length} characters left{" "}
            {/* Remaining characters */}
          </p>

          <p className="text-dark-grey mb-2 mt-9 ">
            Topics - (help in searching and ranking your blog post)
          </p>
          <div className="relative input-box py-2 pb-4 ">
            <input
              type="text"
              placeholder="Topics"
              className="sticky input-box bg-white top-0 left-0 pl-4 mb-3 focus:bg-white"
              onKeyDown={handleKeyDown} // Handle key down events for topics
            />
            {tags.map((tag, i) => {
              return <Tags tag={tag} tagIndex={i} key={i} />; // Display tags
            })}
          </div>
          <p className="text-sm text-dark-grey text-right mt-1 mb-4 ">
            {tagLimit - tags.length} tags left {/* Remaining tags */}
          </p>

          <button onClick={handlePublishBlog} className="btn-dark px-8">
            Publish {/* Button to publish the blog */}
          </button>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default PublishForm;
