import React, { useContext, useState } from "react";
import { UserContext } from "../App";
import toast from "react-hot-toast";
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

  const handleComment = () => {};
  return (
    <>
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
