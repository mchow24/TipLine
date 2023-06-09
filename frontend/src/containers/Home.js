import React, { useState, useEffect } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { useAppContext } from "../lib/contextLib";
import { onError } from "../lib/errorLib";
import { API } from "aws-amplify";
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { BsEmojiFrown, BsEmojiSmile } from "react-icons/bs";
import { GrAdd } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { Fab, IconButton } from "@mui/material";

export default function Home() {
  const nav = useNavigate();
  const [notes, setPosts] = useState([]);
  const { isAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function onLoad() {
      if (!isAuthenticated) {
        return;
      }
  
      try {
        const notes = await loadPosts();
        setPosts(notes);
      } catch (e) {
        onError(e);
      }
  
      setIsLoading(false);
    }
  
    onLoad();
  }, [isAuthenticated]);
  
  function loadPosts() {
    return API.get("tipline", "/posts");
  }

  

  function renderPostsList(notes) {

    const upVote = (id, count) => {
      const num = Number(count);
      console.log(id, num)
      API.put("tipline", `/vote/${id}`, {
        body: num
      });
    };
    return (
    <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
    <List dense={false}>
    {notes.map(({ postId, content, createdAt, voteCount }) => (
      <ListItem className="border-bottom">
        <ListItemText
          primary={content}
          secondary={new Date(createdAt).toLocaleString()}
        />
        <div>
          <span>
          <IconButton onClick={() => upVote(postId, voteCount+1)}>
            <BsEmojiSmile />
          </IconButton>
          {voteCount}
          <IconButton onClick={() => upVote(postId, voteCount-1)}>
            <BsEmojiFrown />
          </IconButton>
          </span>
        </div>
        <Divider />
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
        <p className="text-muted">An app to share messages anaonymously to people around you</p>
      </div>
    );
  }

  function renderPosts() {
    return (
      <div className="notes">
        <h2 className="pb-3 mt-4 mb-3 border-bottom">Your Posts</h2>
        <ListGroup>{!isLoading && renderPostsList(notes)}</ListGroup>
        
      </div>
    );
  }

  const fabStyle = {
    position: 'absolute',
    bottom: '10%',
    right: '10%',
    width: '100px',
    height: '100px'
  };

  const newPost = () => {
    nav("/posts/new");
  };

  return (
    <div className="Home">
      {isAuthenticated ? renderPosts() : renderLander()}
      <Fab sx={fabStyle} size="large" onClick={() => newPost()}>
          {<GrAdd size="30"/>}
        </Fab>
    </div>
  );
}