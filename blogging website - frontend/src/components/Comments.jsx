import React, { useContext } from "react";

import CommentField from "./CommentField";
import axios from "axios";
import NoDataMessage from "./NoDataMessage";
import AnimationWrapper from "../common/page-animation";
import CommentCard from "./CommentCard";
import { BlogContext } from "../pages/BlogPage";

export const fetchComments = async ({
  skip = 0,
  blog_id,
  setParentCommentCountFun,
  comment_array = null,
}) => {
  console.log(comment_array);

  let res;

  await axios
    .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog-comments", {
      blog_id,
      skip,
    })
    .then(({ data }) => {
      console.log("the data in common in ", data.comment);
      let { comment } = data;
      comment.map((comment) => {
        comment.childrenLevel = 0;
      });

      setParentCommentCountFun((preVal) => preVal + data.comment.length);

      if (comment_array == null) {
        res = { results: data.comment };
      } else {
        res = {
          results: [...comment_array, ...data.comment],
        };
      }
    });

  console.log(res);
  return res;
};

const CommentContainer = () => {
  // let {

  //   blog,
  //   blog: {
  //     _id,
  //     title,
  //     comments,
  //     comments: { results: commentsArr },
  //     activity: { total_parent_comments },
  //   },
  //   commentWrapper,
  //   setCommentWrapper,
  //   totalParentCommentLoaded,
  //   setTotalParentCommentLoaded,
  //   setBlog,
  // } = useContext(BlogContext);

  // console.log("the comments", comments);
  // console.log("the rotal parent loade ", totalParentCommentLoaded);
  // console.log("abcd", commentsArr);

  // const loadMore = async () => {
  //   let newCommentArr = await fetchComments({
  //     skip: totalParentCommentLoaded,
  //     blog_id: _id,
  //     setParentCommentCountFun: setTotalParentCommentLoaded,
  //     comment_array: commentsArr,
  //   });

  //   console.log("imp", blog);
  //   console.log("the important new arr a", newCommentArr);
  //   setBlog({ ...blog, comments: newCommentArr });
  // };

  // return (
  //   <div
  //     className={
  //       "max-sm:w-full fixed z-10 " +
  //       (commentWrapper
  //         ? "top-0 sm: right-[0] "
  //         : " top-[100%] sm:right-[-100%] ") +
  //       " duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full bg-white shadow-xl p-8 px-10 overflow-y-auto overflow-x-hidden "
  //     }
  //   >
  //     <div className="relative">
  //       <h1 className="text-xl font-medium ">Comments</h1>
  //       <p className="text-lg text-dark-grey line-clamp-1">{title}</p>

  //       <button
  //         onClick={() => setCommentWrapper((preval) => !preval)}
  //         className="absolute top-0 right-0 flex justify-center items-center w-12 h-12 rounded-full bg-grey"
  //       >
  //         <i className="fa-solid fa-x text-2xl mt-1 "></i>
  //       </button>
  //     </div>

  //     <hr className="border border-grey w-[120%] my-8" />
  //     <CommentField action={"comment"} />

  //     {commentsArr && commentsArr.length ? (
  //       commentsArr.map((comment, i) => {
  //         return (
  //           <AnimationWrapper key={i}>
  //             <CommentCard
  //               index={i}
  //               leftVal={comment.childrenLevel * 4}
  //               commentData={comment}
  //             />
  //           </AnimationWrapper>
  //         );
  //       })
  //     ) : (
  //       <NoDataMessage message={"no comments here"} />
  //     )}

  //     {total_parent_comments > totalParentCommentLoaded ? (
  //       <button
  //         onClick={loadMore}
  //         className="text-dark-grey p-2 px-5 hover:bg-grey/30 rounded-md flex items-center gap-2"
  //       >
  //         Load More
  //       </button>
  //     ) : (
  //       ""
  //     )}
  //   </div>
  // );

  let {
    commentWrapper,
    setCommentWrapper,
    blog,
    blog: {
      _id,
      title,
      comments: { results: commentsArr },
      activity: { total_parent_comments },
    },
    totalParentCommentsLoaded,
    setTotalParentCommentsLoaded,
    setBlog,
  } = useContext(BlogContext);

  const loadMoreComments = async () => {
    let newCommentsArr = await fetchComments({
      skip: totalParentCommentsLoaded,
      blog_id: _id,
      setParentCommentCountFunc: setTotalParentCommentsLoaded,
      arr: commentsArr,
    });
    setBlog({
      ...blog,
      comments: newCommentsArr,
    });
  };

  return (
    <div
      className={`max-sm:w-full fixed ${
        commentWrapper ? "top-0 sm:right-0" : "top-[100%] sm:right-[-100%]"
      } duration-700 max-sm:right-0 sm:top-0 w-[30%] min-w-[350px] h-full z-50 bg-white shadow-2xl p-8 px-10 overflow-y-auto overflow-x-hidden`}
    >
      <div className="relative">
        <h1 className="text-xl font-medium">Comments</h1>
        <p className="text-lg mt-2 w-[70%] text-dark-grey line-clamp-1">
          {title}
        </p>
        <button
          onClick={() => setCommentWrapper(false)}
          className="absolute top-0 right-0 flex justify-center items-center w-12 h-12 rounded-full bg-grey"
        >
          <i className="fi fi-br-cross-small text-2xl mt-1" />
        </button>
      </div>
      <hr className="border-grey my-8 w-[120%] -ml-10" />
      <CommentField action="Comment" />
      {commentsArr && commentsArr.length ? (
        commentsArr.map((item, i) => (
          <AnimationWrapper key={i}>
            <CommentCard
              index={i}
              leftVal={item.childrenLevel * 4}
              commentData={item}
            />
          </AnimationWrapper>
        ))
      ) : (
        <NoDataMessage message="No comments" />
      )}
      {total_parent_comments > totalParentCommentsLoaded && (
        <button
          onClick={loadMoreComments}
          className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default CommentContainer;
