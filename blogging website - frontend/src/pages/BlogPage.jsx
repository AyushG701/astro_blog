import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export const blogStructure = {
  title: "",
  content: "",
  banner: "",

  author: { personal_info: {} },
  tags: [],
  publishedAt: "",
};
const BlogPage = () => {
  let { blog_id } = useParams();

  const [blog, setBlog] = useState(blogStructure);
  let {
    title,
    content,
    banner,
    author: {
      personal_info: { fullname, username, profile_img },
    },
    publishedAt,
  } = blog;
  const fetchBlog = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "get-blog", { blog_id })
      .then(({ data: { blog } }) => {
        console.log(blog);
        setBlog(blog);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    fetchBlog();
  }, []);
  return <div>BlogPage</div>;
};

export default BlogPage;
