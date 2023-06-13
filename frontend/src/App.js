import React, { useState, useEffect } from "react";
import Navbar from "react-bootstrap/Navbar";
import "./App.css";
import Routes from "./Routes";
import Nav from "react-bootstrap/Nav";
import { AppContext } from "./lib/contextLib";
import { Auth } from "aws-amplify";
import { useNavigate, Link } from "react-router-dom";
import { onError } from "./lib/errorLib";
import { createContext } from "react";

export const ThemeContext = createContext(null);

function App() {
  const [theme, setTheme] = useState("light");
  const nav = useNavigate();
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, userHasAuthenticated] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    onLoad();
  }, []);

  async function onLoad() {
    try {
      await Auth.currentSession();
      userHasAuthenticated(true);
    } catch (e) {
      if (e !== "No current user") {
        onError(e);
      }
    }

    setIsAuthenticating(false);
  }

  async function handleLogout() {
    await Auth.signOut();

    userHasAuthenticated(false);

    nav("/login");
  }

  const brandStyle = theme === "dark" ? "brand-dark" : "brand-light";
  const fontTheme = theme === "dark" ? "nav-text-dark" : "nav-text-light";
  const appTheme = theme === "dark" ? "App-dark" : "App-light";

  return (
    !isAuthenticating && (
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <div className={appTheme}>
          <Navbar collapseOnSelect bg={theme === "dark" ? "dark" : "white"}
            fontFamily=""
            expand="lg"
            className="nav">
              <Link to="/">
              <Navbar.Brand className={brandStyle}>
                <img
                  src="https://cdn1.iconfinder.com/data/icons/online-shopping-filled-outline-2/64/customer_chat_bubble_cute-512.png"
                  height="50"
                  alt="MDB Logo"
                  loading="lazy"
                />
                <div className={fontTheme}>
                TipLine
                </div>
                </Navbar.Brand>
            </Link>
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
                {isAuthenticated ? (
                  <>
                    <Link to="/settings">
                        <div style={{color:theme==='dark'?'white':'black'}}>
                          Profile
                        </div>
                    </Link>
                    <Nav.Link onClick={handleLogout}>
                      <div style={{color:theme==='dark'?'white':'black'}} className="logout">
                        Logout
                      </div>
                    </Nav.Link>
                  </>
                ) : (
                  <>
                    <Link to="/signup">
                      <div class="d-flex align-items-center">
                        <div className="nav-button">
                        <button type="button" class="btn btn-primary" style = {{marginRight: '.5rem'}}>
                          Sign Up Now!
                        </button>
                        </div>
                      </div>
                    </Link>
                    <Link to="/login">
                      <div class="d-flex align-items-center">
                        <div className="nav-button">
                        <button type="button" class="btn btn-light" style = {{marginRight: '.5rem'}}>
                          Login
                        </button>
                        </div>
                      </div>
                    </Link>
                  </>
                )}
            </Navbar.Collapse>
          </Navbar>
          <AppContext.Provider value={{ isAuthenticated, userHasAuthenticated }}>
            <Routes />
          </AppContext.Provider>

        </div>
      </ThemeContext.Provider>
    )
  );
}

export default App;