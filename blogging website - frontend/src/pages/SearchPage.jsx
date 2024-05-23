import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InpageNavigation from "../components/InPageNavigation";
import Loader from "../components/Loader";
import AnimationWrapper from "../common/page-animation";
import BlogPostCard from "../components/BlogPostCard";
import LoadMoreData from "../components/LoadMoreData";
import NoDataMessage from "../components/NoDataMessage";
import axios from "axios";
import { filterPaginationData } from "../common/filter-pagination-data";
const SearchPage = () => {
  const { query } = useParams();
  let [blogs, setBlogs] = useState(null);
  let [users, setUsers] = useState(null);

  const searchBlogs = async ({ page = 1, create_new_arr = false }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
        query,
        page,
      })
      .then(async ({ data }) => {
        console.log(data.blogs);

        const formatData = await filterPaginationData({
          state: blogs,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: { query },
          create_new_arr,
        });
        // setBlogs(data.blogs);
        console.log(formatData);
        setBlogs(formatData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const fetchUsers = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-users", { query })
      .then(({ data: { users } }) => {
        setUsers(users);
      });
  };

  useEffect(() => {
    resetState();
    searchBlogs({ page: 1, create_new_arr: true });
    fetchUsers();
  }, [query]);

  const resetState = () => {
    setBlogs(null);
    setUsers(null);
  };

  return (
    <>
      <section className="h-cover flex justify-center gap-10">
        <div className="w-full">
          <InpageNavigation
            routes={[`Search Results from "${query}"`, "Account Matched"]}
            defaultHidden={["Account Matched"]}
          >
            <>
              {blogs == null ? (
                <Loader />
              ) : blogs.results.length ? (
                blogs.results.map((blog, i) => {
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
              <LoadMoreData state={blogs} fetchDataFun={searchBlogs} />
            </>
          </InpageNavigation>
        </div>
      </section>
    </>
  );
};

export default SearchPage;
