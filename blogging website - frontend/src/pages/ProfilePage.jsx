import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import LoadMoreData from "../components/LoadMoreData";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/Loader";
import InpageNavigation from "../components/InPageNavigation";
import NoDataMessage from "../components/NoDataMessage";
import PageNotFound from "../pages/PageNotFound.jsx";
import { UserContext } from "../App.jsx";
import { Link } from "react-router-dom";
import AboutUser from "../components/AboutUser.jsx";
import { filterPaginationData } from "../common/filter-pagination-data.jsx";
import BlogPostCard from "../components/BlogPostCard.jsx";

export const profileDataStructure = {
  personal_info: {
    fullname: "",
    username: "",
    profile_img: "",
    bio: "",
  },
  account_info: {
    total_posts: 0,
    total_reads: 0,
  },
  social_links: {},
  joinedAt: "",
};

const ProfilePage = () => {
  let [blog, setBlog] = useState(null);
  let { id: profileId } = useParams();
  const [profile, setProfile] = useState(profileDataStructure);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState("");

  useEffect(() => {
    if (profileId != profileLoaded) {
      setBlog(null);
    }
    if (blog == null) {
      resetState();
      fetchUserProfile();
    }
  }, [profileId, blog]);

  const resetState = () => {
    setProfile(profileDataStructure);
    setBlog(null);
  };

  const fetchUserProfile = () => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-profile", {
        username: profileId,
      })
      .then(({ data: user }) => {
        console.log(user);
        if (user != null) {
          setProfile(user);
        }
        setProfileLoaded(profileId);
        setLoading(false);

        getBlog({ user_id: user._id });
      })
      .catch((err) => {
        console.log(err.message);
        setLoading(false);
      });
  };
  let {
    personal_info: { fullname, username: profile_username, profile_img, bio },
    account_info: { total_posts, total_reads },
    social_links,
    joinedAt,
  } = profile;

  let {
    userAuth: { username },
  } = useContext(UserContext);

  const getBlog = ({ page = 1, user_id }) => {
    user_id = user_id == undefined ? blog.user_id : user_id;

    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", {
        author: user_id,
        page,
      })
      .then(async ({ data }) => {
        console.log("tha data is ", data);

        let formattedData = await filterPaginationData({
          state: blog,
          data: data.blogs,
          page,
          countRoute: "/search-blogs-count",
          data_to_send: { author: user_id },
        });

        formattedData.user_id = user_id;

        setBlog(formattedData);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };
  return (
    <AnimationWrapper>
      {loading ? (
        <Loader />
      ) : profile_username.length ? (
        <section className="h-cover md:flex flex-row-reverse items-start gap-5 min-[1100px]:gap:12">
          <div className="flex flex-col max-md:items-center gap-5 min-w-[250px] md:w-[50%0 md:pl-8 md:border-l md:border-grey md:sticky md:top-[100px] md:py-10">
            <img
              src={profile_img}
              alt=""
              className="w-48 h-48 bg-grey rounded-full md:w-32 md:h-32"
            />
            <h1 className="text-2xl font-medium">@{profile_username}</h1>
            <p className="text-xl capitalize h-6 ">{fullname}</p>
            <p>
              {total_posts.toLocaleString()} Blogs -{" "}
              {total_reads.toLocaleString()} Reads
            </p>

            <div className="flex gap-4 mt-2 ">
              {profileId == username ? (
                <Link className="btn-light " to="/settings/edit-profile">
                  Edit Profile
                </Link>
              ) : (
                ""
              )}
            </div>
            <AboutUser
              className="max-md:hidden"
              bio={bio}
              social_links={social_links}
              joinedAt={joinedAt}
            />
          </div>
          {/* rendering blogs some error left to solve */}
          <div className="max-md:mt-12 w-full ">
            <InpageNavigation
              routes={["blogs Published", "About"]}
              defaultHidden={["About"]}
            >
              <>
                {blog == null ? (
                  <Loader />
                ) : blog.results.length ? (
                  blog.results.map((blog, i) => {
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
                  <NoDataMessage message="No Post Found" />
                )}

                <LoadMoreData state={blog} fetchDataFun={getBlog} />
              </>
              <AboutUser
                bio={bio}
                social_links={social_links}
                joinedAt={joinedAt}
              />
            </InpageNavigation>
          </div>
        </section>
      ) : (
        <PageNotFound />
      )}
    </AnimationWrapper>
  );
};

export default ProfilePage;
