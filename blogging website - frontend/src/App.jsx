import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import UserAuthForm from "./pages/userAuthForm.jsx";
import { createContext } from "react";
import { useState, useEffect } from "react";
import { lookInSession } from "./common/session.jsx";
import Editor from "./pages/Editor.jsx";
import HomePage from "./pages/HomePage.jsx";
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
        <Route path="/" element={<Navbar />}>
          <Route index element={<HomePage />} />
          <Route path="signin" element={<UserAuthForm type={"sign_in"} />} />
          <Route path="signup" element={<UserAuthForm type={"sign_up"} />} />
        </Route>
      </Routes>
    </UserContext.Provider>
  );
};

export default App;
