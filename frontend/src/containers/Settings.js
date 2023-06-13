import React, { useState, useContext, useEffect } from "react";
import { API } from "aws-amplify";
import { useNavigate } from "react-router-dom";
import { onError } from "../lib/errorLib";
import config from "../config";
import { ThemeContext } from "../App";
import "./Settings.css"
import ReactSwitch from "react-switch";
import ListGroup from "react-bootstrap/ListGroup";
import { useAppContext } from "../lib/contextLib";
import "./Home.css";
import { IconButton } from "@mui/material";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { s3Get } from "../lib/awsLib";
import { Auth } from "aws-amplify";
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Autocomplete from "@mui/material/Autocomplete";
import Box from '@mui/material/Box';
import { BsEmojiFrown, BsEmojiSmile, BsTrashFill } from "react-icons/bs";

export default function Settings() {
  const nav = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useContext(ThemeContext);
  const { toggleTheme } = useContext(ThemeContext);

  const [posts, setPosts] = useState([]);
  const { isAuthenticated } = useAppContext();
  const [vote, setVote] = useState(true);
  const [authUserId, setUserId] = useState(null);
  const [del, setDel] = useState(true);

  const changeHeaders = theme === 'dark' ? "h1-dark" : "h1-light";
  const changeText = theme === 'dark' ? "text-dark-1" : "text-light-1"
  const boxTheme = theme === 'dark' ? "setting-box-dark" : "setting-box-light";

  useEffect(() => {
    async function onLoad() {
      if (!isAuthenticated) {
        return;
      }
      try {
        //  Get auth user id
        const auth = await Auth.currentUserInfo();
        setUserId(auth.id);
        // Get posts
        const posts = await loadPosts();

        // Loop through posts
        posts.forEach(element => {
          //  Get the sum of votes
          var sum = Object.values(element.votes).reduce((accumulator, currentValue) => {
            return accumulator + currentValue
          }, 0);
          element.voteCount = sum
        });
        setPosts(posts);
      } catch (e) {
        onError(e);
      }
      setIsLoading(false);
    }
    onLoad();
  }, [isAuthenticated, vote, del]);
  
  async function loadPosts() {
    var list = API.get("tipline", "/getUsersPosts");
    for (let i = 0; i < list.length; i++) {
      const image = list[i].attachment;
      if (!image) continue;
      const file = await s3Get(image);
      list[i].attachment = file;
    }
    return list;
  }

  function renderUserPosts(posts){
    const upVote = (id, count) => {
      var num = Number(count);
      if (isSmileActive(id) && num == 1 || isFrownActive(id) && num == -1) {
        num = 0;
      }
      API.put("tipline", `/vote/${id}`, {
        body: num
      });
      setVote(!vote);
    };

    const authUserGet = (id) => {
      return authUserId === id;
    };

    const deletePost = (id) => {
      API.del("tipline", `/posts/${id}`);
      setDel(!del);
    };

    function isSmileActive(id) {
      // Get the individual entries in the vote
      var post = posts.find(obj => {
        return obj.postId === id
      })
      const votesInPost = Object.entries(post.votes);
      var flag = null
      votesInPost.forEach((eachVote) => {
        if (eachVote[0] === authUserId) {
          if (eachVote[1] == 1) {
            console.log("here", post);
            flag = true;
            return;
          }
          else if (eachVote[1] == 0) {
            return null;
          }
          else {
            flag = false
            return;
          }
        }
      })
      return flag
    }

    function isFrownActive(id) {
      // Get the individual entries in the vote
      var post = posts.find(obj => {
        return obj.postId === id
      })
      const votesInPost = Object.entries(post.votes);
      var flag = null
      votesInPost.forEach((eachVote) => {
        if (eachVote[0] === authUserId) {
          if (eachVote[1] == 1) {
            console.log("here", post);
            flag = false;
            return;
          }
          else if (eachVote[1] == 0) {
            return null;
          }
          else {
            flag = true
            return;
          }
        }
      })
      return flag
    }
    return (
      <Box sx={{ width: '80%' }}>
      {posts.map(({ userId, postId, content, createdAt, voteCount, attachment }) => (
        <Card sx={{
          width: '700px', marginBottom: '10px',
          backgroundColor: theme === "light" ? "#c7c7c7" : "#5c5b5b",
          color: theme === "light" ? "black" : "white"
        }} key={postId}>
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
                  <IconButton onClick={() => upVote(postId, 1)} style={{ color: isSmileActive(postId) ? 'green' : '' }}>
                    <BsEmojiSmile />
                  </IconButton>
                  {voteCount}
                  <IconButton onClick={() => upVote(postId, -1)} style={{ color: isFrownActive(postId) ? 'red' : '' }}>
                    <BsEmojiFrown />
                  </IconButton>
                  {authUserGet(userId) ? <IconButton onClick={() => deletePost(postId)}>
                    <BsTrashFill />
                  </IconButton> : null}
                </span>
              </CardActions>
            </div>
            {attachment ? <img className="imageInList" alt="Post Image" height="140" src={attachment} /> : null}
          </div>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography> expand to comment </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControl>
                <FormLabel></FormLabel>
                <TextField
                  placeholder="Comment something here…"
                  minRows={3}
                  sx={{
                    minWidth: 300,
                  }}
                />
              </FormControl>
            </AccordionDetails>
          </Accordion>
        </Card>
      ))}
    </Box>
    );
  }

  function renderLander() {
    return (
      <div className="lander">
        <h1>Tipline</h1>
        <p className="text-muted">An app to share messages anaonymously to people around you</p>
      </div>
    );
  }

  function renderPosts() {
    return (
      <div className="posts">
        <span><h2 className="mt-4 mb-3 border-bottom">
          <div className="titleText" style={{ color: theme === 'dark' ? 'white' : 'black' }}>
            Your Posts
          </div>
        </h2>
        </span>
        <ListGroup>{!isLoading && renderUserPosts(posts)}</ListGroup>

      </div>
    );
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
      
      {isAuthenticated ? renderPosts() : renderLander()}
    </div>
  )
}