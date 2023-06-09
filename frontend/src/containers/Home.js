import React, { useState, useEffect } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { useAppContext } from "../lib/contextLib";
import { onError } from "../lib/errorLib";
import { API } from "aws-amplify";
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { BsPencilSquare, BsEmojiFrown, BsEmojiSmile } from "react-icons/bs";
import { LinkContainer } from "react-router-bootstrap";
import "./Home.css";
import { IconButton } from "@mui/material";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const { isAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function onLoad() {
      if (!isAuthenticated) {
        return;
      }
  
      try {
        const notes = await loadNotes();
        setNotes(notes);
      } catch (e) {
        onError(e);
      }
  
      setIsLoading(false);
    }
  
    onLoad();
  }, [isAuthenticated]);
  
  function loadNotes() {
    return API.get("tipline", "/posts");
  }

  

  function renderNotesList(notes) {

    const upVote = (id, count) => {
      console.log(id, count)
      API.put("tipline", `/vote/${id}`, {
        body: count
      });
    };
    return (
    <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
    <List dense={false}>
    {notes.map(({ postId, content, createdAt, voteCount }) => (
      <ListItem>
        <ListItemText
          primary={content}
          secondary={new Date(createdAt).toLocaleString()}
        />
        <div>
          <span>
          <IconButton onClick={() => upVote(postId, voteCount+1)}>
            <BsEmojiSmile />
          </IconButton>
          <IconButton>
            <BsEmojiFrown />
          </IconButton>
          </span>
        </div>
      </ListItem>
    ))}
    </List>
  </Box>
    );
    // return (
    //   <>
    //     <LinkContainer to="/notes/new">
    //       <ListGroup.Item action className="py-3 text-nowrap text-truncate">
    //         <BsPencilSquare size={17} />
    //         <span className="ms-2 fw-bold">Create a new note</span>
    //       </ListGroup.Item>
    //     </LinkContainer>
    //     {notes.map(({ noteId, content, createdAt }) => (
    //       <LinkContainer key={noteId} to={`/notes/${noteId}`}>
    //         <ListGroup.Item action className="text-nowrap text-truncate">
    //           <span className="fw-bold">{content.trim().split("\n")[0]}</span>
    //           <br />
    //           <span className="text-muted">
    //             Created: {new Date(createdAt).toLocaleString()}
    //           </span>
    //           <br />
    //           <BsEmojiSmile size={17} className="mx-2"/>
    //           <BsEmojiFrown size={17} />
    //         </ListGroup.Item>
    //       </LinkContainer>
    //     ))}
    //   </>
    // );
  }

  function renderLander() {
    return (
      <div className="lander">
        <h1>Scratch</h1>
        <p className="text-muted">A simple note taking app</p>
      </div>
    );
  }

  function renderNotes() {
    return (
      <div className="notes">
        <h2 className="pb-3 mt-4 mb-3 border-bottom">Your Notes</h2>
        <ListGroup>{!isLoading && renderNotesList(notes)}</ListGroup>
      </div>
    );
  }

  return (
    <div className="Home">
      {isAuthenticated ? renderNotes() : renderLander()}
    </div>
  );
}