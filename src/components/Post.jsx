import {Fragment, useEffect, useState} from "react";
import axios from "axios";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Fab,
    List,
    ListItem,
    Pagination,
    Paper,
    TextField,
    Typography,
    useMediaQuery
} from "@mui/material";
import {useNavigate, useParams} from "react-router-dom";
import TopAppBar from "./TopAppBar.jsx";
import {Add} from "@mui/icons-material";
import {jwtDecode} from "jwt-decode";
import {useTheme} from "@mui/material/styles";
import {adjustPostOrCommentDateToUserTimezone} from "../utils/DateUtils.js";
import endpoints from "../utils/Endpoints.js";
import {useAlertSnackbar} from "./use_functions/useAlertSnackbar.jsx";

export default function Post({isAuthenticated, setIsAuthenticated}) {
    const [post, setPost] = useState([]);
    const [comments, setComments] = useState([]);
    const [page, setPage] = useState(1);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [showComments, setShowComments] = useState(true);
    const [addCommentDialogOpen, setAddCommentDialogOpen] = useState(false);
    const [newCommentContent, setNewCommentContent] = useState('');
    const [postLoading, setPostLoading] = useState(true);
    const [fetchPostError, setFetchPostError] = useState(null);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [fetchCommentsError, setFetchCommentsError] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [isOwnPost, setIsOwnPost] = useState(false)
    const [editPostDialogOpen, setEditPostDialogOpen] = useState(false);
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [tag, setTag] = useState('');
    const [newTags, setNewTags] = useState([]);
    const [deletePostDialogOpen, setDeletePostDialogOpen] = useState(false)
    const [deleteCommentDialogOpen, setDeleteCommentDialogOpen] = useState(false)
    const [editCommentDialogOpen, setEditCommentDialogOpen] = useState(false)
    const [commentUniqueNum, setCommentUniqueNum] = useState('')
    const [editedCommentContent, setEditedCommentContent] = useState('')
    const {openSnackbar,handleSnackbarClose, AlertSnackbar} = useAlertSnackbar();
    const {uniqueNum} = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        const fetchPost = async () => {
            setPostLoading(true);
            try {
                const response = await axios.get(endpoints.posts.getByUniqueNum(uniqueNum));
                const token = localStorage.getItem('jwt');
                if (token) {
                    const decodedToken = jwtDecode(token);
                    const user = decodedToken.sub;
                    if (user === response.data.author) {
                        setIsOwnPost(true);
                        setNewTags(response.data.tags);
                        setNewPostTitle(response.data.title);
                        setNewPostContent(response.data.content);
                    }
                }
                setPost(response.data);
                fetchComments();
            } catch (error) {
                console.error(error);
                setFetchPostError('Failed to load post. Please try again later.');
                setFetchCommentsError('Failed to load comments. Please try again later.')
            } finally {
                setPostLoading(false);
                setCommentsLoading(false);
            }
        };
        fetchPost();
    }, [uniqueNum, page, size]);

    const fetchComments = async () => {
        setCommentsLoading(true);
        await axios.get(endpoints.comments.getAllByPostUniqueNum(uniqueNum, page, size))
            .then(response => {
                setComments(response.data.comments)
                setTotalPages(response.data.totalPages)
            }).catch(error => {
                console.error(error);
                setFetchCommentsError('Failed to load comments. Please try again later.')
            }).finally(() => {
                setCommentsLoading(false);
            })
    }

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleDisplayComments = () => setShowComments((state) => !state);

    const handleAuthorClick = (author) => {
        navigate(`/profile/${author}`)
    }

    const handleSearchTag = (keyword) => {
        navigate(`/search/${keyword}`, {state: {searchType: 'tags'}})
    }

    const reloadToPageOne = () => {
        if (page === 1) {
            window.location.reload();
        } else {
            setPage(1);
        }
    }

    //edit post
    const handleEditPost = async () => {
        const token = localStorage.getItem('jwt');
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
                tags: newTags
            };
            setEditPostDialogOpen(false);
            openSnackbar('Editing', 'info',6000)
            await axios.put(endpoints.posts.editByUniqueNum(uniqueNum), newPost, {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            }).then(() => {
                reloadToPageOne()
            }).catch(error => {
                console.error(error);
                openSnackbar('Editing failed. Please try again later.', 'error',6000)
            });
        }
    }

    const handleClickEditPost = () => setEditPostDialogOpen((state) => !state)

    const handleAddTag = () => {
        if (tag && !newTags.includes(tag)) {
            setNewTags([...newTags, tag]);
            setTag('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setNewTags(newTags.filter(tag => tag !== tagToRemove));
    };

    //delete post
    const handleDeletePost = async () => {
        const token = localStorage.getItem('jwt');
        setDeletePostDialogOpen(false)
        openSnackbar('Deleting', 'info',6000)
        await axios.delete(endpoints.posts.deleteByUniqueNum(uniqueNum), {
            headers: {
                Authorization: 'Bearer ' + token
            }
        }).then(() => {
            navigate("/home")
        }).catch(error => {
            console.error(error);
            openSnackbar('Deletion failed. Please try again later.', 'error',6000)
        })
    }

    const handleClickDeletePost = () => setDeletePostDialogOpen((state) => !state)

    //add comment
    const handleAddComment = async () => {
        const token = localStorage.getItem('jwt');
        const decodedToken = jwtDecode(token);
        const user = decodedToken.sub;

        let currentFormErrors = {}
        if (!newCommentContent.trim()) {
            currentFormErrors.content = "Content cannot be empty";
        }
        setFormErrors(currentFormErrors)

        if (Object.keys(currentFormErrors).length === 0) {
            const newComment = {
                content: newCommentContent,
                author: user
            }
            setAddCommentDialogOpen(false)
            openSnackbar('Commenting', 'info',6000)
            await axios.post(endpoints.comments.createByPostUniqueNum(uniqueNum), newComment, {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            }).then(() => {
                setNewCommentContent('')
                reloadToPageOne()
            }).catch(error => {
                console.error(error)
                openSnackbar('Couldn\'t comment. Please try again later.', 'error',6000)
            })
        }
    }

    const handleClickAddComment = () => setAddCommentDialogOpen((state) => !state);

    //delete comment
    const handleDeleteComment = async () => {
        const token = localStorage.getItem('jwt');
        setDeleteCommentDialogOpen(false)
        openSnackbar('Commenting', 'info',6000)
        await axios.delete(endpoints.comments.deleteByCommentUniqueNum(commentUniqueNum), {
            headers: {
                Authorization: 'Bearer ' + token
            }
        }).then(() => {
            reloadToPageOne()
        }).catch(error => {
            console.error(error);
            openSnackbar('Deletion failed. Please try again later.', 'error',6000)
        });
    }


    const handleClickDeleteCommentClose = () => {
        setDeleteCommentDialogOpen(false)
        setCommentUniqueNum('')
    }

    const handleClickDeleteCommentOpen = (deletedCommentUniqueNum) => {
        setDeleteCommentDialogOpen(true)
        setCommentUniqueNum(deletedCommentUniqueNum)
    }

    //edit comment
    const handleEditComment = async () => {
        const token = localStorage.getItem('jwt');

        let currentFormErrors = {}
        if (!editedCommentContent.trim()) {
            currentFormErrors.content = "Content cannot be empty";
        }
        setFormErrors(currentFormErrors)
        setEditCommentDialogOpen(false);
        openSnackbar('Commenting', 'info',6000)

        if (Object.keys(currentFormErrors).length === 0) {
            const newComment = {
                content: editedCommentContent,
            }

            await axios.put(endpoints.comments.editByCommentUniqueNum(commentUniqueNum), newComment, {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            }).then(() => {
                setEditedCommentContent('');
                fetchComments()
                handleSnackbarClose()
            }).catch(error => {
                console.error(error)
                openSnackbar('Editing failed. Please try again later.', 'error',6000)
            })
        }
    }

    const handleClickEditCommentClose = () => {
        setEditCommentDialogOpen(false)
        setCommentUniqueNum('')
    }

    const handleClickEditCommentOpen = (editedCommentUniqueNum, content) => {
        setEditCommentDialogOpen(true)
        setCommentUniqueNum(editedCommentUniqueNum)
        setEditedCommentContent(content)
    }

    return (
        <Fragment>
            <TopAppBar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}/>
            <Container sx={{flexWrap: 'wrap', marginTop: 2}}>
                {postLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                        <CircularProgress/>
                    </Box>
                ) : fetchPostError ? (
                    <Alert severity="error">{fetchPostError}</Alert>
                ) : (
                    <Fragment>
                        <Typography variant="h4" gutterBottom sx={{wordBreak: "break-word"}}>
                            {post.title}
                        </Typography>
                        {isOwnPost &&
                            <Fragment>
                                <Button color="primary" onClick={handleClickEditPost}>
                                    Edit
                                </Button>
                                <Button color="secondary" onClick={handleClickDeletePost}>
                                    Delete
                                </Button>
                            </Fragment>
                        }
                        <Divider/>
                        <Typography variant="body1" gutterBottom mt={2}
                                    sx={{wordBreak: "break-word", whiteSpace: "pre-wrap"}}>
                            {post.content}
                        </Typography>
                        <Button variant="caption" color="textPrimary" ml={2}
                                onClick={() => handleAuthorClick(post.author)}>
                            Written by {post.author} at {adjustPostOrCommentDateToUserTimezone(post.createdAt)}
                        </Button>
                        <Box sx={{display: 'flex', flexWrap: 'wrap'}}>
                            {post.tags && post.tags.map((tag) => (
                                <Button onClick={() => handleSearchTag(tag)} key={tag}
                                        sx={{margin: 0.5, padding: 1, wordBreak: "break-word"}}>
                                    {tag}
                                </Button>
                            ))}
                        </Box>
                    </Fragment>
                )}
                <Divider>
                    <Chip label="COMMENTS" onClick={handleDisplayComments} color="primary"/>
                </Divider>
                {showComments &&
                    <Fragment>
                        {commentsLoading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                            <CircularProgress/>
                        </Box>
                        ) : fetchCommentsError ? (
                        <Alert severity="error">{fetchCommentsError}</Alert>
                        ) : (
                        <List>
                            {comments.length>0?(
                                comments.map((comment) => {
                                const token = localStorage.getItem('jwt');
                                let user = '';
                                if (token) {
                                    const decodedToken = jwtDecode(token);
                                    user = decodedToken.sub
                                }
                                return (
                                    <ListItem key={comment.uniqueNum} alignItems="flex-start">
                                        <Paper sx={{margin: 0.5, padding: 1, width: '100%'}}>
                                            <Typography variant="body1" gutterBottom ml={2} mt={1}
                                                        sx={{wordBreak: "break-word", whiteSpace: "pre-wrap"}}>
                                                {comment.content}
                                            </Typography>
                                            <Button variant="caption" color="textPrimary"
                                                    onClick={() => handleAuthorClick(comment.author)}>
                                                Written
                                                by {comment.author} at {adjustPostOrCommentDateToUserTimezone(comment.createdAt)}
                                            </Button>

                                            {comment.author === user &&
                                                <Fragment>
                                                    <Button color="primary"
                                                            onClick={() => handleClickEditCommentOpen(comment.uniqueNum, comment.content)}>Edit</Button>
                                                    <Button color="secondary"
                                                            onClick={() => handleClickDeleteCommentOpen(comment.uniqueNum)}>Delete </Button>
                                                </Fragment>
                                            }
                                        </Paper>
                                    </ListItem>
                                );
                            })):(
                                <Paper sx={{margin: 0.5, padding: 1, width: '100%', textAlign: 'center'}}>
                                    <Typography variant="h6" color="textPrimary">
                                        This post has no comments.
                                    </Typography>
                                </Paper>
                            )}
                        </List>
                        )}
                        {!commentsLoading && !fetchCommentsError && comments.length>0 && (
                        <Box display="flex" justifyContent="space-between" my={2}>
                            <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary"/>
                        </Box>
                        )}
                    </Fragment>
                }
            </Container>
            {isAuthenticated && !commentsLoading && !fetchCommentsError && !postLoading && !fetchPostError &&
                <Fab onClick={handleClickAddComment} variant="extended" color="primary" aria-label="add" sx={{
                    margin: 0,
                    top: 'auto',
                    right: 20,
                    bottom: 20,
                    left: 'auto',
                    position: 'fixed',
                }}>
                    <Add/>
                    Comment
                </Fab>
            }
            <AlertSnackbar/>
            <Dialog id="editPostDialog" open={editPostDialogOpen} onClose={handleClickEditPost} fullWidth={true}
                    fullScreen={fullScreen}>
                <DialogTitle>Edit Post</DialogTitle>
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
                        value={tag}
                        onChange={(e) => setTag(e.target.value)}
                    />
                    <Button onClick={handleAddTag}>Add Tag</Button>
                    <Box sx={{display: 'flex', flexWrap: 'wrap', marginTop: 2}}>
                        {newTags.map((tag, index) => (
                            <Paper key={index} sx={{margin: 0.5, padding: 1}}>
                                {tag}
                                <Button onClick={() => handleRemoveTag(tag)}>Remove</Button>
                            </Paper>
                        ))}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClickEditPost}>Cancel</Button>
                    <Button type="submit" onClick={handleEditPost}>Post</Button>
                </DialogActions>
            </Dialog>
            <Dialog id="deletePostDialog" open={deletePostDialogOpen} onClose={handleClickDeletePost}>
                <DialogTitle>Are you sure you want to delete this post?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        If you delete this post, there is no turning back. All of the comments will be deleted too.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClickDeletePost} color="primary">Cancel</Button>
                    <Button type="submit" onClick={handleDeletePost} color="secondary">Delete</Button>
                </DialogActions>
            </Dialog>

            <Dialog id="addCommentDialog" open={addCommentDialogOpen} onClose={handleClickAddComment}
                    fullWidth={true}
                    fullScreen={fullScreen}>
                <DialogTitle>Add Comment</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="normal"
                        variant="standard"
                        label="Content"
                        type="text"
                        fullWidth
                        multiline
                        rows={20}
                        required
                        inputProps={{maxLength: 1000}}
                        value={newCommentContent}
                        onChange={(e) => setNewCommentContent(e.target.value)}
                        error={!!formErrors.content}
                        helperText={formErrors.content}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClickAddComment}>Cancel</Button>
                    <Button type="submit" onClick={handleAddComment}>Comment</Button>
                </DialogActions>
            </Dialog>
            <Dialog id="editCommentDialog" open={editCommentDialogOpen} onClose={handleClickEditCommentClose}
                    fullWidth={true}
                    fullScreen={fullScreen}>
                <DialogTitle>Edit Comment</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="normal"
                        variant="standard"
                        label="Content"
                        type="text"
                        fullWidth
                        multiline
                        rows={20}
                        required
                        inputProps={{maxLength: 1000}}
                        value={editedCommentContent}
                        onChange={(e) => setEditedCommentContent(e.target.value)}
                        error={!!formErrors.content}
                        helperText={formErrors.content}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClickEditCommentClose} color="secondary">Cancel</Button>
                    <Button type="submit" onClick={handleEditComment}>Edit Comment</Button>
                </DialogActions>
            </Dialog>
            <Dialog id="deleteCommentDialog" open={deleteCommentDialogOpen} onClose={handleClickDeleteCommentClose}>
                <DialogTitle>Are you sure you want to delete this comment?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        If you delete this comment, there is no turning back.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClickDeleteCommentClose} color="primary">Cancel</Button>
                    <Button type="submit" onClick={handleDeleteComment} color="secondary">Delete</Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    )
}