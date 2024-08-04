import {Fragment, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
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
import {Add, Clear, Remove} from "@mui/icons-material";
import {jwtDecode} from "jwt-decode";
import {useTheme} from '@mui/material/styles';
import {adjustPostOrCommentDateToUserTimezone} from "../utils/DateUtils.js";
import endpoints from "../utils/Endpoints.js";
import {useAlertSnackbar} from "./use_functions/useAlertSnackbar.jsx";
import {truncateContent} from "../utils/TruncateContent.js";

export default function Home({isAuthenticated, setIsAuthenticated}) {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [createPostDialogOpen, setCreatePostDialogOpen] = useState(false);
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [newTag, setNewTag] = useState('');
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const {openSnackbar, AlertSnackbar} = useAlertSnackbar();
    const navigate = useNavigate();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const response = await axios.get(endpoints.posts.getAll(page, size));
                setPosts(response.data.posts);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                console.error(error);
                setFetchError('Failed to load posts. Please try again later.');
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [page, size]);


    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleClickPost = (uniqueNum) => {
        navigate(`/post/${uniqueNum}`);
    };

    const handleAuthorClick = (author) => {
        navigate(`/profile/${author}`)
    }

    const handleSearchTag = (keyword) => {
        navigate(`/search/${keyword}`, {state: {searchType: 'tags'}})
    }

    const handleClickCreatePost = () => setCreatePostDialogOpen((state) => !state)
    const handleCreatePost = async () => {
        const token = localStorage.getItem("jwt");
        const decodedToken = jwtDecode(token);
        const user = decodedToken.sub;
        let currentFormErrors = {};
        if (!newPostTitle.trim()) {
            currentFormErrors.title = "Title cannot be empty";
        }
        if (!newPostContent.trim()) {
            currentFormErrors.content = "Content cannot be empty";
        }

        setFormErrors(currentFormErrors)

        if (Object.keys(currentFormErrors).length === 0) {
            const newPost = {
                title: newPostTitle,
                content: newPostContent,
                author: user,
                tags: tags
            };

            setCreatePostDialogOpen(false);
            openSnackbar('Posting', 'info', 6000)

            await axios.post(endpoints.posts.create, newPost, {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            }).then(response => {
                navigate(`/post/${response.data.uniqueNum}`);
            }).catch(error => {
                console.error(error);
                openSnackbar('Failed to post. Please try again later.', 'error', 6000)
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


    return (
        <Fragment>
            <TopAppBar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}/>
            <Container sx={{flexWrap: 'wrap', marginTop: 2}}>
                <Typography variant="h4" gutterBottom>
                    Posts
                </Typography>
                <Divider/>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                        <CircularProgress/>
                    </Box>
                ) : fetchError ? (
                    <Alert severity="error">{fetchError}</Alert>
                ) : (
                    <List>
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <Fragment key={post.uniqueNum}>
                                    <ListItem alignItems="flex-start">
                                        <Paper sx={{margin: 0.5, padding: 1, width: '100%'}}>
                                            <ListItemButton onClick={() => handleClickPost(post.uniqueNum)}>
                                                <ListItemText primary={
                                                    <Typography variant="h6" color="textPrimary"
                                                                sx={{wordBreak: "break-word", whiteSpace: "pre-wrap"}}>
                                                        {post.title}
                                                    </Typography>}
                                                              secondary={
                                                                  <Typography variant="body2" color="textPrimary"
                                                                              sx={{
                                                                                  wordBreak: "break-word",
                                                                                  whiteSpace: "pre-wrap"
                                                                              }}>
                                                                      {truncateContent(post.content, 500)}
                                                                  </Typography>
                                                              }/>
                                            </ListItemButton>
                                            <Button variant="caption" color="textPrimary" ml={2}
                                                    onClick={() => handleAuthorClick(post.author)}>
                                                Written
                                                by {post.author} at {adjustPostOrCommentDateToUserTimezone(post.createdAt)}
                                            </Button>
                                            <Box sx={{display: 'flex', flexWrap: 'wrap'}}>
                                                {post.tags.map((tag) => (
                                                    <Button onClick={() => handleSearchTag(tag)} key={tag}
                                                            sx={{margin: 0.5, padding: 1, wordBreak: "break-word"}}>
                                                        {tag}
                                                    </Button>
                                                ))}
                                            </Box>
                                        </Paper>
                                    </ListItem>
                                </Fragment>
                            ))
                        ) : (
                            <Paper sx={{margin: 0.5, padding: 1, width: '100%', textAlign: 'center'}}>
                                <Typography variant="h6" color="textPrimary">
                                    There are no posts to list.
                                </Typography>
                            </Paper>
                        )}
                    </List>
                )}
                {!loading && !fetchError && posts.length>0 &&(
                    <Box display="flex" justifyContent="space-between" my={2}>
                        <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary"/>
                    </Box>
                )}
            </Container>
            {isAuthenticated && !fetchError && !loading &&
                <Fab onClick={handleClickCreatePost} variant="extended" color="primary" aria-label="add" sx={{
                    margin: 0,
                    top: 'auto',
                    right: 20,
                    bottom: 20,
                    left: 'auto',
                    position: 'fixed',
                }}>
                    <Add/>
                    Post
                </Fab>
            }
            <AlertSnackbar/>
            <Dialog open={createPostDialogOpen} onClose={handleClickCreatePost} fullWidth={true}
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
                        required
                        inputProps={{maxLength: 100}}
                        value={newPostTitle}
                        onChange={(e) => setNewPostTitle(e.target.value)}
                        error={!!formErrors.title}
                        helperText={formErrors.title}
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
                        error={!!formErrors.content}
                        helperText={formErrors.content}
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
                    <Button disabled={tags.length === 4} onClick={handleAddTag} startIcon={<Add/>}>Add Tag</Button>
                    {tags.length === 4 &&
                        <Typography>Only 4 tags can be added</Typography>}
                    <Box sx={{display: 'flex', flexWrap: 'wrap', marginTop: 2}}>
                        {tags.map((tag, index) => (
                            <Paper key={index} sx={{margin: 0.5, padding: 1}}>
                                {tag}
                                <Button onClick={() => handleRemoveTag(tag)}><Clear/></Button>
                            </Paper>
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClickCreatePost} color="secondary">Cancel</Button>
                    <Button type="submit" onClick={handleCreatePost}>Post</Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    )
}