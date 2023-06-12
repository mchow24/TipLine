import React, { useState, useEffect } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { useAppContext } from "../lib/contextLib";
import { onError } from "../lib/errorLib";
import { API } from "aws-amplify";
import Box from '@mui/material/Box';
import { BsEmojiFrown, BsEmojiSmile, BsTrashFill } from "react-icons/bs";
import { GrAdd } from "react-icons/gr";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { Fab, IconButton } from "@mui/material";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { s3Get } from "../lib/awsLib";
import { Auth } from "aws-amplify";
import Button from '@mui/joy/Button';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Textarea from '@mui/joy/Textarea';
// import IconButtonTwo from '@mui/joy/IconButton';
// import Menu from '@mui/joy/Menu';
// import MenuItem from '@mui/joy/MenuItem';
// import ListItemDecorator from '@mui/joy/ListItemDecorator';
// import FormatBold from '@mui/icons-material/FormatBold';
// import FormatItalic from '@mui/icons-material/FormatItalic';
// import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
// import Check from '@mui/icons-material/Check';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReactSwitch from "react-switch";

export default function Home() {
  const nav = useNavigate();
  const [posts, setPosts] = useState([]);
  const { isAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [vote, setVote] = useState(true);
  const [authUserId, setUserId] = useState(null);
  const [del, setDel] = useState(true);
  const [isSmileActive, setIsSmileActive] = useState(false);
  const [isFrownActive, setIsFrownActive] = useState(false);

  useEffect(() => {
    async function onLoad() {
      if (!isAuthenticated) {
        return;
      }
      try {
        const auth = await Auth.currentUserInfo();
        setUserId(auth.id);
        const posts = await loadPosts();
        console.log("after loading posts");
        setPosts(posts);
      } catch (e) {
        onError(e);
      }
      setIsLoading(false);
    }
    onLoad();
  }, [isAuthenticated, vote, del]);

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
      console.log("I got called");
      setVote(!vote);
      const num = Number(count);
      console.log(id, num)
      API.put("tipline", `/vote/${id}`, {
        body: num
      });

    };

    const handleUp = () => {
      setIsSmileActive(current => !current);
    }

    const handleDown = () => {
      setIsFrownActive(current => !current);
    }

    const authUserGet = (id) => {
      return authUserId == id;
    };

    const deletePost = (id) => {
      API.del("tipline", `/posts/${id}`);
      setDel(!del);
    };
    return (
      <Box sx={{ width: '80%'}}>
        {posts.map(({ userId, postId, content, createdAt, voteCount, attachment }) => (
          <Card sx={{ width: '700px', marginBottom: '10px', bgcolor: "#4a525e"}}>
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
                  
                    <IconButton style={{
                      color: isSmileActive ? 'green' : '',
                    }}
                      onClick={() => {
                        upVote(postId, voteCount + 1);
                        //handleUp();
                      }}>
                      <BsEmojiSmile />
                    </IconButton>
                    {voteCount}
                    <IconButton style={{
                      color: isFrownActive ? 'red' : '',
                    }}
                      onClick={() => {
                        upVote(postId, voteCount - 1);
                        //handleDown();

                      }}>
                      <BsEmojiFrown />
                    </IconButton>
                    <span>
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
                  <Textarea
                    placeholder="Comment something here…"
                    minRows={3}
                    endDecorator={
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 'var(--Textarea-paddingBlock)',
                          pt: 'var(--Textarea-paddingBlock)',
                          borderTop: '1px solid',
                          borderColor: 'divider',
                          flex: 'auto',
                        }}
                      >
                        <Button sx={{ ml: 'auto' }}>Comment</Button>
                      </Box>
                    }
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
        {<GrAdd size="30" />}
      </Fab>
    </div>
  );
}