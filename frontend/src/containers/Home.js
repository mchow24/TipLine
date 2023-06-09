import React, { useState, useEffect } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { useAppContext } from "../lib/contextLib";
import { onError } from "../lib/errorLib";
import { API } from "aws-amplify";
import Box from '@mui/material/Box';
import { BsEmojiFrown, BsEmojiSmile } from "react-icons/bs";
import { GrAdd } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { Fab, IconButton } from "@mui/material";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { s3Get } from "../lib/awsLib";

export default function Home() {
  const nav = useNavigate();
  const [posts, setPosts] = useState([]);
  const { isAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [vote, setVote] = useState(true);

  useEffect(() => {
    async function onLoad() {
      if (!isAuthenticated) {
        return;
      }
      try {
        const posts = await loadPosts();
        console.log("after loading notes");
        setPosts(posts);
      } catch (e) {
        onError(e);
      }
      setIsLoading(false);
    }
    onLoad();
  }, [isAuthenticated]);
  
  async function loadPosts() {
    var list = await API.get("tipline", "/posts");
    
    for (let i = 0; i < list.length; i++) {
      const image = list[i].attachment;
      if (!image) continue;
      const file = await s3Get(image);
      list[i].attachment = file;
    }
    return list;
  }

  

  function renderPostsList(posts) {
    const upVote = (id, count) => {
      const num = Number(count);
      console.log(id, num)
      //setVote(count);
      API.put("tipline", `/vote/${id}`, {
        body: num
      });
      //setVote(!vote);
    };

    return (
  <Box sx={{ width: '80%', bgcolor: 'background.paper' }}>
  {posts.map(({ postId, content, createdAt, voteCount, attachment }) => (
  <Card sx={{ width: '700px', marginBottom: '10px'}}>
    <div className="listItem">
      <div>
        <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {content}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(createdAt).toLocaleString()}
            </Typography>
        </CardContent>
        <CardActions>
            <span>
            <IconButton onClick={() => upVote(postId, voteCount+1)}>
              <BsEmojiSmile />
            </IconButton>
            {voteCount}
            <IconButton onClick={() => upVote(postId, voteCount-1)}>
              <BsEmojiFrown />
            </IconButton>
            </span>
        </CardActions>
      </div>
      {attachment ? <img className="imageInList" alt="Post Image" height="140" src={attachment} /> : null}
    </div>
  </Card>
  ))}
    </Box>
    );
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
      <div className="posts">
        <h2 className="pb-3 mt-4 mb-3 border-bottom">Your Posts</h2>
        <ListGroup>{!isLoading && renderPostsList(posts)}</ListGroup>
        
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