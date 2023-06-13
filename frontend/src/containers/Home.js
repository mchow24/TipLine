import React, { useState, useEffect, useContext } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { useAppContext } from "../lib/contextLib";
import { onError } from "../lib/errorLib";
import { API } from "aws-amplify";
import Box from '@mui/material/Box';
import { BsEmojiFrown, BsEmojiSmile, BsTrashFill, BsFillSendFill } from "react-icons/bs";
import "./Home.css";
import { IconButton } from "@mui/material";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { s3Get } from "../lib/awsLib";
import { Auth } from "aws-amplify";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem'
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Autocomplete from "@mui/material/Autocomplete";
import Slide from "@mui/material/Slide";
import { ThemeContext } from "../App";
import logo from './logo.gif';
import { LinkContainer } from "react-router-bootstrap";
import { Fab } from "@mui/material";
import { GrAdd } from "react-icons/gr";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const { isAuthenticated } = useAppContext();
  const [vote, setVote] = useState(true);
  const [authUserId, setUserId] = useState(null);
  const [del, setDel] = useState(true);
  const {theme} = useContext(ThemeContext);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const fabStyle = {
    position: 'fixed',
    bottom: '10%',
    right: '10%',
    width: '100px',
    height: '100px'
  };

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
        var posts = await loadPosts();

        posts = posts.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1)

        // Loop through posts
        posts.forEach(element => {
          //  Get the sum of votes
          var sum = Object.values(element.votes).reduce((accumulator, currentValue) => {
            return accumulator + currentValue
          }, 0);
          element.voteCount = sum

          element.comments = JSON.parse(element.comments)
        });
        setPosts(posts);
        setLoading(false)
      } catch (e) {
        onError(e);
      }
    }
    const interval = setInterval(() => {
      if (loading === true) {
        setTimeout(() => {
          onLoad();
        }, 1000);
      }
      else {
        onLoad();
      }
    }, 3000)
    onLoad();
    return () => clearInterval(interval);
  }, [isAuthenticated, vote, del, loading]);

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
      var num = Number(count);
      if ((isSmileActive(id) && num === 1) || (isFrownActive(id) && num === -1)) {
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
          if (eachVote[1] === 1) {
            console.log("here", post);
            flag = true;
            return;
          }
          else if (eachVote[1] === 0) {
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
          if (eachVote[1] === 1) {
            console.log("here", post);
            flag = false;
            return;
          }
          else if (eachVote[1] === 0) {
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

  const commentPost = async (id) => {
    console.log(comment, id)
    await API.put("tipline", `/post/${id}`, {
      body: comment
    });
    setComment("");
    setVote(!vote);
  }

 return (
  <Slide direction="up" in={posts.length > 0} unmountOnExit timeout={5000}>
  <Box sx={{ }}>
  {posts.map(({ userId, postId, content, createdAt, voteCount, attachment, comments }) => (
  <Card sx={{ width: '700px', marginBottom: '16px', 
  backgroundColor: theme === "light" ? "#c7c7c7" : "#5c5b5b",
  borderRadius: "15px",
  color: theme === "light" ? "black" : "white"}} key={postId} className="item">
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
            <IconButton onClick={() => upVote(postId, 1)} style={{color: isSmileActive(postId) ? '#13f23c' : ''}}>
              <BsEmojiSmile />
            </IconButton>
            
            {voteCount}
            <IconButton onClick={() => upVote(postId, -1)} style={{color: isFrownActive(postId) ? '#ff1741' : ''}}>
              <BsEmojiFrown />
            </IconButton>
            {authUserGet(userId) ? <IconButton onClick={() => deletePost(postId)}>
              <BsTrashFill />
            </IconButton> : null}
            </span>
        </CardActions>
      </div>
      {attachment ? <img className="imageInList" alt="Media in post" height="140" src={attachment} /> : null}
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
        <span>
          <TextField
            onChange={e => setComment(e.target.value)}
            placeholder="Comment something here…"
            minRows={3}
            sx={{
              minWidth: 300,
            }}
          />
          <IconButton onClick={() => commentPost(postId) }>
            < BsFillSendFill />
          </IconButton>
        </span>
        <List>
            {comments ? Object.keys(comments).map((item) => (
              <ListItem key={comments[item]} class="border border-primary border-3 rounded-pill px-2 my-1">
                {comments[item]}
              </ListItem>
            )) : null}
        </List>
        </AccordionDetails>
      </Accordion>
  </Card>
  ))}
    </Box>
    </Slide>
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
    const languages = [
      { lang: 'af', label: 'Afrikaans' },
      { lang: 'sq', label: 'Albanian' },
      { lang: 'am', label: 'Amharic' },
      { lang: 'ar', label: 'Arabic' },
      { lang: 'hy', label: 'Armenian' },
      { lang: 'az', label: 'Azeerbaijani' },
      { lang: 'ba', label: 'Bashkir' },
      { lang: 'eu', label: 'Basque' },
      { lang: 'be', label: 'Belarusian' },
      { lang: 'bn', label: 'Bengali' },
      { lang: 'bs', label: 'Bosnian' },
      { lang: 'bg', label: 'Bulgarian' },
      { lang: 'my', label: 'Burmese' },
      { lang: 'ca', label: 'Catalan' },
      { lang: 'ceb', label: 'Cebuano' },
      { lang: 'ny', label: 'Chichewa' },
      { lang: 'co', label: 'Corsican' },
      { lang: 'hr', label: 'Croatian' },
      { lang: 'cs', label: 'Czech' },
      { lang: 'da', label: 'Danish' },
      { lang: 'nl', label: 'Dutch' },
      { lang: 'en', label: 'English' },
      { lang: 'eo', label: 'Esperanto' },
      { lang: 'et', label: 'Estonian' },
      { lang: 'fi', label: 'Finnish' },
      { lang: 'fr', label: 'French' },
      { lang: 'fy', label: 'Frisian' },
      { lang: 'gl', label: 'Galician' },
      { lang: 'ka', label: 'Georgian' },
      { lang: 'de', label: 'German' },
      { lang: 'el', label: 'Greek' },
      { lang: 'gu', label: 'Gujarati' },
      { lang: 'ht', label: 'Haitian Creole' },
      { lang: 'ha', label: 'Hausa' },
      { lang: 'haw', label: 'Hawaiian' },
      { lang: 'iw', label: 'Hebrew' },
      { lang: 'mrj', label: 'Hill Mari' },
      { lang: 'hi', label: 'Hindi' },
      { lang: 'hmn', label: 'Hmong' },
      { lang: 'hu', label: 'Hungarian' },
      { lang: 'is', label: 'Icelandic' },
      { lang: 'ig', label: 'Igbo' },
      { lang: 'id', label: 'Indonesian' },
      { lang: 'ga', label: 'Irish' },
      { lang: 'it', label: 'Italian' },
      { lang: 'ja', label: 'Japanese' },
      { lang: 'jw', label: 'Javanese' },
      { lang: 'kn', label: 'Kannada' },
      { lang: 'kk', label: 'Kazakh' },
      { lang: 'km', label: 'Khmer' },
      { lang: 'ko', label: 'Korean' },
      { lang: 'ku', label: 'Kurdish' },
      { lang: 'ky', label: 'Kyrgyz' },
      { lang: 'lo', label: 'Lao' },
      { lang: 'la', label: 'Latin' },
      { lang: 'lv', label: 'Latvian' },
      { lang: 'lt', label: 'Lithuanian' },
      { lang: 'lb', label: 'Luxembourgish' },
      { lang: 'mk', label: 'Macedonian' },
      { lang: 'mg', label: 'Malagasy' },
      { lang: 'ms', label: 'Malay' },
      { lang: 'ml', label: 'Malayalam' },
      { lang: 'mt', label: 'Maltese' },
      { lang: 'mi', label: 'Maori' },
      { lang: 'mr', label: 'Marathi' },
      { lang: 'mhr', label: 'Mari' },
      { lang: 'mn', label: 'Mongolian' },
      { lang: 'ne', label: 'Nepali' },
      { lang: 'no', label: 'Norwegian' },
      { lang: 'ps', label: 'Pashto' },
      { lang: 'pap', label: 'Papiamento' },
      { lang: 'fa', label: 'Persian' },
      { lang: 'pl', label: 'Polish' },
      { lang: 'pt', label: 'Portuguese' },
      { lang: 'pa', label: 'Punjabi' },
      { lang: 'ro', label: 'Romanian' },
      { lang: 'ru', label: 'Russian' },
      { lang: 'sm', label: 'Samoan' },
      { lang: 'gd', label: 'Scots Gaelic' },
      { lang: 'sr', label: 'Serbian' },
      { lang: 'st', label: 'Sesotho' },
      { lang: 'sn', label: 'Shona' },
      { lang: 'sd', label: 'Sindhi' },
      { lang: 'si', label: 'Sinhala' },
      { lang: 'sk', label: 'Slovak' },
      { lang: 'sl', label: 'Slovenian' },
      { lang: 'so', label: 'Somali' },
      { lang: 'es', label: 'Spanish' },
      { lang: 'su', label: 'Sundanese' },
      { lang: 'sw', label: 'Swahili' },
      { lang: 'sv', label: 'Swedish' },
      { lang: 'tl', label: 'Tagalog Filipino' },
      { lang: 'tg', label: 'Tajik' },
      { lang: 'ta', label: 'Tamil' },
      { lang: 'tt', label: 'Tatar' },
      { lang: 'te', label: 'Telugu' },
      { lang: 'th', label: 'Thai' },
      { lang: 'tr', label: 'Turkish' },
      { lang: 'udm', label: 'Udmurt' },
      { lang: 'uk', label: 'Ukrainian' },
      { lang: 'ur', label: 'Urdu' },
      { lang: 'uz', label: 'Uzbek' },
      { lang: 'vi', label: 'Vietnamese' },
      { lang: 'cy', label: 'Welsh' },
      { lang: 'xh', label: 'Xhosa' },
      { lang: 'yi', label: 'Yiddish' },
      { lang: 'yo', label: 'Yoruba' },
      { lang: 'zu', label: 'Zulu' },
    ]

    const translate = (lang) => {
      var copyPosts = [...posts];
      Promise.all(posts.map(async (element, index) => {
        if (lang == null) return;
        const text = await API.post("tipline", `/translate`, {
          body: {
            text: element.content,
            lang: lang
          }
        });
        if (text !== "") {
          var item = { ...element };
          item.content = text;
          copyPosts[index] = item;
        };
      })).then(() => {
        setPosts(copyPosts);
      })
    };

    return (
      <div className="posts">
        <Slide direction="up" in={loading} unmountOnExit appear={false} timeout={3000}>
        <div className="loader">
          <img src={logo} alt="Tipline logo"/>
        </div>
        </Slide>
        <h2 className="mt-4 mb-3 pl-3">
          <div className="titleText" style={{ color: theme === 'dark' ? 'white' : 'black' , textShadow: "0px 0px 5px white"}}>
            Your Feed
          </div>
        </h2>
        <Autocomplete
          onChange={(event, newValue) => translate(newValue.lang)}
          disablePortal
          id="combo-box-demo"
          options={languages}
          sx={{ width: 200 }}
          renderInput={(params) => <TextField {...params} label="Languages" sx={{ m: 1, bgcolor: 'GrayText', borderRadius: 2, }} />}
        />
        {posts.length > 0 ?  <div className="box">{!loading && renderPostsList(posts)}</div> : null}
        <LinkContainer to="/posts/new">
            <Fab sx={fabStyle} size="large">
              {<GrAdd size="30" />}
            </Fab>
          </LinkContainer>
      </div>
      
    );
  }
  return (
    <div className="Home">
      {isAuthenticated ? renderPosts() : renderLander()}
    </div>
  );
}