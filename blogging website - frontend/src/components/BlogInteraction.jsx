import React, { useContext, useEffect, useState } from "react";
import { BlogContext } from "../pages/BlogPage";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import { FaComment, FaHeart } from "react-icons/fa";
import { FaRegHeart } from "react-icons/fa";
import axios from "axios";

const BlogInteraction = () => {
  let {
    blog,
    blog: {
      _id,
      title,
      blog_id,
      activity,
      activity: { total_likes, total_comments },
      author: {
        personal_info: { username: author_username },
      },
    },
    setBlog,
    isLikedByUser,
    setIsLikedByUser,
    setCommentWrapper,
    commentWrapper,
  } = useContext(BlogContext);

  let {
    userAuth: { username, access_token },
  } = useContext(UserContext);

  useEffect(() => {
    if (access_token) {
      axios
        .post(
          import.meta.env.VITE_SERVER_DOMAIN + "/isliked-by-user",
          {
            _id,
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          },
        )
        .then(({ data: { result } }) => {
          setIsLikedByUser(Boolean(result));
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  }, []);

  const handleLike = () => {
    console.log("handlelike");
    if (access_token) {
      setIsLikedByUser((currentVal) => !currentVal);
      !isLikedByUser ? total_likes++ : total_likes--;
      setBlog({ ...blog, activity: { ...activity, total_likes } });

      axios
        .post(
          import.meta.env.VITE_SERVER_DOMAIN + "/like-blog",
          {
            _id,
            isLikedByUser,
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          },
        )
        .then(({ data }) => {
          console.log(data);
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      toast.error("Please login to like this blog");
    }
  };

  return (
    <>
      <Toaster />
      <hr className="border border-grey my-2 " />
      <div className="flex gap-6 justify-between">
        <div className="flex gap-3 items-center">
          <button
            onClick={handleLike}
            className={
              "w-10 h-10 rounded-full flex items-center justify-center " +
              (isLikedByUser ? "bg-red/20 text-red" : "bg-grey/80")
            }
          >
            {isLikedByUser ? <FaHeart /> : <FaRegHeart />}
          </button>
          <p className="text-xl text-dark-grey">{total_likes}</p>

          <button
            onClick={() => setCommentWrapper((preval) => !preval)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80"
          >
            <FaComment />
          </button>
          <p className="text-xl text-dark-grey">{total_comments}</p>
        </div>

        <div className="flex gap-6 items-center">
          {/* logged in user to edit their post if signed in thier profile */}
          {username == author_username ? (
            <Link
              className="underline hover:text-purple"
              to={`/editor/${blog_id}`}
            >
              Edit
            </Link>
          ) : (
            ""
          )}

          <Link
            to={`https://twitter.com/intent/tweet?text=Read${title}&url=${location.href}`}
          >
            <i className="fa-brands fa-twitter text-xl hover:text-twitter"></i>
          </Link>
        </div>
      </div>

      <hr className="border border-grey my-2" />
    </>
  );
};

export default BlogInteraction;
