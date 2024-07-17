import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";
import NotificationCard from "../components/NotificationCard";
import AnimationWrapper from "../common/page-animation";
import NoDataMessage from "../components/NoDataMessage";
import LoadMoreData from "../components/LoadMoreData";
import Loader from "../components/Loader";
import axios from "axios";

const Notifications = () => {
  let {
    userAuth: { access_token, new_notificaiton_available },
  } = useContext(UserContext);
  const [notifications, setNotifications] = useState(null);

  const [filter, setFilter] = useState("all");
  let filters = ["all", "like", "comment", "reply"];

  const fetchNotifications = ({ page, deletedDocCount = 0 }) => {
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/notifications",
        {
          page,
          filter,
          deletedDocCount,
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      )
      .then(async ({ data: { notifications: data } }) => {
        console.log(data);
        if (new_notificaiton_available) {
          setUserAuth({ ...userAuth, new_notificaiton_available: false });
        }
        let formatedData = await filterPaginationData({
          state: notifications,
          data,
          page,
          countRoute: "/all-notifications-count",
          data_to_send: { filter },
          user: access_token,
        });
        setNotifications(formatedData);
        console.log(formatedData);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (access_token) {
      fetchNotifications({ page: 1 });
    }
  }, [access_token, filter]);

  const handleFilter = (e) => {
    let btn = e.target;

    setFilter(btn.innerHTML);
    setNotifications(null);
  };
  return (
    <div>
      <div>
        <h1 className="max-md:hidden ">Recent Notification</h1>

        <div className="my-8 flex gap-6 ">
          {filters.map((item, index) => {
            return (
              <button
                onClick={handleFilter}
                className={
                  "py-2 " + (filter == item ? " btn-dark " : " btn-light")
                }
                key={index}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {notifications === null ? (
        <Loader />
      ) : (
        <>
          {notifications.results.length ? (
            notifications.results.map((noti, i) => {
              return (
                <AnimationWrapper transition={{ delay: i * 0.08 }} key={i}>
                  <NotificationCard
                    data={noti}
                    index={i}
                    notificationData={{ notifications, setNotifications }}
                  />
                </AnimationWrapper>
              );
            })
          ) : (
            <NoDataMessage message={"nothing available"} />
          )}

          <LoadMoreData
            state={notifications}
            fetchDataFun={fetchNotifications}
            additionalParams={{
              deletedDocCount: notifications.deletedDocCount,
            }}
          />
        </>
      )}
    </div>
  );
};

export default Notifications;
