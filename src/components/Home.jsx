import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import {
    Box,
    Container,
    Divider,
    List,
    ListItemButton,
    ListItemText,
    Pagination,
    Paper,
    Typography
} from "@mui/material";
import TopAppBar from "./TopAppBar.jsx";


function Home({onLogout}) {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("jwt");
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

    }, [navigate, page, size])

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

    return (<>
            <TopAppBar handleLogout={handleLogout}/>
            <Container sx={{marginTop: 3}}>
                <Typography variant="h4" gutterBottom>
                    Posts
                </Typography>
                <Divider/>
                <List>
                    {posts.map((post) => (
                        <>
                            {post.tags.map((tag) => (
                                <Paper key={tag}>
                                    {tag}
                                </Paper>
                            ))}
                            <ListItemButton key={post.uniqueNum} alignItems="flex-start"
                                      onClick={() => handlePostClick(post.uniqueNum)}>
                                <Paper sx={{width: '100%'}}>
                                    <ListItemText primary={post.title} secondary={
                                        <Typography variant="body2" color="textPrimary">
                                            {post.content}
                                        </Typography>
                                    }/>
                                    <Typography variant="caption" color="textPrimary">
                                        Written by {post.author} at {post.updatedAt}
                                    </Typography>
                                </Paper>
                            </ListItemButton>
                        </>
                    ))}
                </List>
                <Box display="flex" justifyContent="space-between" my={2}>
                    <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary"/>
                </Box>
            </Container>
        </>

    )
}

export default Home;