import React, { useState, useContext } from "react";
import { Auth } from "aws-amplify";
import Form from "react-bootstrap/Form";
import LoaderButton from "../components/LoaderButton";
import { useAppContext } from "../lib/contextLib";
import { useFormFields } from "../lib/hooksLib";
import { onError } from "../lib/errorLib";
import "./Login.css";
import { ThemeContext} from "../App";
import ReactSwitch from "react-switch";

export default function Login() {
  const { userHasAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const{theme} = useContext(ThemeContext);
  const{toggleTheme} = useContext(ThemeContext);
  const [fields, handleFieldChange] = useFormFields({
    email: "",
    password: "",
  });

  const boxTheme = theme === 'dark' ? "login-box-dark" : "login-box-light";
  const formTextCol = theme === 'dark' ? "form-text-dark" : "form-text-light";

  function validateForm() {
    return fields.email.length > 0 && fields.password.length > 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setIsLoading(true);

    try {
      await Auth.signIn(fields.email, fields.password);
      userHasAuthenticated(true);
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }

  return (
    <div className="Login">
      <div style={{textAlign: "center", fontFamily: "Marker Felt, fantasy", fontSize: "40px", color: theme ==='dark' ? 'white' : 'black', marginBottom:".5rem"}}>
      TipLine
      
      </div>
      <div style={{textAlign: "center", fontFamily: "Marker Felt, fantasy", fontSize: "30px", color: theme ==='dark' ? 'white' : 'black', marginBottom:".5rem"}}>
      A place for you to share your thoughts anonymously
      
      </div>

      <div className={boxTheme}>
      <Form onSubmit={handleSubmit}>
        <Form.Group size="lg" controlId="email">
          <Form.Label>
            <div className={formTextCol}>
            Email
            </div>
            </Form.Label>
          <Form.Control
            autoFocus
            type="email"
            value={fields.email}
            onChange={handleFieldChange}
          />
        </Form.Group>
        <Form.Group size="lg" controlId="password">
          <Form.Label>
          <div className={formTextCol}>Password</div>
          </Form.Label>
          <Form.Control
            type="password"
            value={fields.password}
            onChange={handleFieldChange}
          />
        </Form.Group>
        <LoaderButton
          block="true"
          size="lg"
          type="submit"
          isLoading={isLoading}
          disabled={!validateForm()}
        >
          Login
        </LoaderButton>
      </Form>
      </div>
      <div style={{textAlign: "center", fontFamily: "Marker Felt, fantasy", fontSize:"20px", marginTop:".5rem", color:theme==='dark'?'white':'black'}}>
      Dark Mode&nbsp;<ReactSwitch checked={theme === "dark"} onChange={toggleTheme} />
      </div>
      </div>
  );
}