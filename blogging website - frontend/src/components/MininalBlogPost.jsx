// no banner blog post
import React from "react";
import { Link } from "react-router-dom";
import { getDay } from "../common/date";

const MinimulBlogPost = ({ blog, idx }) => {
  const {
    title,
    blog_id: id,
    author: {
      personal_info: { fullname, username, profile_img },
    },
    publishedAt,
  } = blog;
  console.log(blog, idx);
  return (
    <Link className="flex gap-5 mb-8 " to={`/blog/${id}`}>
      <h1 className="blog-index">{idx < 10 ? "0" + (idx + 1) : idx + 1} </h1>
      <div>
        <div className="flex gap-2 items-center mb-7  ">
          <img src={profile_img} alt="" className="w-6 h-6 rounded-full" />
          <p className="line-clamp-1 ">
            {fullname} @ {username}
          </p>
          <p className="min-width-fit ">{getDay(publishedAt)}</p>
        </div>
        <h1 className="blog-title">{title}</h1>
      </div>
    </Link>
  );
};

export default MinimulBlogPost;
