import React, { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InpageNavigation from "../components/InPageNavigation";
import axios from "axios";
import Loader from "../components/Loader";
import BlogPostCard from "../components/BlogPostCard";

const HomePage = () => {
  let [blogs, setBlogs] = useState(null);
  const fetchLatestBlogs = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blog")
      .then(({ data }) => {
        console.log(data.blogs);
        console.log(data);
        setBlogs(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    fetchLatestBlogs();
  }, []);
  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        {/* latest blog */}
        <div className="w-full">
          <InpageNavigation
            routes={["home", "trending blogs"]}
            defaultHidden={["trending blogs"]}
          >
            <>
              {blogs == null ? (
                <Loader />
              ) : (
                blogs.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      key={i}
                      transition={{ duration: 1, delay: i * 0.1 }}
                    >
                      <BlogPostCard
                        content={blog}
                        author={blog.author.personal_info}
                      />
                    </AnimationWrapper>
                  );
                })
              )}
            </>
            <h1>this is latest page 2</h1>
            <h1>this is latest page 2</h1>
          </InpageNavigation>
        </div>
        {/* filters and trending blogs */}
        <div></div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
