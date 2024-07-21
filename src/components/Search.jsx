import {useNavigate, useParams} from "react-router-dom";
import TopAppBar from "./TopAppBar.jsx";
import {Fragment, useEffect, useState} from "react";
import axios from "axios";
import endpoints from "../utils/Endpoints.js";
import {
    Box,
    Button,
    Container,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Pagination,
    Paper, ToggleButton, ToggleButtonGroup,
    Typography
} from "@mui/material";
import {adjustPostOrCommentDateToUserTimezone} from "../utils/DateUtils.js";

function Search({isAuthenticated, setIsAuthenticated}) {
    const {searchTerm} = useParams()
    const [page, setPage] = useState(1);
    const [size] = useState(10);
    const [posts, setPosts] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const [searchType, setSearchType] = useState('posts');


    useEffect(() => {
        let endpoint;
        switch (searchType) {
            case 'posts':
                endpoint = endpoints.posts.searchByKeyword(searchTerm, page, size);
                break;
            case 'tags':
                endpoint = endpoints.tags.searchByKeyword(searchTerm, page, size);
                break;
            case 'users':
                endpoint = endpoints.users.searchByKeyword(searchTerm, page, size);
                break;
        }
        axios.post(endpoint)
            .then(response => {
                setPosts(response.data.posts);
                setTotalPages(response.data.totalPages);
            }).catch(error => {
            console.error(error);
        })
    }, [searchType,searchTerm,page,size]);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleClickPost = (uniqueNum) => {
        navigate(`/post/${uniqueNum}`);
    };

    const handleAuthorClick = (author) => {
        navigate(`/profile/${author}`)
    }

    const handleAlignment = (event, newAlignment) => {
        if (newAlignment !== null) {
            setSearchType(newAlignment);
        }
    };


    return (
        <Fragment>
            <TopAppBar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}/>
            <Container>
                <ToggleButtonGroup value={searchType} exclusive onChange={handleAlignment} aria-label="search type">
                    <ToggleButton value="posts" aria-label="posts">Posts</ToggleButton>
                    <ToggleButton value="tags" aria-label="tags">Tags</ToggleButton>
                    <ToggleButton value="users" aria-label="users">Users</ToggleButton>
                </ToggleButtonGroup>

                <List>
                    {posts.map((post) => (
                        <Fragment key={post.uniqueNum}>
                            <ListItem alignItems="flex-start">
                                <Paper sx={{margin: 0.5, padding: 1, width: '100%'}}>
                                    <ListItemButton onClick={() => handleClickPost(post.uniqueNum)}>
                                        <ListItemText
                                            primary={
                                                <Typography variant="h6" color="textPrimary"
                                                            sx={{wordBreak: "break-word", whiteSpace: "pre-wrap"}}>
                                                    {post.title}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography variant="body2" color="textPrimary"
                                                            sx={{wordBreak: "break-word", whiteSpace: "pre-wrap"}}>
                                                    {post.content.length > 1000 ? post.content.substring(0, 1000) + "..." : post.content}
                                                </Typography>
                                            }
                                        />
                                    </ListItemButton>
                                    <Button variant="caption" color="textPrimary" ml={2}
                                            onClick={() => handleAuthorClick(post.author)}>
                                        Written
                                        by {post.author} at {adjustPostOrCommentDateToUserTimezone(post.createdAt)}
                                    </Button>
                                    <Box sx={{display: 'flex', flexWrap: 'wrap'}}>
                                        {post.tags.map((tag) => (
                                            <Button onClick={() => console.log(`Tag clicked: ${tag}`)} key={tag}
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
        </Fragment>
    )
}

export default Search;