import React, { useRef, useState, useContext } from "react";
import Form from "react-bootstrap/Form";
import { useNavigate } from "react-router-dom";
import LoaderButton from "../components/LoaderButton";
import { onError } from "../lib/errorLib";
import config from "../config";
import { API } from "aws-amplify";
import { s3Upload } from "../lib/awsLib";
import "./NewNote.css";
import { ThemeContext } from "../App";

export default function NewNote() {
  const file = useRef(null);
  const nav = useNavigate();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useContext(ThemeContext);

  function validateForm() {
    return content.length > 0;
  }

  function handleFileChange(event) {
    file.current = event.target.files[0];
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
      alert(
        `Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE / 1000000
        } MB.`
      );
      return;
    }

    setIsLoading(true);

    try {
      const attachment = file.current ? await s3Upload(file.current) : null;
      await createNote({ content, attachment });
      nav("/");
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }

  function createNote(note) {
    return API.post("tipline", "/tipline", {
      body: note,
    });
  }

  return (
    <div className="NewNote">
      <Form onSubmit={handleSubmit}>
        <div className="textarea">
          <Form.Group controlId="content"> <div style={{ color: theme === 'dark' ? 'white' : 'black', fontFamily: "Marker Felt, fantasy", marginTop: '20px', fontSize: '20px' }}>Your thoughts...</div>
            <Form.Control
              value={content}
              as="textarea"
              onChange={(e) => setContent(e.target.value)}
            />
          </Form.Group>
        </div>
        <div className="filearea">
          <Form.Group className="mt-2" controlId="file">
            <Form.Label><div style={{ color: theme === 'dark' ? 'white' : 'black', fontFamily: "Marker Felt, fantasy" }}>Attachment</div></Form.Label>
            <Form.Control onChange={handleFileChange} type="file" />
          </Form.Group>
        </div>
        <div className="filearea">
          <div className="button">
            <LoaderButton
              type="submit"
              size="lg"
              variant="primary"
              isLoading={isLoading}
              disabled={!validateForm()}>

              Create

            </LoaderButton>
          </div>
        </div>
      </Form>
    </div>
  );
}