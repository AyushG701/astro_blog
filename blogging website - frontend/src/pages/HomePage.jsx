import React, { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InpageNavigation from "../components/InPageNavigation";
import axios from "axios";
import Loader from "../components/Loader";
import BlogPostCard from "../components/BlogPostCard";
import MinimulBlogPost from "../components/MininalBlogPost";
import {
  activeTabRef,
  activeTagLineTagRef,
} from "../components/InPageNavigation";
import NoDataMessage from "../components/NoDataMessage";
const HomePage = () => {
  let [blogs, setBlogs] = useState(null);
  let [trendingBlogs, setTrendingBlogs] = useState(null);
  let [pageState, setPageState] = useState("home");

  let categories = [
    "programming",
    "hollywood",
    "film making",
    "ai",
    "tech",
    "finance",
    "social media",
    "travel",
    "motivation",
  ];
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

  const fetchtrendingBlogs = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blog")
      .then(({ data }) => {
        console.log(data.blogs);
        console.log(data);
        setTrendingBlogs(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  //   fetching blog form the server with the tag
  const fetchBlogsByCategory = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
        tag: pageState,
      })
      .then(({ data }) => {
        console.log(data.blogs);

        setBlogs(data.blogs);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    // it updates the hr according to the lenght of the names
    activeTabRef.current.click();

    if (pageState == "home") {
      fetchLatestBlogs();
    }
    if (!trendingBlogs) {
      fetchtrendingBlogs();
    }
  }, [pageState]);

  const loadBlogByCategory = (e) => {
    let category = e.target.innerText.toLowerCase();
    setBlogs(null);

    if (pageState == category) {
      setPageState("home");
      return;
    } else {
      fetchBlogsByCategory();
    }

    setPageState(category);
  };
  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        {/* latest blog */}
        <div className="w-full">
          <InpageNavigation
            routes={[pageState, "trending blogs"]}
            defaultHidden={["trending blogs"]}
          >
            <>
              {blogs == null ? (
                <Loader />
              ) : blogs.length ? (
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
              ) : (
                <NoDataMessage message="No data related to this published" />
              )}
            </>
            <>
              {trendingBlogs == null ? (
                <Loader />
              ) : trendingBlogs.length ? (
                trendingBlogs.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      key={i}
                      transition={{ duration: 1, delay: i * 0.1 }}
                    >
                      <MinimulBlogPost blog={blog} idx={i} />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoDataMessage message="no trending blogs" />
              )}
            </>
          </InpageNavigation>
        </div>
        {/* filters and trending blogs */}

        <div className="min-w-[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden  ">
          {/* tags  */}
          <div className="flex flex-col gap-10 ">
            <div>
              <h1 className="font-medium text-xl mb-8">
                Stories From All interest
              </h1>
              <div className="flex flex-wrap gap-3 ">
                {categories &&
                  categories.map((category, i) => {
                    return (
                      <button
                        onClick={loadBlogByCategory}
                        className={
                          "tag " +
                          (pageState == category ? " bg-black text-white" : "")
                        }
                        key={i}
                      >
                        {category}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
          {/* trending page */}
          <div>
            <h1 className="font-medium text-xl mb-8 mt-5">
              Trending <i className="fi fi-rr-arrow-trend-up"></i>
            </h1>
            {trendingBlogs == null ? (
              <Loader />
            ) : trendingBlogs.lenght ? (
              trendingBlogs.map((blog, i) => {
                return (
                  <AnimationWrapper
                    key={i}
                    transition={{ duration: 1, delay: i * 0.1 }}
                  >
                    <MinimulBlogPost blog={blog} idx={i} />
                  </AnimationWrapper>
                );
              })
            ) : (
              <NoDataMessage message="no trending blogs" />
            )}
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;
