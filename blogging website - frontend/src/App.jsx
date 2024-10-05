import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import UserAuthForm from "./pages/userAuthForm.jsx";
import { createContext } from "react";
import { useState, useEffect } from "react";
import { lookInSession } from "./common/session.jsx";
import Editor from "./pages/Editor.jsx";
import HomePage from "./pages/HomePage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import PageNotFound from "./pages/PageNotFound.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import BlogPage from "./pages/BlogPage.jsx";
import SideNav from "./components/SideNav.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import EditProfilePage from "./pages/EditProfilePage.jsx";
import Notifications from "./pages/Notifications.jsx";
import ManageBlogs from "./pages/ManageBlogs.jsx";
import GoogleTagManager from "./components/GoogleTagManager.jsx";
export const UserContext = createContext({});

export const ThemeContext = createContext({});
// helps to control the dark theme as per the browser theme  preference
const darkThemePreference = () => {
  window.matchMedia("(prefers-color-scheme:dark)").matches;
};
const App = () => {
  const [userAuth, setUserAuth] = useState({});

  const [theme, setTheme] = useState(() =>
    darkThemePreference() ? "dark" : "light",
  );

  useEffect(() => {
    // get user data if it exists in local storage
    let userInSession = lookInSession("user");
    let themeInSession = lookInSession("theme");

    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ access_token: null });

    if (themeInSession) {
      setTheme(() => {
        document.body.setAttribute("data-theme", themeInSession);
        return themeInSession;
      });
    } else {
      document.body.setAttribute("data-theme", theme);
    }
  }, []);
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <GoogleTagManager />
      <UserContext.Provider value={{ userAuth, setUserAuth }}>
        <Routes>
          <Route path="/editor" element={<Editor />} />
          <Route path="/editor/:blog_id" element={<Editor />} />
          <Route path="/" element={<Navbar />}>
            <Route index element={<HomePage />} />
            <Route path="dashboard" element={<SideNav />}>
              <Route path="notifications" element={<Notifications />} />
              <Route path="blogs" element={<ManageBlogs />} />
            </Route>
            <Route path="settings" element={<SideNav />}>
              <Route path="edit-profile" element={<EditProfilePage />} />
              <Route path="change-password" element={<ChangePassword />} />
            </Route>
            <Route path="signin" element={<UserAuthForm type={"sign_in"} />} />
            <Route path="signup" element={<UserAuthForm type={"sign_up"} />} />
            <Route path="/search/:query" element={<SearchPage />} />
            <Route path="user/:id" element={<ProfilePage />} />
            <Route path="blog/:blog_id" element={<BlogPage />} />
            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
};

export default App;
