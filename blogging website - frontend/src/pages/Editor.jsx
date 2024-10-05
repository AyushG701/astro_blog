import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { Navigate, useParams } from "react-router-dom";
import BlogEditor from "../components/BlogEditor";
import PublishForm from "../components/PublishForm";
import { createContext } from "react";
import Loader from "../components/Loader";
import axios from "axios";
import PageNotFound from "./PageNotFound";

const blogStructure = {
  title: "",
  banner: "",
  content: [],
  tags: [],
  des: "",
  author: { personal_info: {} },
};

export const EditorContext = createContext({});
const Editor = () => {
  let { blog_id } = useParams();

  const [blog, setBlog] = useState(blogStructure);

  let [editorState, setEditorState] = useState("editor");
  let [textEditor, setTextEditor] = useState({ isReady: false });
  let {
    userAuth: { access_token, isAdmin },
  } = useContext(UserContext);
  let [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!blog_id) {
      return setLoading(false);
    }
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", {
        blog_id,
        draft: true,
        mode: "edit",
      })
      .then(({ data: { blog } }) => {
        setBlog(blog);
        setLoading(false);
      })
      .catch((err) => {
        setBlog(null);
        setLoading(false);
      });
  }, [blog_id]);
  return (
    <EditorContext.Provider
      value={{
        blog,
        setBlog,
        editorState,
        setEditorState,
        textEditor,
        setTextEditor,
      }}
    >
      {!isAdmin ? (
        <Navigate to="/404" />
      ) : access_token === null ? (
        <Navigate to="/signin" />
      ) : loading ? (
        <Loader />
      ) : editorState == "editor" ? (
        <BlogEditor />
      ) : (
        <PublishForm />
      )}
    </EditorContext.Provider>
  );
};

export default Editor;
//  for the editor page we dont want any user to access it we want only those who are logged in to get the editor page
