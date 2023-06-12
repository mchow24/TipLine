import React, { useState, useContext } from "react";
import { API } from "aws-amplify";
import { useNavigate } from "react-router-dom";
import { onError } from "../lib/errorLib";
import config from "../config";
import { ThemeContext} from "../App";

export default function Settings() {
  const nav = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const{theme} = useContext(ThemeContext);
  const{toggleTheme} = useContext(ThemeContext);

  function billUser(details) {
    return API.post("notes", "/billing", {
      body: details,
    });
  }

  return( 
  
  <div className="Settings">
    <h1>Settings</h1>
    Dark Mode <input type = "checkbox" checked={theme === "dark"} onChange={toggleTheme} />
  </div>
  )
}