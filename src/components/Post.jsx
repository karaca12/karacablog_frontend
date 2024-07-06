import {useEffect, useState} from "react";
import axios from "axios";
import {
    Box,
    Chip,
    Container,
    Divider,
    List,
    ListItem,
    Pagination,
    Paper,
    Typography
} from "@mui/material";
import {useParams} from "react-router-dom";
import TopAppBar from "./TopAppBar.jsx";

function Post({onLogout}) {
    const [post, setPost] = useState([]);
    const [comments, setComments] = useState([]);
    const [page, setPage] = useState(1);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const {uniqueNum} = useParams();

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

    }, [uniqueNum,page,size]);

    const handleLogout = () => {
        localStorage.removeItem('jwt')
        onLogout(false);
    }

    const handlePageChange = (event, value) => {
        setPage(value);
    };


    return (<>
            <TopAppBar handleLogout={handleLogout}/>
            <Container sx={{marginTop: 3}}>
                <Typography variant="h4" gutterBottom>
                    {post.title}
                </Typography>
                <Divider/>
                <Typography variant="body1" gutterBottom>
                    {post.content}
                </Typography>
                <Typography variant="caption" color="textPrimary">
                    Written by {post.author} at {post.updatedAt}
                </Typography>
                {post.tags && post.tags.map((tag) => (
                    <Paper key={tag} sx={{margin: 1, padding: 1}}>
                        {tag}
                    </Paper>
                ))}
                <Divider>
                    <Chip label="COMMENTS"/>
                </Divider>
                <List>
                    {comments.map((comment) => (
                        <ListItem key={comment.uniqueNum} alignItems="flex-start">
                            <Paper sx={{width: '100%'}}>
                                <Typography variant="body2" color="textPrimary">
                                    {comment.content}
                                </Typography>
                                <Typography variant="caption" color="textPrimary">
                                    Written by {comment.author} at {comment.updatedAt}
                                </Typography>
                            </Paper>
                        </ListItem>
                    ))}
                </List>
                <Box display="flex" justifyContent="space-between" my={2}>
                    <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary"/>
                </Box>
            </Container>
        </>
    )
}

export default Post;