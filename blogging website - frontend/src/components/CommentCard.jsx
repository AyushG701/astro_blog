import React, { useContext, useState } from "react";
import { getDay } from "../common/date";
import { UserContext } from "../App";
import toast from "react-hot-toast";
import CommentField from "./CommentField";
import { BlogContext } from "../pages/BlogPage";
import axios from "axios";

const CommentCard = ({ index, leftVal, commentData }) => {
  // console.log("the data is in card is ",commentData);

  console.log("the left val is ", leftVal);

  let {
    commented_by: {
      personal_info: { profile_img, fullname, username: commented_by_username },
    },
    commentedAt,
    comment,
    _id,
    children,
  } = commentData;

  let {
    blog: {
      comments,
      activity,
      activity: { total_parent_comments },
      comments: { results: commentsArr },
      author: {
        personal_info: { username: blog_author },
      },
    },
    blog,
    setBlog,
    setTotalParentCommentLoaded,
  } = useContext(BlogContext);

  let {
    userAuth: { access_token, username },
  } = useContext(UserContext);

  const [isReplying, setIsReplying] = useState(false);

  const handleReply = () => {
    if (!access_token) {
      return toast.error("please login first to reply");
    }
    setIsReplying((preVal) => !preVal);
  };

  const getParentIndex = () => {
    let startingPoint = index - 1;

    try {
      while (
        commentsArr[startingPoint].childrenLevel >= commentData.childrenLevel
      ) {
        startingPoint--;
      }
    } catch (error) {
      startingPoint = undefined;
    }

    return startingPoint;
  };

  const removedComentcard = (startPoint, isDelete = false) => {
    if (commentsArr[startPoint]) {
      while (
        commentsArr[startPoint].childrenLevel > commentData.childrenLevel
      ) {
        commentsArr.splice(startPoint, 1);

        if (commentsArr[startPoint]) {
          break;
        }
      }
    }

    if (isDelete) {
      let parenIndex = getParentIndex();

      if (parenIndex != undefined) {
        commentsArr[parenIndex].children = commentsArr[
          parenIndex
        ].children.filter((child) => child != _id);

        if (commentsArr[parenIndex].children.length) {
          commentsArr[parenIndex].isReplyLoaded = false;
        }
      }

      commentsArr.splice(index, 1);
    }

    if (commentData.childrenLevel == 0 && isDelete) {
      setTotalParentCommentLoaded((preval) => preval - 1);
    }

    setBlog({
      ...blog,
      comments: { results: commentsArr },
      activity: {
        ...activity,
        total_parent_comments:
          total_parent_comments -
          (commentData.childrenLevel == 0 && isDelete ? 1 : 0),
      },
    });
  };
  const hideReply = () => {
    commentData.isReplyLoaded = false;
    removedComentcard(index + 1);
  };

  const loadreply = ({ skip = 0 }) => {
    if (children.length) {
      hideReply();

      axios
        .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-replies", {
          _id,
          skip,
        })
        .then(({ data: { replies } }) => {
          commentData.isReplyLoaded = true;

          for (let i = 0; i < replies.length; i++) {
            replies[i].childrenLevel = commentData.children + 1;

            commentsArr.splice(index + 1 + i + skip, 0, replies[i]);
          }

          setBlog({ ...blog, comments: { ...comments, results: commentsArr } });
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  };

  const deleteComment = (e) => {
    e.target.setAttribute("disabled", true);
    let deleting = toast("deleteing comment");

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment",
        {
          _id,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      )
      .then(() => {
        e.target.removeAttribute("disable");

        removedComentcard(index + 1, true);

        toast.dismiss(deleting);
        toast.success("deleted");
      })
      .catch((err) => {
        console.log(err.message);
      });
  };
  return (
    <div>
      <div className="w-full" style={{ paddingLeft: `${leftVal * 10}px` }}>
        <div className="my-5 p-6 rounded-md border border-grey ">
          <div className="flex gap-3 items-center mb-8 ">
            <img className="w-6 h-6 rounded-full" src={profile_img} />
            <p className="line-clamp-1 ">
              {fullname} @ {commented_by_username}{" "}
            </p>
            <p className="min-w-fit">{getDay(commentedAt)}</p>
          </div>
          <p className="font-gelasio">{comment}</p>
          <div className="flex gap-5 text-xl mt-5 ">
            {/* {
              commentData.isReplyLoaded ? 
              <button onClick={hideReply} className='text-dark-grey p-2 pz-3 hover:bg-grey/30 rounded-md flex items-center gap-2 '>
                <i class="fa-regular fa-comment"></i>
                Hide Reply

              </button>
              :
              <button onClick={loadreply}  className='text-dark-grey p-2 pz-3 hover:bg-grey/30 rounded-md flex items-center gap-2 '>
              <i class="fa-regular fa-comment"></i>{
                children.length
              }
               Reply

            </button>
            } */}

            {/* <button className='underline' onClick={handleReply}>Reply</button> */}

            {username == commented_by_username || username == blog_author ? (
              <button
                onClick={deleteComment}
                className="p-2 px-3 rounded-md border border-grey ml-auto hover:bg-red/30 hover:text-red flex items-center"
              >
                <i class="fa-solid fa-trash pointer-events-none"></i>
              </button>
            ) : (
              ""
            )}
          </div>

          {/* {
            isReplying ?
              <div className='mt-8'>
                <CommentField action={"Reply"} index={index} replyingTo={_id} setIsReplying={setIsReplying} />



              </div>
              : ""
          } */}
        </div>
      </div>
    </div>
  );
};

export default CommentCard;
