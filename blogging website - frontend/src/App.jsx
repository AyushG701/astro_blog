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
export const UserContext = createContext({});
const App = () => {
  const [userAuth, setUserAuth] = useState({});

  useEffect(() => {
    // get user data if it exists in local storage
    let userInSession = lookInSession("user");

    userInSession
      ? setUserAuth(JSON.parse(userInSession))
      : setUserAuth({ access_token: null });
  }, []);
  return (
    <UserContext.Provider value={{ userAuth, setUserAuth }}>
      <Routes>
        <Route path="/editor" element={<Editor />} />
        <Route path="/editor/:blog_id" element={<Editor />} />
        <Route path="/" element={<Navbar />}>
          <Route index element={<HomePage />} />
          <Route path="settings" element={<SideNav />}>
            <Route
              path="edit-profile"
              element={<h1>to change edit profile</h1>}
            />
            <Route
              path="change-password"
              element={<h1>to change the password</h1>}
            />
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
  );
};

export default App;
