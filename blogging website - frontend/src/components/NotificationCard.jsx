import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { getDay } from "../common/date";
import axios from "axios";
import { UserContext } from "../App";

const NotificationCard = ({
  data,
  data: { createdAt },
  index,
  notificationState,
}) => {
  let { userAuth } = useContext(UserContext);

  let {
    seen,
    comment,
    type,
    user: {
      personal_info: { profile_img, fullname, username },
    },
    blog: { title },
  } = data;

  let {
    notifications,
    notifications: { results, totalDocs },
    setNotifications,
  } = notificationState;

  const handleDelete = (comment_id, type, target) => {
    target.setAttribute("disabled", true);

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment",
        {
          _id: comment_id,
        },
        {
          headers: {
            Authorization: `Bearer ${userAuth && userAuth.access_token}`,
          },
        },
      )
      .then(() => {
        if (type === "comment") {
          results.splice(index, 1); // Corrected line
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
        console.log(err.message);
      });
  };

  return (
    <div
      className={
        "p-6 border-b border-grey  border-l-black  " +
        (!seen ? " border-l-2 " : "")
      }
    >
      <div className="flex gap-5 mb-3 ">
        <img
          src={profile_img}
          alt="loading"
          className="w-14 h-14 flex-none rounded-full "
        />

        <div className="w-full ">
          <h1 className="font-medium text-xl text-dark-grey ">
            <span className="lg:inline-block hidden capitalize">
              {fullname}
            </span>
          </h1>
          <Link className="mx-1 text-black underline" to={`/user/${username}`}>
            @{username}
          </Link>

          <span className="font-normal ">
            {type == "like" ? "Liked Your Blog" : "commented on"}
          </span>
        </div>
      </div>
      <span className="">{title}</span>

      {type != "like" ? (
        <p className=" ml-14 pl-5 font-gelasio text-xl my-5 ">
          {comment.comment}
        </p>
      ) : (
        ""
      )}

      <div className="ml-14 pl-5 mt-3 text-dark-grey flex gap-8 ">
        <p>{getDay(createdAt)}</p>

        {type != "like" ? (
          <>
            <button
              onClick={(e) => handleDelete(comment._id, "comment", e.target)}
              className="underline hover:text-black "
            >
              Delete
            </button>
          </>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default NotificationCard;
