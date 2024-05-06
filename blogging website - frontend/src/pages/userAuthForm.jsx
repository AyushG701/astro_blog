import React from "react";
import Input from "../components/Input";
import googleIcon from "../imgs/google.png";
import { Link } from "react-router-dom";
const UserAuthForm = ({ type }) => {
  return (
    <>
      <section className="h-cover flex items-center justify-center">
        <form id="authForm" className="w-[80%] max-w-[400px]">
          <h1 className="text-4xl font-gelasio text-center mb-16">
            {type === "sign_in" ? "Welcome back" : "Sign up today"}
          </h1>

          {type !== "sign_in" ? (
            <Input
              name="fullname"
              type="text"
              placeholder="Full name"
              icon="fi-rr-user"
            />
          ) : (
            ""
          )}
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="Email"
            icon="fi-rr-envelope"
          />

          <Input
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            icon="fi-rr-key"
          />

          <button type="submit" className="btn-dark center mt-14">
            {type.replace("_", " ")}
          </button>

          {/* sign in with google */}
          <div className="relative w-full flex items-center gap-2 my-8 opacity-10 uppercase text-black font-bold ">
            <hr className="w-1/2 " />
            <p>or</p>
            <hr className="w-1/2 " />
          </div>
          <button className="btn-dark flex gap-4 w-[90%] m-auto items-center justify-center ">
            <img className="w-5 " src={googleIcon} alt="" />
            Continue With Google
          </button>

          {/* sign up if not sign in in signin page */}
          {type == "sign-in" ? (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Don't Have a Account ?
              <Link className="underline text-black text-xl ml-1" to="/signup">
                Sign Up Here
              </Link>
            </p>
          ) : (
            <p className="mt-6 text-dark-grey text-xl text-center">
              Already a member ?
              <Link className="underline text-black text-xl ml-1" to="/signin">
                Sign In Here
              </Link>
            </p>
          )}
        </form>
      </section>
    </>
  );
};

export default UserAuthForm;
