import React, { useContext, useState } from "react";
import { UserContext } from "../App";
import { Navigate } from "react-router-dom";
import BlogEditor from "../components/BlogEditor";
import PublishForm from "../components/PublishForm";

const Editor = () => {
  let [editorState, setEditorState] = useState("editor");
  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  return access_token === null ? (
    <Navigate to="/signin" />
  ) : editorState == "editor" ? (
    <BlogEditor />
  ) : (
    <PublishForm />
  );
};

export default Editor;
//  for the editor page we dont want any user to access it we want only those who are logged in to get the editor page
