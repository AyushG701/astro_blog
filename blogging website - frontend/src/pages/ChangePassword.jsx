import { useRef, useContext } from "react";
import { Toaster, toast } from "react-hot-toast";
import { UserContext } from "../App";
import axios from "axios";
import Input from "../components/Input";
import AnimationWrapper from "../common/page-animation";

const ChangePassword = () => {
  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  let changePasswordForm = useRef();

  const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/;

  const handleSubmit = (e) => {
    e.preventDefault();
    let form = new FormData(changePasswordForm.current);
    let formData = {};
    for (let [key, value] of form.entries()) {
      formData[key] = value;
    }

    let { currentPassword, newPassword } = formData;
    if (!currentPassword.length || !newPassword.length) {
      return toast.error("Complete the input fields");
    }
    if (
      !passwordRegex.test(currentPassword) ||
      !passwordRegex.test(newPassword)
    ) {
      return toast.error(
        "Password must be 6 to 20 characters with 1 numeric, 1 lowercase, and 1 uppercase character",
      );
    }
    e.target.setAttribute("disabled", true);
    let loadingToast = toast.loading("Updating...");
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/change-password", formData, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      })
      .then(() => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        return toast.success("Password Updated");
      })
      .catch(({ response }) => {
        toast.dismiss(loadingToast);
        e.target.removeAttribute("disabled");
        return toast.error(response.data.error);
      });
  };

  return (
    <AnimationWrapper>
      <Toaster />
      <form ref={changePasswordForm}>
        <h1 className="max-md:hidden">Change Password</h1>
        <div className="py-10 w-full md:max-w-[400px]">
          <Input
            type="password"
            name="currentPassword"
            autocomplete="current-password"
            placeholder="Current Password"
            icon="fi-rr-unlock"
            className="profile-edit-input"
          />
          <Input
            type="password"
            name="newPassword"
            placeholder="New Password"
            autocomplete="new-password"
            icon="fi-rr-unlock"
            className="profile-edit-input"
          />
          <button
            type="submit"
            onClick={handleSubmit}
            className="btn-dark px-10"
          >
            Change Password
          </button>
        </div>
      </form>
    </AnimationWrapper>
  );
};

export default ChangePassword;
