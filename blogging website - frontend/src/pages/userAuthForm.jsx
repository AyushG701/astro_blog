import React, { useContext, useRef } from "react";
import Input from "../components/Input";
import googleIcon from "../imgs/google.png";
import { Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";
const UserAuthForm = ({ type }) => {
  // const authForm = useRef(); // used to reference and used to access the form data
  // making request to the server through axios
  let {
    userAuth: { access_token },
    setUserAuth,
  } = useContext(UserContext);

  console.log(access_token);

  const userAuthThroughServer = (serverRoute, formData) => {
    console.log(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData);
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
      .then(({ data }) => {
        // response:{
        //   data
        // }this response data is what we are getting
        // console.log(data);
        storeInSession("user", JSON.stringify(data));
        setUserAuth(data);
        console.log(sessionStorage);
      })
      .catch(({ response }) => {
        toast.error(response.data.error);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let serverRoute = type == "sign_in" ? "/signin" : "/signup";

    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
    let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password
    //formData
    let form = new FormData(formElement); // here authForm.current gives html tags and formdata gives the input data
    let formData = {};

    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }
    console.log(formData);
    // descruting the form data and testing for verification
    let { fullname, email, password } = formData;
    // form validation same as backend

    if (fullname) {
      if (fullname.length < 3) {
        return toast.error("Fullname must be at least 3 characters long");
      }
    }
    if (!email.length) {
      return toast.error("Please enter a valid email address");
    }
    if (!emailRegex.test(email)) {
      return toast.error("Email is invalid");
    }
    if (!passwordRegex.test(password)) {
      return toast.error(
        "Password must be at least 6 characters long and less than 20 characters long and must contain at least 1 numeric, 1 lowercase, and 1 uppercase character",
      );
    }
    userAuthThroughServer(serverRoute, formData);
  };
  return access_token ? (
    <Navigate to="/" />
  ) : (
    <>
      <AnimationWrapper keyValue={type}>
        <section className="h-cover flex items-center justify-center">
          {/* for the ui alert we use toaster and toast.error is replaced with all validation console.log */}
          <Toaster />
          <form id="formElement" className="w-[80%] max-w-[400px]">
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

            <button
              type="submit"
              className="btn-dark center mt-14"
              onClick={handleSubmit}
            >
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
            {type == "sign_in" ? (
              <p className="mt-6 text-dark-grey text-xl text-center">
                Don't Have a Account ?
                <Link
                  className="underline text-black text-xl ml-1"
                  to="/signup"
                >
                  Sign Up Here
                </Link>
              </p>
            ) : (
              <p className="mt-6 text-dark-grey text-xl text-center">
                Already a member ?
                <Link
                  className="underline text-black text-xl ml-1"
                  to="/signin"
                >
                  Sign In Here
                </Link>
              </p>
            )}
          </form>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default UserAuthForm;
