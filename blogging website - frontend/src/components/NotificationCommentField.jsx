import { useState, useContext } from "react";
import { Toaster, toast } from "react-hot-toast";
import { UserContext } from "../App";
import axios from "axios";

const NotificationCommentField = ({
  _id,
  blog_author,
  index = undefined,
  replyingTo = undefined,
  setReplying,
  notification_id,
  notificationData,
}) => {
  const [comment, setComment] = useState();

  let { _id: user_id } = blog_author;
  let {
    userAuth: { access_token },
  } = useContext(UserContext);
  let {
    notifications,
    notifications: { results },
    setNotifications,
  } = notificationData;

  const handleComment = () => {
    if (!comment.length) {
      return toast.error("Write something to leave a comment");
    }

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/add-comment",
        {
          _id,
          blog_author: user_id,
          comment,
          replying_to: replyingTo,
          notification_id,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      )
      .then(({ data }) => {
        // console.log(data);
        if (setReplying) {
          setReplying(true);
        }
        results[index].reply = { comment, _id: data._id };
        setNotifications({ ...notifications, results });
      })
      .catch(({ response }) => {
        if (response.status === 403) {
          return toast.error(response.data.error);
        }
      });
  };

  return (
    <>
      <Toaster />
      <textarea
        placeholder="Leave a comment..."
        onChange={(e) => setComment(e.target.value)}
        className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
      />
      <button onClick={handleComment} className="btn-dark mt-5 px-10">
        Reply
      </button>
    </>
  );
};

export default NotificationCommentField;
