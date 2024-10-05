import React, { useContext, useEffect, useRef, useState } from "react";
import { Navigate, NavLink, Outlet } from "react-router-dom";
import { UserContext } from "../App";

const SideNav = () => {
  let page = location.pathname.split("/")[2] || "blogs";
  let [pageState, setPageState] = useState(page.replace("-", " "));
  let [showSideNav, setShowSideNav] = useState(page.replace("-", " "));

  let {
    userAuth: { access_token, new_notifications_available },
  } = useContext(UserContext);

  const changePageState = (e) => {
    let { offsetWidth, offsetLeft } = e.target;

    activeTabLine.current.style.width = offsetWidth + "px";
    activeTabLine.current.style.left = offsetLeft + "px";

    if (e.target == dashboardNavIcon.current) {
      setShowSideNav(true);
    } else {
      setShowSideNav(false);
    }
  };

  let activeTabLine = useRef();
  let dashboardNavIcon = useRef();
  let dashboardActiveTabBtn = useRef();

  useEffect(() => {
    setShowSideNav(false);
    dashboardActiveTabBtn.current.click();
  }, [pageState]);
  return access_token === null ? (
    <Navigate to={"/signin"} />
  ) : (
    <>
      <section className="relative flex gap-10 py-0 m-0 max-md:flex-col">
        <div className="sticky top-[80px] z-30">
          <div className="md:hidden bg-white py-1 border-b border-grey flex flex-nowrap overflow-x-auto">
            <button
              ref={dashboardNavIcon}
              onClick={changePageState}
              className="p-5 capitalize"
            >
              <i className="fi fi-br-bars-staggered pointer-events-none" />
            </button>
            <button
              ref={dashboardActiveTabBtn}
              onClick={changePageState}
              className="p-5 capitalize"
            >
              {pageState}
            </button>
            <hr
              ref={activeTabLine}
              className="absolute bottom-0 duration-500"
            />
          </div>
          <div
            className={
              "min-w-[200px] h-[calc(100vh-80px-65px)]  md:h-cover md:sticky top-24 overflow-y-auto p-6 md:pr-0 md:border-grey md:border-r absolute max-md:top-[64px] bg-white max-md:w-[calc(100%+80px)] max-md:px-16 max-md:-ml-7 duration-500 " +
              (!showSideNav
                ? "max-md:opacity-0 max-md:pointer-events-none"
                : "opacity-100 pointer-events-auto")
            }
          >
            <h1 className="text-xl text-dark-grey mb-3">Dashboard</h1>
            <hr className="border-grey -ml-6 mb-8 mr-6" />
            <NavLink
              to="/dashboard/blogs"
              onClick={(e) => setPageState(e.target.innerText)}
              className="sidebar-link"
            >
              <i className="fi fi-rr-document" />
              Blogs
            </NavLink>
            <NavLink
              to="/dashboard/notifications"
              onClick={(e) => setPageState(e.target.innerText)}
              className="sidebar-link"
            >
              <div className="relative">
                <i className="fi fi-rr-bell" />
                {new_notifications_available && (
                  <span className="bg-red w-2 h-2 rounded-full absolute z-10 top-0 right-0" />
                )}
              </div>
              Notifications
            </NavLink>
            <NavLink to="/editor" className="sidebar-link">
              <i className="fi fi-rr-file-edit" />
              Write
            </NavLink>
            <h1 className="text-xl text-dark-grey mt-20 mb-3">Settings</h1>
            <hr className="border-grey -ml-6 mb-8 mr-6" />
            <NavLink
              to="/settings/edit-profile"
              onClick={(e) => setPageState(e.target.innerText)}
              className="sidebar-link"
            >
              <i className="fi fi-rr-user" />
              Edit Profile
            </NavLink>
            <NavLink
              to="/settings/change-password"
              onClick={(e) => setPageState(e.target.innerText)}
              className="sidebar-link"
            >
              <i className="fi fi-rr-lock" />
              Change Password
            </NavLink>
          </div>
        </div>
        <div className="max-md:-mt-8 mt-5 w-full">
          <Outlet />
        </div>
      </section>
    </>
  );
};

export default SideNav;
