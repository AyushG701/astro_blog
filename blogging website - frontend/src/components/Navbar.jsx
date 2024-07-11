import React, { useState, useContext } from "react";
import logo from "../imgs/logo.png";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { UserContext } from "../App";
import UserNavigation from "./UserNavigation";

const Navbar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [userNavPannel, setUserNavPannel] = useState(false);

  let navigate = useNavigate();
  const {
    userAuth,
    userAuth: { access_token, profileimg },
  } = useContext(UserContext);

  const handleNavPannel = () => {
    setUserNavPannel((currentVal) => !currentVal);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setUserNavPannel(false);
    }, 300);
  };
  // to handle searching
  const handleSearch = (e) => {
    let query = e.target.value;

    if (e.keyCode == 13 && query.length) {
      navigate(`/search/${query}`);
    }
  };

  return (
    <>
      <nav className="navbar z-50">
        {/* logo */}
        <Link to="/" className="flex-none w-10">
          <img src={logo} alt="" />
        </Link>
        {/* search bar  (hidden in mobile format)*/}
        <div
          className={
            "absolute bg-white w-full left-0 top-full mt-0 border-b border-grey py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:show " +
            (isVisible ? "show" : "hide")
          }
        >
          <input
            type="text"
            placeholder="Search "
            className="w-full md:w-auto bg-grey p-4 pl-6 pr-[12%] md:pr-6 rounded-full placeholder:text-dark-grey md:pl-12 "
            onKeyDown={handleSearch}
          />
          <i className="fi fi-rr-search absolute right-[10%] md:pointer-events-none md:left-5 top-1/2 -translate-y-1/2 text-xl text-dark-grey" />
        </div>

        {/* search bar icon when in mobile format */}
        <div className="flex items-center gap-3 md:gap-6 ml-auto">
          <button
            type="button"
            onClick={() => setIsVisible((currentVal) => !currentVal)}
            className="md:hidden bg-grey w-12 h-12 rounded-full flex items-center justify-center"
          >
            <i className="fi fi-rr-search md:hidden text-2xl bg-grey w-12 h-12 rounded-full flex items-center justify-center" />
          </button>
        </div>
        {/* edit and write or post */}
        <Link to="/editor" className="hidden md:flex gap-2 link rounded-md">
          <i className="fi fi-rr-file-edit" />
          <span>Write</span>
        </Link>
        {access_token ? (
          <>
            <Link to="/dashboard/notification">
              <button className="w-12 h-12 rounded-full bg-grey relative hover:bg-black/10 ">
                <i className="fi fi-rr-bell text-2xl block mt-1" />
              </button>
            </Link>
            <div className="relative" tabIndex={0}>
              <button
                onClick={handleNavPannel}
                onBlur={handleBlur}
                className="w-12 h-12 mt-1"
              >
                <img
                  src={profileimg}
                  alt="Profile image"
                  className="w-full h-full object-cover rounded-full"
                />
                {console.log(profileimg)}
              </button>
              {userNavPannel ? <UserNavigation /> : ""}
            </div>
          </>
        ) : (
          <>
            {/* sign in or sign out bar */}
            <Link to="/signin" className="btn-dark py-2">
              Sign In
            </Link>
            <Link to="/signup" className="btn-light py-2 hidden md:block">
              Sign Up
            </Link>
          </>
        )}
      </nav>
      {/* outlet is required for the nested route in app section */}
      <Outlet />
    </>
  );
};

export default Navbar;
