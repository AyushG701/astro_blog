import React, { useContext, useState } from "react";
import { UserContext } from "../App";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { BlogContext } from "../pages/BlogPage";

// const CommentField = ({
//   action,
//   index = undefined,
//   replyingTo = undefined,
//   setIsReplying,
// }) => {
//   let {
//     blog,
//     setTotalParentCommentLoaded,
//     totalParentCommentLoaded,
//     setBlog,
//     blog: {
//       _id,
//       activity,
//       activity: { total_comments, total_parent_comments },
//       comments,
//       comments: { results: commentsArr },
//       author: { _id: blog_author },
//     },
//   } = useContext(BlogContext);

//   console.log(totalParentCommentLoaded);

//   const [comment, setComment] = useState("");

//   let {
//     userAuth: { access_token, username, profile_img, fullname },
//   } = useContext(UserContext);

//   const handleComment = () => {
//     if (!access_token) {
//       return toast.error("login first to leave a comment");
//     }
//     if (!comment.length) {
//       return toast.error("Write something to leave a comment..");
//     }

//     axios
//       .post(
//         import.meta.env.VITE_SERVER_DOMAIN + "/add-comment",
//         {
//           _id,
//           blog_author,
//           comment,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${access_token}`,
//           },
//         },
//       )
//       .then(({ data }) => {
//         setComment("");
//         data.commented_by = {
//           personal_info: { username, profile_img, fullname },
//         };

//         let newCommentArr;

//         // for the replies
//         if (replyingTo) {
//           commentsArr[index].children.push(data._id);
//           data.childrenLevel = commentsArr[index].childrenLevel + 1;

//           data.parentIndex = index;

//           commentsArr[index].isReplyLoaded = true;

//           commentsArr.splice(index + 1, 0, data);
//           newCommentArr = commentsArr;

//           setIsReplying(false);
//         } else {
//           data.childrenLevel = 0;
//           newCommentArr = [data, ...commentsArr];
//         }

//         console.log("the new comment Arr is -> ", newCommentArr);

//         let parentCommentIncrementVal = replyingTo ? 0 : 1;
//         setBlog({
//           ...blog,
//           comments: { ...comments, result: newCommentArr },
//           activity: {
//             ...activity,
//             total_comments: total_comments + 1,
//             total_parent_comments:
//               total_parent_comments + parentCommentIncrementVal,
//           },
//         });
//         setTotalParentCommentLoaded(
//           (preVal) => preVal + parentCommentIncrementVal,
//         );
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   };
//   return (
//     <>
//       <Toaster />
//       <textarea
//         value={comment}
//         placeholder="leave a comment"
//         className="input-box text-dark-grey resize-noneh-[150px] overflow-auto"
//         onChange={(e) => setComment(e.target.value)}
//       ></textarea>

//       <button onClick={handleComment} className="btn-dark mt-5 px-10">
//         {action}
//       </button>
//     </>
//   );
// };

// export default CommentField;

// import { useState, useContext } from "react";
// import { Toaster, toast } from "react-hot-toast";
// import { UserContext } from "../App";
// import { BlogContext } from "../pages/Blog";
// import axios from "axios";

const CommentField = ({
  action,
  index = undefined,
  replyingTo = undefined,
  setIsReplying,
}) => {
  const [comment, setComment] = useState("");

  let {
    userAuth: { access_token, username, profile_img, fullname },
  } = useContext(UserContext);

  let {
    blog,
    blog: {
      _id,
      comments,
      comments: { results: commentsArr },
      author: { _id: blog_author },
      activity,
      activity: { total_comments, total_parent_comments },
    },
    setBlog,
    setTotalParentCommentsLoaded,
  } = useContext(BlogContext);

  const handleComment = () => {
    if (!access_token) {
      return toast.error("Login to leave a comment");
    }
    if (!comment.length) {
      return toast.error("Write something to leave a comment");
    }
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/add-comment",
        {
          _id,
          blog_author,
          comment,
          replying_to: replyingTo,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      )
      .then(({ data }) => {
        console.log(data);
        setComment("");
        data.commented_by = {
          personal_info: {
            username,
            profile_img,
            fullname,
          },
          _id: data.user_id,
        };
        setIsReplying ? setIsReplying(false) : "";
        let newCommentArr;

        if (replyingTo) {
          commentsArr[index].children.push(data._id);
          data.childrenLevel = commentsArr[index].childrenLevel + 1;
          data.parentIndex = index;
          commentsArr[index].isRepliesLoaded = true;
          commentsArr.splice(index + 1, 0, data);
          newCommentArr = commentsArr;
          setIsReplying(false);
        } else {
          data.childrenLevel = 0;
          newCommentArr = [data, ...commentsArr];
        }
        setBlog({
          ...blog,
          comments: {
            ...comments,
            results: newCommentArr,
          },
          activity: {
            ...activity,
            total_comments: total_comments + 1,
            total_parent_comments: total_parent_comments + 1,
          },
        });
        setTotalParentCommentsLoaded((preVal) => preVal + 1);
      })
      .catch((error) => {
        if (error.response) {
          // Server responded with a status other than 2xx
          console.log("Response error:", error.response.data);
          if (error.response.status === 403) {
            toast.error(error.response.data.error);
          }
        } else if (error.request) {
          // Request was made but no response received
          console.log("Request error:", error.request);
        } else {
          // Something else happened while setting up the request
          console.log("Error:", error.message);
        }
      });
  };

  return (
    <>
      <Toaster />
      <textarea
        placeholder="Leave a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
      />
      <button onClick={handleComment} className="btn-dark mt-5 px-10">
        {action}
      </button>
    </>
  );
};

export default CommentField;
