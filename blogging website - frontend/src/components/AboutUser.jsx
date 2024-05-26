import React from "react";
import { Link } from "react-router-dom";
import { getFullDay } from "../common/date";

const AboutUser = ({ bio, social_links, joinedAt, className }) => {
  console.log(
    Object.keys(social_links).map((key) => {
      return console.log(social_links[key]);
    }),
  );

  return (
    <div className={"md:w-[90%] md:mt-7 " + className}>
      <p className="text-xl leading-7 text-blue-700">
        {bio.length ? bio : "nothing to read here"}
      </p>

      <div className="flex gap-x-7 gap-y-2 flex-wrap my-7 items-center text-dark-grey">
        {Object.keys(social_links).map((key, i) => {
          let link = social_links[key];
          return link ? (
            <Link target="_blank" key={key} to={link}>
              {key == "website" ? (
                <i class="fa-solid fa-globe text-2xl hover:text-black"></i>
              ) : (
                <i
                  className={`fa-brands fa-${key} text-2xl hover:text-black`}
                ></i>
              )}
            </Link>
          ) : (
            " "
          );
        })}
      </div>
      <p>{getFullDay(joinedAt)}</p>
    </div>
  );
};

export default AboutUser;
