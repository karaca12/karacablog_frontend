import {Fragment, useEffect, useState} from "react";
import axios from "axios";
import {
    Box,
    Button,
    Chip,
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

function Post({onLogout}) {
    const [post, setPost] = useState([]);
    const [comments, setComments] = useState([]);
    const [page, setPage] = useState(1);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [showComments, setShowComments] = useState(true);
    const {uniqueNum} = useParams();
    const navigate = useNavigate();
    const [addCommentDialogOpen, setAddCommentDialogOpen] = useState(false);
    const [newCommentContent, setNewCommentContent] = useState('');
    const [errors, setErrors] = useState({});
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [isOwnPost, setIsOwnPost] = useState(false)
    const [editPostDialogOpen, setEditPostDialogOpen] = useState(false);
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [tag, setTag] = useState('');
    const [newTags, setNewTags] = useState([]);
    const [deletePostDialogOpen, setDeletePostDialogOpen] = useState(false)
    const token = localStorage.getItem('jwt');
    const decodedToken = jwtDecode(token);
    const user = decodedToken.sub;
    const [deleteCommentDialogOpen, setDeleteCommentDialogOpen] = useState(false)
    const [editCommentDialogOpen, setEditCommentDialogOpen] = useState(false)
    const [commentUniqueNum, setCommentUniqueNum] = useState('')
    const [editedCommentContent, setEditedCommentContent] = useState('')

    useEffect(() => {
        axios.get(`http://localhost:8080/api/posts/${uniqueNum}`,
            {
                headers:
                    {Authorization: 'Bearer ' + token}
            })
            .then(response => {
                setPost(response.data)
                if (user === response.data.author) {
                    setIsOwnPost(true)
                    setNewTags(response.data.tags)
                    setNewPostTitle(response.data.title)
                    setNewPostContent(response.data.content)
                }
                fetchComments()
            }).catch(error => {
            console.error(error);
        })
    }, [uniqueNum, page, token, user]);

    const fetchComments = () => {
        axios.get(`http://localhost:8080/api/comments/post/${uniqueNum}?page=${page - 1}&size=${size}`,
            {
                headers:
                    {Authorization: 'Bearer ' + token}
            })
            .then(response => {
                setComments(response.data.comments)
                setTotalPages(response.data.totalPages)
            }).catch(error => {
            console.error(error);
        })
    }

    const handleLogout = () => {
        localStorage.removeItem('jwt')
        onLogout(false);
    }

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleDisplayComments = () => {
        setShowComments(!showComments);
    }

    const handleAuthorClick = (author) => {
        navigate(`/profile/${author}`)
    }

    const reloadToPageOne = () => {
        if (page === 1) {
            window.location.reload();
        } else {
            setPage(1);
        }
    }

    //edit post
    const handleEditPost = () => {

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
                tags: newTags
            };

            axios.put(`http://localhost:8080/api/posts/${uniqueNum}`, newPost, {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            }).then(() => {
                setEditPostDialogOpen(false);
                reloadToPageOne()
            }).catch(error => {
                console.error(error);
            });
        }
    }

    const handleEditPostClickOpen = () => {
        setEditPostDialogOpen(true)
    }
    const handleEditPostClickClose = () => {
        setEditPostDialogOpen(false)
    }

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
    const handleDeletePost = () => {

        axios.delete(`http://localhost:8080/api/posts/${uniqueNum}`, {
            headers: {
                Authorization: 'Bearer ' + token
            }
        }).then(() => {
            navigate("/home")
        }).catch(error => {
            console.error(error);
        });
    }

    const handleDeletePostClickClose = () => {
        setDeletePostDialogOpen(false)
    }

    const handleDeletePostClickOpen = () => {
        setDeletePostDialogOpen(true)
    }

    //add comment
    const handleAddComment = () => {

        let formErrors = {}
        if (!newCommentContent.trim()) {
            formErrors.content = "Content cannot be empty";
        }
        setErrors(formErrors)

        if (Object.keys(formErrors).length === 0) {
            const newComment = {
                content: newCommentContent,
                author: user
            }

            axios.post(`http://localhost:8080/api/comments/post/${uniqueNum}`, newComment, {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            }).then(() => {
                setAddCommentDialogOpen(false)
                setNewCommentContent('')
                reloadToPageOne()
            }).catch(error => {
                console.error(error)
            })
        }
    }

    const handleAddCommentClickClose = () => {
        setAddCommentDialogOpen(false);
    }

    const handleAddCommentClickOpen = () => {
        setAddCommentDialogOpen(true);
    }

    //delete comment
    const handleDeleteComment = () => {

        axios.delete(`http://localhost:8080/api/comments/${commentUniqueNum}`, {
            headers: {
                Authorization: 'Bearer ' + token
            }
        }).then(() => {
            setDeleteCommentDialogOpen(false)
            reloadToPageOne()
        }).catch(error => {
            console.error(error);
        });
    }


    const handleDeleteCommentClickClose = () => {
        setDeleteCommentDialogOpen(false)
        setCommentUniqueNum('')
    }

    const handleDeleteCommentClickOpen = (deletedCommentUniqueNum) => {
        setDeleteCommentDialogOpen(true)
        setCommentUniqueNum(deletedCommentUniqueNum)
    }

    //edit comment
    const handleEditComment = () => {

        let formErrors = {}
        if (!editedCommentContent.trim()) {
            formErrors.content = "Content cannot be empty";
        }
        setErrors(formErrors)

        if (Object.keys(formErrors).length === 0) {
            const newComment = {
                content: editedCommentContent,
            }

            axios.put(`http://localhost:8080/api/comments/${commentUniqueNum}`, newComment, {
                headers: {
                    Authorization: 'Bearer ' + token
                }
            }).then(() => {
                setEditCommentDialogOpen(false);
                setEditedCommentContent('');
                fetchComments()
            }).catch(error => {
                console.error(error)
            })
        }
    }

    const handleEditCommentClickClose = () => {
        setEditCommentDialogOpen(false)
        setCommentUniqueNum('')
    }

    const handleEditCommentClickOpen = (editedCommentUniqueNum, content) => {
        setEditCommentDialogOpen(true)
        setCommentUniqueNum(editedCommentUniqueNum)
        setEditedCommentContent(content)
    }

    return (
        <Fragment>
            <TopAppBar handleLogout={handleLogout}/>
            <Container sx={{flexWrap: 'wrap', marginTop: 2}}>
                <Typography variant="h4" gutterBottom sx={{wordBreak: "break-word"}}>
                    {post.title}
                </Typography>
                {isOwnPost &&
                    <Fragment>
                        <Button color="primary" onClick={handleEditPostClickOpen}>
                            Edit
                        </Button>
                        <Button color="error" onClick={handleDeletePostClickOpen}>
                            Delete
                        </Button>
                    </Fragment>
                }
                <Divider/>
                <Typography variant="body1" gutterBottom mt={2} sx={{wordBreak: "break-word"}}>
                    {post.content}
                </Typography>
                <Button variant="caption" color="textPrimary" ml={2} onClick={() => handleAuthorClick(post.author)}>
                    Written by {post.author} at {post.createdAt}
                </Button>
                <Box sx={{display: 'flex', flexWrap: 'wrap'}}>
                    {post.tags && post.tags.map((tag) => (
                        //todo:Add onClick search for tags
                        <Button onClick={() => console.log('blabla')} key={tag}
                                sx={{margin: 0.5, padding: 1, wordBreak: "break-word"}}>
                            {tag}
                        </Button>
                    ))}
                </Box>
                <Divider>
                    <Chip label="COMMENTS" onClick={handleDisplayComments} color="primary"/>
                </Divider>
                {showComments &&
                    <Fragment>
                        <List>
                            {comments.map((comment) => {

                                return (
                                    <ListItem key={comment.uniqueNum} alignItems="flex-start">
                                        <Paper sx={{margin: 0.5, padding: 1, width: '100%'}}>
                                            <Typography variant="body1" gutterBottom ml={2} mt={1}
                                                        sx={{wordBreak: "break-word"}}>
                                                {comment.content}
                                            </Typography>
                                            <Button variant="caption" color="textPrimary"
                                                    onClick={() => handleAuthorClick(comment.author)}>
                                                Written by {comment.author} at {comment.createdAt}
                                            </Button>
                                            {comment.author === user &&
                                                <Fragment>
                                                    <Button color="primary"
                                                            onClick={() => handleEditCommentClickOpen(comment.uniqueNum, comment.content)}>Edit</Button>
                                                    <Button color="error"
                                                            onClick={() => handleDeleteCommentClickOpen(comment.uniqueNum)}>Delete </Button>
                                                </Fragment>
                                            }
                                        </Paper>
                                    </ListItem>
                                );
                            })}
                        </List>
                        <Box display="flex" justifyContent="space-between" my={2}>
                            <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary"/>
                        </Box>
                    </Fragment>
                }
            </Container>
            <Fab onClick={handleAddCommentClickOpen} variant="extended" color="primary" aria-label="add" sx={{
                margin: 0,
                top: 'auto',
                right: 20,
                bottom: 20,
                left: 'auto',
                position: 'fixed',
            }}>
                <Add/>
                Add Comment
            </Fab>
            <Dialog id="editPostDialog" open={editPostDialogOpen} onClose={handleEditPostClickClose} fullWidth={true}
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
                    <Button onClick={handleEditPostClickClose}>Cancel</Button>
                    <Button type="submit" onClick={handleEditPost}>Post</Button>
                </DialogActions>
            </Dialog>
            <Dialog id="deletePostDialog" open={deletePostDialogOpen} onClose={handleDeletePostClickClose}>
                <DialogTitle>Are you sure you want to delete this post?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        If you delete this post, there is no turning back. All of the comments will be deleted too.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeletePostClickClose} color="primary">Cancel</Button>
                    <Button type="submit" onClick={handleDeletePost} color="error">Delete</Button>
                </DialogActions>
            </Dialog>

            <Dialog id="addCommentDialog" open={addCommentDialogOpen} onClose={handleAddCommentClickClose}
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
                        error={!!errors.content}
                        helperText={errors.content}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddCommentClickClose}>Cancel</Button>
                    <Button type="submit" onClick={handleAddComment}>Comment</Button>
                </DialogActions>
            </Dialog>
            <Dialog id="editCommentDialog" open={editCommentDialogOpen} onClose={handleEditCommentClickClose}
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
                        error={!!errors.content}
                        helperText={errors.content}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditCommentClickClose}>Cancel</Button>
                    <Button type="submit" onClick={handleEditComment}>Edit Comment</Button>
                </DialogActions>
            </Dialog>
            <Dialog id="deleteCommentDialog" open={deleteCommentDialogOpen} onClose={handleDeleteCommentClickClose}>
                <DialogTitle>Are you sure you want to delete this comment?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        If you delete this comment, there is no turning back.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCommentClickClose} color="primary">Cancel</Button>
                    <Button type="submit" onClick={handleDeleteComment} color="error">Delete</Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    )
}

export default Post;