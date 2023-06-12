import React, { useState, useContext } from "react";
import { API } from "aws-amplify";
import { useNavigate } from "react-router-dom";
import { onError } from "../lib/errorLib";
import config from "../config";
import { ThemeContext } from "../App";
import "./Settings.css"
import ReactSwitch from "react-switch";

export default function Settings() {
  const nav = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useContext(ThemeContext);
  const { toggleTheme } = useContext(ThemeContext);

  const changeHeaders = theme === 'dark' ? "h1-dark" : "h1-light";
  const changeText = theme === 'dark' ? "text-dark-1" : "text-light-1"
  const boxTheme = theme === 'dark' ? "setting-box-dark" : "setting-box-light";

  function billUser(details) {
    return API.post("notes", "/billing", {
      body: details,
    });
  }

  return (

    <div className="Settings">
      <div className={boxTheme}>
      <div className={changeHeaders}>
        Settings
      </div>
      <div className={changeText}>Dark Mode <ReactSwitch checked={theme === "dark"} onChange={toggleTheme} />
      </div>
      </div>
      
    </div>
  )
}