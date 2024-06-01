import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/Loader";
import { getDay } from "../common/date";
import BlogInteraction from "../components/BlogInteraction";
import BlogPostCard from "../components/BlogPostCard";
import BlogContent from "../components/BlogContent";
export const BlogStructure = {
  title: "",
  content: "",
  banner: "",

  author: { personal_info: {} },

  publishedAt: "",
};

export const BlogContext = createContext({});
const BlogPage = () => {
  let { blog_id } = useParams();

  const [blog, setBlog] = useState(BlogStructure);
  const [similarBlog, setSimilarBlog] = useState(BlogStructure);
  const [loading, setLoading] = useState(true);
  const [isLikedByUser, setIsLikedByUser] = useState(false);

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
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", { blog_id })
      .then(({ data: { blog } }) => {
        console.log(blog);
        setBlog(blog);

        axios
          .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
            tag: blog.tags[0],
            limit: 6,
            eliminate_blog: blog_id,
          })
          .then(({ data }) => {
            console.log(data.blogs);
            setSimilarBlog(data.blogs);
          });

        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    resetState();
    fetchBlog({ blog_id });
  }, [blog_id]);

  const resetState = () => {
    setBlog(BlogStructure);
    setSimilarBlog(null);
    setLoading(true);
  };
  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : (
        <BlogContext.Provider
          value={{
            blog,
            setBlog,
            setIsLikedByUser,
            isLikedByUser,
            // setTotalParentCommentLoaded,
            // totalParentCommentLoaded,
            // commentWrapper,
            // setCommentWrapper,
          }}
        >
          {/* // <CommentContainer /> */}
          <div className="max-w-[900px] center py-10 max-lg:px-[5vw]">
            <img src={banner} className="aspect-video " />

            <div className="mt-12 ">
              <h2>{title}</h2>

              <div className="flex max-sm:flex-col justify-between my-8 ">
                <div className="flex gap-5 items-start ">
                  <img
                    onClick={() => {
                      navigate(`/user/${username}`);
                    }}
                    className="w-12 h-12 rounded-full"
                    src={profile_img}
                  />
                  <p className="capitalize">
                    {fullname}
                    <br />@
                    <Link className="underline" to={`/user/${username}`}>
                      {username}
                    </Link>
                  </p>
                </div>

                <p className="text-dark-grey opacity-75 max-sm:mt-6 max-sm:ml-12 max-sm:pl-5">
                  Publish on {getDay(publishedAt)}
                </p>
              </div>
            </div>

            <BlogInteraction />
            {/* blog_content */}
            <div className="my-12 font-gelasio blog-page-content">
              {content[0].blocks.map((block, i) => {
                return (
                  <div key={i} className="my-4 md:my-8 ">
                    <BlogContent block={block} />
                  </div>
                );
              })}
            </div>

            <BlogInteraction />
            {/* similar blogs  */}
            {similarBlog != null && similarBlog.length ? (
              <>
                <h1 className="text-2xl mt-14 mb-10 font-medium">
                  Similar Blog
                </h1>

                {similarBlog &&
                  similarBlog.map((blog, i) => {
                    let {
                      author: { personal_info },
                    } = blog;

                    return (
                      <AnimationWrapper
                        key={i}
                        transition={{ duration: 1, delay: i * 0.08 }}
                      >
                        <BlogPostCard content={blog} author={personal_info} />
                      </AnimationWrapper>
                    );
                  })}
              </>
            ) : (
              ""
            )}
          </div>
        </BlogContext.Provider>
      )}
    </AnimationWrapper>
  );
};

export default BlogPage;
