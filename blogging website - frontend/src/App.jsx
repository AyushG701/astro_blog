import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import UserAuthForm from "./pages/userAuthForm.jsx";
import { createContext } from "react";

export const UserContext = createContext({});
const App = () => {
  const [userAuth, setUserAuth] = useState();

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
        <Route path="/" element={<Navbar />}>
          <Route path="signin" element={<UserAuthForm type={"sign_in"} />} />
          <Route path="signup" element={<UserAuthForm type={"sign_up"} />} />
        </Route>
      </Routes>
    </UserContext.Provider>
  );
};

export default App;
