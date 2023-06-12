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
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import TextField from '@mui/material/TextField';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReactSwitch from "react-switch";
import Autocomplete from "@mui/material/Autocomplete";

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
      return authUserId === id;
    };

    const deletePost = (id) => {
      API.del("tipline", `/posts/${id}`);
      setDel(!del);
    };

 return (
  <Box sx={{ width: '80%', bgcolor: 'background.paper' }}>
  {posts.map(({ userId, postId, content, createdAt, voteCount, attachment }) => (
  <Card sx={{ width: '700px', marginBottom: '10px'}} key={postId}>
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
      { lang: 'az', label: 'Azeerbaijani'},
      { lang: 'ba', label: 'Bashkir'},
      { lang: 'eu', label: 'Basque'},
      { lang: 'be', label: 'Belarusian'},
      { lang: 'bn', label: 'Bengali'},
      { lang: 'bs', label: 'Bosnian'},
      { lang: 'bg', label: 'Bulgarian'},
      { lang: 'my', label: 'Burmese'},
      { lang: 'ca', label: 'Catalan'},
      { lang: 'ceb', label:'Cebuano'},
      { lang: 'ny', label: 'Chichewa'},
      { lang: 'co', label: 'Corsican'},
      { lang: 'hr', label: 'Croatian'},
      { lang: 'cs', label: 'Czech'},
      { lang: 'da', label: 'Danish'},
      { lang: 'nl', label: 'Dutch'},
      { lang: 'en', label: 'English'},
      { lang: 'eo', label: 'Esperanto'},
      { lang: 'et', label: 'Estonian'},
      { lang: 'fi', label: 'Finnish'},
      { lang: 'fr', label: 'French'},
      { lang: 'fy', label: 'Frisian'},
      { lang: 'gl', label: 'Galician'},
      { lang: 'ka', label: 'Georgian'},
      { lang: 'de', label: 'German'},
      { lang: 'el', label: 'Greek'},
      { lang: 'gu', label: 'Gujarati'},
      { lang: 'ht', label: 'Haitian Creole'},
      { lang: 'ha', label: 'Hausa'},
      { lang: 'haw', label:'Hawaiian'},
      { lang: 'iw', label: 'Hebrew'},
      { lang: 'mrj', label:'Hill Mari'},
      { lang: 'hi', label: 'Hindi'},
      { lang: 'hmn', label:'Hmong'},
      { lang: 'hu', label: 'Hungarian'},
      { lang: 'is', label: 'Icelandic'},
      { lang: 'ig', label: 'Igbo'},
      { lang: 'id', label: 'Indonesian'},
      { lang: 'ga', label: 'Irish'},
      { lang: 'it', label: 'Italian'},
      { lang: 'ja', label: 'Japanese'},
      { lang: 'jw', label: 'Javanese'},
      { lang: 'kn', label: 'Kannada'},
      { lang: 'kk', label: 'Kazakh'},
      { lang: 'km', label: 'Khmer'},
      { lang: 'ko', label: 'Korean'},
      { lang: 'ku', label: 'Kurdish'},
      { lang: 'ky', label: 'Kyrgyz'},
      { lang: 'lo', label: 'Lao'},
      { lang: 'la', label: 'Latin'},
      { lang: 'lv', label: 'Latvian'},
      { lang: 'lt', label: 'Lithuanian'},
      { lang: 'lb', label: 'Luxembourgish'},
      { lang: 'mk', label: 'Macedonian'},
      { lang: 'mg', label: 'Malagasy'},
      { lang: 'ms', label: 'Malay'},
      { lang: 'ml', label: 'Malayalam'},
      { lang: 'mt', label: 'Maltese'},
      { lang: 'mi', label: 'Maori'},
      { lang: 'mr', label: 'Marathi'},
      { lang: 'mhr', label:'Mari'},
      { lang: 'mn', label: 'Mongolian'},
      { lang: 'ne', label: 'Nepali'},
      { lang: 'no', label: 'Norwegian'},
      { lang: 'ps', label: 'Pashto'},
      { lang: 'pap', label:'Papiamento'},
      { lang: 'fa', label: 'Persian'},
      { lang: 'pl', label: 'Polish'},
      { lang: 'pt', label: 'Portuguese'},
      { lang: 'pa', label: 'Punjabi'},
      { lang: 'ro', label: 'Romanian'},
      { lang: 'ru', label: 'Russian'},
      { lang: 'sm', label: 'Samoan'},
      { lang: 'gd', label: 'Scots Gaelic'},
      { lang: 'sr', label: 'Serbian'},
      { lang: 'st', label: 'Sesotho'},
      { lang: 'sn', label: 'Shona'},
      { lang: 'sd', label: 'Sindhi'},
      { lang: 'si', label: 'Sinhala'},
      { lang: 'sk', label: 'Slovak'},
      { lang: 'sl', label: 'Slovenian'},
      { lang: 'so', label: 'Somali'},
      { lang: 'es', label: 'Spanish'},
      { lang: 'su', label: 'Sundanese'},
      { lang: 'sw', label: 'Swahili'},
      { lang: 'sv', label: 'Swedish'},
      { lang: 'tl', label: 'Tagalog Filipino'},
      { lang: 'tg', label: 'Tajik'},
      { lang: 'ta', label: 'Tamil'},
      { lang: 'tt', label: 'Tatar'},
      { lang: 'te', label: 'Telugu'},
      { lang: 'th', label: 'Thai'},
      { lang: 'tr', label: 'Turkish'},
      { lang: 'udm', label:'Udmurt'},
      { lang: 'uk', label: 'Ukrainian'},
      { lang: 'ur', label: 'Urdu'},
      { lang: 'uz', label: 'Uzbek'},
      { lang: 'vi', label: 'Vietnamese'},
      { lang: 'cy', label: 'Welsh'},
      { lang: 'xh', label: 'Xhosa'},
      { lang: 'yi', label: 'Yiddish'},
      { lang: 'yo', label: 'Yoruba'},
      { lang: 'zu', label: 'Zulu'},
    ]

    const translate = (lang) => {
      var copyPosts = [...posts];
      console.log("Posts Var", posts)
      const res = Promise.all(posts.map(async (element, index) => {
        if (lang == null) return;
        console.log("here")
        const text = await API.post("tipline", `/translate`, {
          body: {
            text: element.content,
            lang: lang
          }
        });
        if (text !== "") {
          var item = {...element};
          item.content = text;
          copyPosts[index] = item;
          console.log(copyPosts);
        };
      })).then(() => {
        console.log(copyPosts);
        setPosts(copyPosts);
      })
    };

    return (
      <div className="posts">
        <span><h2 className="pb-3 mt-4 mb-3 border-bottom">Your Posts</h2>
        <Autocomplete 
              onChange={(event, newValue) => translate(newValue.lang)}
              disablePortal
              id="combo-box-demo"
              options={languages}
              sx={{ width: 200 }}
              renderInput={(params) => <TextField {...params} label="Languages" />}
            />
        </span>
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