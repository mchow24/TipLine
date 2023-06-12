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

export const ThemeContext = createContext(null);

function App() {
  const nav = useNavigate();
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, userHasAuthenticated] = useState(false);

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

  return (
    !isAuthenticating && (
        <div className="App container py-3">
          <Navbar collapseOnSelect bg="secondary" expand="md" className="nav">
            <a className="navbar-brand me-2" href="/">
              <img
                src="https://cdn1.iconfinder.com/data/icons/online-shopping-filled-outline-2/64/customer_chat_bubble_cute-512.png"
                height="50"
                alt="MDB Logo"
                loading="lazy"
              />
            </a>
            <LinkContainer to="/">
              <Navbar.Brand className="fw-bold text-muted">Tipline</Navbar.Brand>
            </LinkContainer>

            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
              <Nav activeKey={window.location.pathname}>
                {isAuthenticated ? (
                  <>
                    <LinkContainer to="/settings">
                      <Nav.Link>Settings</Nav.Link>
                    </LinkContainer>
                    <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                  </>
                ) : (
                  <>
                    <LinkContainer to="/signup">
                      <div class="d-flex align-items-center">
                        <button type="button" class="btn btn-outline-primary">
                          Sign Up Now!
                        </button>
                      </div>
                    </LinkContainer>
                    <LinkContainer to="/login">
                      <div class="d-flex align-items-center">
                        <button type="button" class="btn btn-outline-secondary">
                          Login
                        </button>
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
    )
  );
}

export default App;