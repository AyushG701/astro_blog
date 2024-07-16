import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { getDay } from "../common/date";
import NotificationCommentField from "./NotificationCommentField";
import axios from "axios";

const NotificationCard = ({ data, index, notificationData }) => {
  const [isReplying, setIsReplying] = useState(false);

  let {
    type,
    seen,
    comment,
    reply,
    replied_on_comment,
    createdAt,
    blog: { blog_id, title, _id },
    user,
    user: {
      personal_info: { fullname, username, profile_img },
    },
    _id: notification_id,
  } = data;
  let {
    userAuth,
    userAuth: {
      username: author_username,
      access_token,
      profile_img: author_profile_img,
    },
  } = useContext(UserContext);
  console.log(userAuth);

  let {
    notifications,
    notifications: { results: totalDocs },
    setNotifications,
  } = notificationData;

  const handleReplyClick = () => {
    setIsReplying((preVal) => !preVal);
  };

  const handleDelete = (comment_id, type, e) => {
    const target = e.currentTarget;

    // console.log(comment_id, type, e);
    target.setAttribute("disabled", true);
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment",
        { _id: comment_id },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      )
      .then((results) => {
        if (type === "comment") {
          results.splice(index, 1);
        } else {
          delete results[index].reply;
        }
        target.removeAttribute("disabled");
        setNotifications({
          ...notifications,
          results,
          totalDocs: totalDocs - 1,
          deletedDocCount: notifications.deletedDocCount + 1,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div
      className={
        "p-6 border-b border-grey border-l-black " + (!seen ? "border-l-2" : "")
      }
    >
      <div className="flex gap-5 mb-3">
        <img
          src={profile_img}
          alt="Profile image"
          className="w-14 h-14 flex-none rounded-full"
        />
        <div className="w-full">
          <h1 className="font-medium text-xl text-dark-grey">
            <span className="lg:inline-block hidden capitalize">
              {fullname}
            </span>
            <Link
              to={`/user/${username}`}
              className="mx-1 text-black underline"
            >
              @{username}
            </Link>
            <span className="font-normal">
              {type === "like"
                ? "liked your blog"
                : type === "comment"
                ? "commented on"
                : "replied on"}
            </span>
          </h1>
          {type === "reply" ? (
            <div className="p-4 mt-4 rounded-md bg-grey">
              <p>{replied_on_comment.comment}</p>
            </div>
          ) : (
            <Link
              to={`/blog/${blog_id}`}
              className="font-medium text-dark-grey hover:underline line-clamp-1"
            >
              {`"${title}"`}
            </Link>
          )}
        </div>
      </div>
      {type !== "like" && (
        <p className="ml-14 pl-5 font-gelasio text-xl my-5">
          {comment.comment}
        </p>
      )}
      <div className="ml-14 pl-5 mt-3 text-dark-grey flex gap-8">
        <p>{getDay(createdAt)}</p>
        {type !== "like" && (
          <>
            <button
              onClick={handleReplyClick}
              className={
                "underline hover:text-black " + (reply ? "hidden" : "")
              }
            >
              Reply
            </button>
            {type === "comment" && (
              <button
                onClick={(e) => handleDelete(comment._id, "comment", e)}
                className="underline hover:text-black"
              >
                Delete
              </button>
            )}
          </>
        )}
      </div>
      {isReplying && (
        <div className="mt-8">
          <NotificationCommentField
            _id={_id}
            blog_author={user}
            index={index}
            replyingTo={comment._id}
            setIsReplying={setIsReplying}
            notification_id={notification_id}
            notificationData={notificationData}
          />
        </div>
      )}
      {reply && (
        <div className="ml-20 p-5 bg-grey mt-5 rounded-md">
          <div className="flex gap-3 mb-3">
            <img
              src={author_profile_img}
              alt="Author profile image"
              className="w-8 h-8 rounded-full"
            />
            <div>
              <h1 className="font-medium text-xl text-dark-grey">
                <Link
                  to={`/user/${author_username}`}
                  className="mx-1 text-black underline"
                >
                  @{author_username}
                </Link>
                <span className="font-normal">replied to</span>
                <Link
                  to={`/user/${username}`}
                  className="mx-1 text-black underline"
                >
                  @{username}
                </Link>
              </h1>
            </div>
          </div>
          <p className="ml-14 font-gelasio text-xl my-2">{reply.comment}</p>
          <button
            onClick={() => handleDelete(reply._id, "reply")}
            className="underline hover:text-black ml-14 mt-2 text-dark-grey"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationCard;
