import React, { useState, useEffect } from "react";
import Navbar from "react-bootstrap/Navbar";
import "./App.css";
import Routes from "./Routes";
import Nav from "react-bootstrap/Nav";
import { LinkContainer } from "react-router-bootstrap";
import { AppContext } from "./lib/contextLib";
import { Auth } from "aws-amplify";
import { useNavigate } from "react-router-dom";
import { onError } from "./lib/errorLib";
import { createContext } from "react";
import { Fab } from "@mui/material";
import { GrAdd } from "react-icons/gr";
import Container from "react-bootstrap/Container";

export const ThemeContext = createContext(null);

function App() {
  const [theme, setTheme] = useState("dark");
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
  const fabStyle = {
    position: 'fixed',
    bottom: '10%',
    right: '10%',
    width: '100px',
    height: '100px'
  };

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
            <a className="navbar-brand me-2" href="/">
              <img
                src="https://cdn1.iconfinder.com/data/icons/online-shopping-filled-outline-2/64/customer_chat_bubble_cute-512.png"
                height="50"
                alt="MDB Logo"
                loading="lazy"
              />
            </a>
            <LinkContainer to="/">
              <Navbar.Brand className={brandStyle}>
                <div className={fontTheme}>
                TipLine
                </div>
                </Navbar.Brand>
            </LinkContainer>

            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
              <Nav activeKey={window.location.pathname}>
                {isAuthenticated ? (
                  <>
                    <LinkContainer to="/settings">
                      <Nav.Link><div style={{color:theme==='dark'?'white':'black'}}>Profile</div></Nav.Link>
                    </LinkContainer>
                    <Nav.Link onClick={handleLogout}><div style={{color:theme==='dark'?'white':'black'}}>Logout</div></Nav.Link>
                  </>
                ) : (
                  <>
                    <LinkContainer to="/signup">
                      <div class="d-flex align-items-center">
                        <div className="nav-button">
                        <button type="button" class="btn btn-primary" style = {{marginRight: '.5rem'}}>
                          Sign Up Now!
                        </button>
                        </div>
                      </div>
                    </LinkContainer>
                    <LinkContainer to="/login">
                      <div class="d-flex align-items-center">
                        <div className="nav-button">
                        <button type="button" class="btn btn-light" style = {{marginRight: '.5rem'}}>
                          Login
                        </button>
                        </div>
                      </div>
                    </LinkContainer>
                  </>
                )}

              </Nav>
            </Navbar.Collapse>
          </Navbar>
          <AppContext.Provider value={{ isAuthenticated, userHasAuthenticated }}>
            <Routes />
          </AppContext.Provider>
          <LinkContainer to="/posts/new">
            <Fab sx={fabStyle} size="large">
              {<GrAdd size="30" />}
            </Fab>
          </LinkContainer>
          </div>
      </ThemeContext.Provider>
    )
  );
}

export default App;