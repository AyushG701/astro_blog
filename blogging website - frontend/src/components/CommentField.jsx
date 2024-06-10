import React, { useContext, useState } from "react";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { BlogContext } from "../pages/BlogPage";

const CommentField = ({
  action,
  index = undefined,
  replyingTo = undefined,
  setIsReplying,
}) => {
  let {
    blog,
    setTotalParentCommentLoaded,
    totalParentCommentLoaded,
    setBlog,
    blog: {
      _id,
      activity,
      activity: { total_comments, total_parent_comments },
      comments,
      // comments: { results: commentsArr },
      author: { _id: blog_author },
    },
  } = useContext(BlogContext);

  console.log(totalParentCommentLoaded);

  const [comment, setComment] = useState("");

  let {
    userAuth: { access_token, username, profile_img, fullname },
  } = useContext(UserContext);

  const handleComment = () => {
    if (!access_token) {
      return toast.error("login first to leave a comment");
    }
    if (!comment.length) {
      return toast.error("Write something to leave a comment..");
    }

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/add-comment",
        {
          _id,
          blog_author,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      )
      .then(({ data }) => {
        setComment("");
        data.commented_by = {
          personal_info: { username, profile_img, fullname },
        };

        let newCommentArr;
        data.childrenLevel = 0;
        newCommentArr = [data];
        let parentCommentIncrementval = 1;
        setBlog({
          ...blog,
          comments: { ...comments, result: newCommentArr },
          activity: {
            ...activity,
            total_comments: total_comments + 1,
            total_parent_comments:
              total_parent_comments + parentCommentIncrementval,
          },
        });
        setTotalParentCommentLoaded(
          (preVal) => preVal + parentCommentIncrementval,
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <>
      <Toaster />
      <textarea
        value={comment}
        placeholder="leave a comment"
        className="input-box text-dark-grey resize-noneh-[150px] overflow-auto"
        onChange={(e) => setComment(e.target.value)}
      ></textarea>

      <button onClick={handleComment} className="btn-dark mt-5 px-10">
        {action}
      </button>
    </>
  );
};

export default CommentField;
