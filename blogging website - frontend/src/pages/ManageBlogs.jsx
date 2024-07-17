import { useState, useEffect, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { UserContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";
import axios from "axios";
import InPageNavigation from "../components/InPageNavigation";
import Loader from "../components/Loader";

import NoDataMessage from "../components/NoDataMessage";
import ManageBlogCard, {
  ManageDraftBlogPost,
} from "../components/ManageBlogCard";
import AnimationWrapper from "../common/page-animation";
import LoadMoreData from "../components/LoadMoreData";

const ManageBlogs = () => {
  let activePage = useSearchParams()[0].get("tab");

  const [blogs, setBlogs] = useState(null);
  const [drafts, setDrafts] = useState(null);
  const [query, setQuery] = useState();

  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  const getBlogs = ({ page, draft, deletedDocCount = 0 }) => {
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/user-written-blogs",
        {
          page: page,
          draft,
          query,
          deletedDocCount,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      )
      .then(async ({ data }) => {
        let formattedData = await filterPaginationData({
          arr: draft ? drafts : blogs,
          data: data.blogs,
          page,
          user: access_token,
          countRoute: "/user-written-blogs-count",
          data_to_send: { draft, query },
        });
        if (draft) {
          setDrafts(formattedData);
        } else {
          setBlogs(formattedData);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (access_token) {
      if (blogs === null) {
        getBlogs({ page: 1, draft: false });
      }
      if (drafts === null) {
        getBlogs({ page: 1, draft: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access_token, blogs, drafts, query]);

  const handleSearch = (e) => {
    let searchQuery = e.target.value;
    setQuery(searchQuery);
    if (e.keyCode === 13 && searchQuery.length) {
      setBlogs(null);
      setDrafts(null);
    }
  };

  const handleChange = (e) => {
    if (!e.target.value.length) {
      setQuery("");
      setBlogs(null);
      setDrafts(null);
    }
  };

  return (
    <>
      <h1 className="max-md:hidden">Manage Blogs</h1>
      <Toaster />
      <div id="searchBox" className="relative max-md:mt-5 md:mt-8 mb-10">
        <input
          type="search"
          placeholder="Search Blogs"
          onKeyDown={handleSearch}
          onChange={handleChange}
          className="w-full bg-grey p-4 pl-12 pr-6 rounded-full placeholder:text-dark-grey"
        />
        <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey" />
      </div>
      <InPageNavigation
        routes={["Published Blogs", "Drafts"]}
        defaultActiveIndex={activePage !== "draft" ? 0 : 1}
      >
        {blogs === null ? (
          <Loader />
        ) : blogs.results.length ? (
          <>
            {blogs.results.map((blog, i) => (
              <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                <ManageBlogCard
                  blog={{ ...blog, setBlogArr: setBlogs, index: i }}
                />
              </AnimationWrapper>
            ))}
            <LoadMoreData
              state={blogs}
              fetchDataFunc={getBlogs}
              additionalParams={{
                draft: false,
                deletedDocCount: blogs.deletedDocCount,
              }}
            />
          </>
        ) : (
          <NoDataMessage message="No published blogs" />
        )}
        {drafts === null ? (
          <Loader />
        ) : drafts.results.length ? (
          <>
            {drafts.results.map((blog, i) => (
              <AnimationWrapper key={i} transition={{ delay: i * 0.04 }}>
                <ManageDraftBlogPost
                  blog={{ ...blog, setBlogArr: setDrafts, index: i }}
                />
              </AnimationWrapper>
            ))}
            <LoadMoreData
              state={drafts}
              fetchDataFunc={getBlogs}
              additionalParams={{
                draft: true,
                deletedDocCount: drafts.deletedDocCount,
              }}
            />
          </>
        ) : (
          <NoDataMessage message="No drafted blogs" />
        )}
      </InPageNavigation>
    </>
  );
};

export default ManageBlogs;
