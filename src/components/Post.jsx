import {useEffect, useState} from "react";
import axios from "axios";
import {
    Box, Button,
    Chip,
    Container,
    Divider,
    List,
    ListItem,
    Pagination,
    Paper,
    Typography
} from "@mui/material";
import {useNavigate, useParams} from "react-router-dom";
import TopAppBar from "./TopAppBar.jsx";

function Post({onLogout}) {
    const [post, setPost] = useState([]);
    const [comments, setComments] = useState([]);
    const [page, setPage] = useState(1);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [showComments, setShowComments] = useState(false);
    const {uniqueNum} = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("jwt");
        axios.get(`http://localhost:8080/api/posts/${uniqueNum}`,
            {
                headers:
                    {Authorization: 'Bearer ' + token}
            })
            .then(response => {
                setPost(response.data)
            }).catch(error => {
            console.error(error);
        })

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

    }, [uniqueNum, page, size]);

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


    return (<>
            <TopAppBar handleLogout={handleLogout}/>
            <Container sx={{marginTop: 3}}>
                <Typography variant="h4" gutterBottom sx={{ wordBreak: "break-word" }}>
                    {post.title}
                </Typography>
                <Divider/>
                <Typography variant="body1" gutterBottom mt={2} sx={{ wordBreak: "break-word" }}>
                    {post.content}
                </Typography>
                <Button variant="caption" color="textPrimary" ml={2} onClick={()=>handleAuthorClick(post.author)}>
                    Written by {post.author} at {post.updatedAt}
                </Button>
                <Box sx={{display: 'flex', flexWrap: 'wrap'}}>
                    {post.tags &&post.tags.map((tag) => (
                        //todo:Add onClick search for tags
                        <Button onClick={() => console.log('blabla')} key={tag}
                                sx={{margin: 0.5, padding: 1,wordBreak: "break-word"}}>
                            {tag}
                        </Button>
                    ))}
                </Box>
                <Divider>
                    <Chip label="COMMENTS" onClick={handleDisplayComments} color="primary"/>
                </Divider>
                {showComments &&
                    <div>
                        <List>
                            {comments.map((comment) => (
                                <ListItem key={comment.uniqueNum} alignItems="flex-start">
                                    <Paper sx={{margin: 0.5, padding: 1, width: '100%'}}>
                                        <Typography variant="body1" gutterBottom ml={2} mt={1} sx={{ wordBreak: "break-word" }}>
                                            {post.content}
                                        </Typography>
                                        <Button variant="caption" color="textPrimary" onClick={()=>handleAuthorClick(comment.author)}>
                                            Written by {comment.author} at {comment.updatedAt}
                                        </Button>
                                    </Paper>
                                </ListItem>
                            ))}
                        </List>
                        <Box display="flex" justifyContent="space-between" my={2}>
                            <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary"/>
                        </Box>
                    </div>
                }

            </Container>
        </>
    )
}

export default Post;