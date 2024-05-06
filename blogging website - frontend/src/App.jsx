import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import UserAuthForm from "./pages/userAuthForm.jsx";
const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navbar />}>
        <Route path="signin" element={<UserAuthForm type={"sign_in"} />} />
        <Route path="signup" element={<UserAuthForm type={"sign_up"} />} />
      </Route>
    </Routes>
  );
};

export default App;
