import React, { useContext } from "react";
import logo from "../imgs/logo.png";
import lightpageNotFound from "../imgs/404-light.png";
import darkpageNotFound from "../imgs/404-dark.png";
import fullLogo from "../imgs/full-logo.png";
import { Link } from "react-router-dom";
import { ThemeContext } from "../App";

const PageNotFound = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <section className="h-cover relative p-10 flex flex-col items-center gap-10 text-center ">
      <img
        src={theme == "light" ? darkpageNotFound : lightpageNotFound}
        className="select-none border-grey w-72 aspect-square object-cover rounded"
        alt=""
      />
      <h1 className="text-4xl font-gelasio leading-7 ">Page Not Found</h1>
      <p className="text-dark-grey text-xl leading-7  ">
        Are u looking for does not exist. Head back to the{" "}
        <Link to={"/"} className="text-black underline">
          home page
        </Link>
      </p>
      <div className="mt-auto ">
        <img
          src={theme == "light" ? fullLogo : logo}
          className="h-8 object-contain block mx-auto select-none "
          alt=""
        />
        <p className="mt-5 text-dark-grey">
          Read millions of stories around the world
        </p>
      </div>
    </section>
  );
};

export default PageNotFound;
