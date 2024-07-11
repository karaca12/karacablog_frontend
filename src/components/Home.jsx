import {Fragment, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Fab,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Pagination,
    Paper,
    TextField,
    Typography,
    useMediaQuery
} from "@mui/material";
import TopAppBar from "./TopAppBar.jsx";
import {Add} from "@mui/icons-material";
import {jwtDecode} from "jwt-decode";
import {useTheme} from '@mui/material/styles';

function Home({onLogout}) {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [createPostDialogOpen, setCreatePostDialogOpen] = useState(false);
    const navigate = useNavigate();
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [newTag, setNewTag] = useState('');
    const [tags, setTags] = useState([]);
    const [errors, setErrors] = useState({});
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const token = localStorage.getItem("jwt");
    const decodedToken = jwtDecode(token);
    const user = decodedToken.sub;


    useEffect(() => {
        axios.get(`http://localhost:8080/api/posts?page=${page - 1}&size=${size}`, {
            headers: {
                Authorization: 'Bearer ' + token
            }
        }).then(response => {
            setPosts(response.data.posts);
            setTotalPages(response.data.totalPages);
        }).catch(error => {
            console.error(error);
        })

    }, [page, size, token])

    const handleLogout = () => {
        localStorage.removeItem('jwt')
        onLogout(false);
    }

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handlePostClick = (uniqueNum) => {
        navigate(`/post/${uniqueNum}`);
    };

    const handleCreatePostClickOpen = () => {
        setCreatePostDialogOpen(true)
    }
    const handleCreatePostClickClose = () => {
        setCreatePostDialogOpen(false)
    }

    const handleCreatePost = () => {
        let formErrors = {};
        if (!newPostTitle.trim()) {
            formErrors.title = "Title cannot be empty";
        }
        if (!newPostContent.trim()) {
            formErrors.content = "Content cannot be empty";
        }

        setErrors(formErrors)

        if (Object.keys(formErrors).length === 0) {
            const newPost = {
                title: newPostTitle,
                content: newPostContent,
                author: user,
                tags: tags
            };

            axios.post('http://localhost:8080/api/posts', newPost, {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            }).then(() => {
                setCreatePostDialogOpen(false);
                setNewPostTitle('');
                setNewPostContent('');
                setTags([]);
                if (page === 1) {
                    window.location.reload();
                } else {
                    setPage(1);
                }
            }).catch(error => {
                console.error(error);
            });
        }
    }

    const handleAddTag = () => {
        if (newTag && tags.length < 4 && !tags.includes(newTag)) {
            setTags([...tags, newTag]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleAuthorClick = (author) => {
        navigate(`/profile/${author}`)
    }

    return (
        <Fragment>
            <TopAppBar handleLogout={handleLogout}/>
            <Container sx={{flexWrap: 'wrap', marginTop: 2}}>
                <Typography variant="h4" gutterBottom>
                    Posts
                </Typography>
                <Divider/>
                <List>
                    {posts.map((post) => (
                        <Fragment key={post.uniqueNum}>
                            <ListItem alignItems="flex-start">
                                <Paper sx={{margin: 0.5, padding: 1, width: '100%'}}>
                                    <ListItemButton onClick={() => handlePostClick(post.uniqueNum)}>
                                        <ListItemText primary={
                                            <Typography variant="h6" color="textPrimary" sx={{wordBreak: "break-word"}}>
                                                {post.title}
                                            </Typography>}
                                                      secondary={
                                                          <Typography variant="body2" color="textPrimary"
                                                                      sx={{wordBreak: "break-word"}}>
                                                              {post.content.length > 1000 ? post.content.substring(0, 1000) + "..." : post.content}
                                                          </Typography>
                                                      }/>
                                    </ListItemButton>
                                    <Button variant="caption" color="textPrimary" ml={2}
                                            onClick={() => handleAuthorClick(post.author)}>
                                        Written by {post.author} at {post.createdAt}
                                    </Button>
                                    <Box sx={{display: 'flex', flexWrap: 'wrap'}}>
                                        {post.tags.map((tag) => (
                                            //todo:Add onClick search for tags
                                            <Button onClick={() => console.log('blabla')} key={tag}
                                                    sx={{margin: 0.5, padding: 1, wordBreak: "break-word"}}>
                                                {tag}
                                            </Button>
                                        ))}
                                    </Box>
                                </Paper>
                            </ListItem>
                        </Fragment>
                    ))}
                </List>
                <Box display="flex" justifyContent="space-between" my={2}>
                    <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary"/>
                </Box>
            </Container>
            <Fab onClick={handleCreatePostClickOpen} variant="extended" color="primary" aria-label="add" sx={{
                margin: 0,
                top: 'auto',
                right: 20,
                bottom: 20,
                left: 'auto',
                position: 'fixed',
            }}>
                <Add/>
                Create Post
            </Fab>
            <Dialog open={createPostDialogOpen} onClose={handleCreatePostClickClose} fullWidth={true}
                    fullScreen={fullScreen}>
                <DialogTitle>Create Post</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="normal"
                        variant="standard"
                        id="title"
                        label="Title"
                        type="text"
                        fullWidth
                        multiline
                        rows={2}
                        required
                        inputProps={{maxLength: 100}}
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        error={!!errors.title}
                        helperText={errors.title}
                    />
                    <TextField
                        margin="normal"
                        variant="standard"
                        id="content"
                        label="Content"
                        type="text"
                        fullWidth
                        multiline
                        rows={12}
                        required
                        inputProps={{maxLength: 10000}}
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        error={!!errors.content}
                        helperText={errors.content}
                    />
                    <TextField
                        margin="normal"
                        variant="standard"
                        id="tag"
                        label="Tag"
                        type="text"
                        fullWidth
                        rows={1}
                        inputProps={{maxLength: 50}}
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        disabled={tags.length === 4}
                    />
                    <Button disabled={tags.length === 4} onClick={handleAddTag}>Add Tag</Button>
                    {tags.length === 4 &&
                        <Typography>Only 4 tags can be added</Typography>}
                    <Box sx={{display: 'flex', flexWrap: 'wrap', marginTop: 2}}>
                        {tags.map((tag, index) => (
                            <Paper key={index} sx={{margin: 0.5, padding: 1}}>
                                {tag}
                                <Button onClick={() => handleRemoveTag(tag)}>Remove</Button>
                            </Paper>
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCreatePostClickClose}>Cancel</Button>
                    <Button type="submit" onClick={handleCreatePost}>Post</Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    )
}

export default Home;