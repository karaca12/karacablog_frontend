import {useLocation, useNavigate, useParams} from "react-router-dom";
import TopAppBar from "./TopAppBar.jsx";
import {Fragment, useEffect, useState} from "react";
import axios from "axios";
import endpoints from "../utils/Endpoints.js";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Pagination,
    Paper,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from "@mui/material";
import {adjustPostOrCommentDateToUserTimezone} from "../utils/DateUtils.js";
import {truncateContent} from "../utils/TruncateContent.js";

export default function Search({isAuthenticated, setIsAuthenticated}) {
    const [page, setPage] = useState(1);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [posts, setPosts] = useState([]);
    const [searchType, setSearchType] = useState('posts');
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const navigate = useNavigate();
    const {searchTerm} = useParams()
    const location = useLocation();

    useEffect(() => {
        if (location.state?.searchType) {
            setSearchType(location.state.searchType);
        }
    }, [location.state]);

    useEffect(() => {
        const fetchSearchResults = async () => {
            setLoading(true)
            try {
                let response;
                switch (searchType) {
                    case 'posts':
                        response = await axios.post(endpoints.posts.searchByKeyword(searchTerm, page, size));
                        setPosts(response.data.posts);
                        setTotalPages(response.data.totalPages);
                        break;
                    case 'tags':
                        response = await axios.post(endpoints.posts.searchByTag(searchTerm, page, size));
                        setPosts(response.data.posts);
                        setTotalPages(response.data.totalPages);
                        break;
                    case 'users':
                        response = await axios.post(endpoints.users.searchByKeyword(searchTerm, page, size));
                        setUsers(response.data.users);
                        setTotalPages(response.data.totalPages);
                        break;
                    default:
                        break;
                }
            } catch (error) {
                console.error(error);
                setFetchError('Failed to load. Please try again later.');
            } finally {
                setLoading(false)
            }
        };

        fetchSearchResults();
    }, [searchType, searchTerm, page, size]);

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

    const handleSearchType = (event, newSearchType) => {
        setPage(1)
        if (newSearchType !== null) {
            setSearchType(newSearchType);
        }
    };

    const renderList = () => {
        switch (searchType) {
            case 'users':
                return (
                    <Fragment>
                        <List>
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <Fragment key={user.username}>
                                        <ListItem alignItems="flex-start">
                                            <Paper sx={{margin: 0.5, padding: 1, width: '100%'}}>
                                                <ListItemButton onClick={() => handleAuthorClick(user.username)}>
                                                    <ListItemText
                                                        primary={
                                                            <Typography variant="h6" color="textPrimary"
                                                                        sx={{
                                                                            wordBreak: "break-word",
                                                                            whiteSpace: "pre-wrap"
                                                                        }}>
                                                                {user.username}
                                                            </Typography>
                                                        }
                                                        secondary={
                                                            <Typography variant="body2" color="textPrimary"
                                                                        sx={{
                                                                            wordBreak: "break-word",
                                                                            whiteSpace: "pre-wrap"
                                                                        }}>
                                                                {user.firstName} {user.lastName}
                                                            </Typography>
                                                        }
                                                    />
                                                </ListItemButton>
                                            </Paper>
                                        </ListItem>
                                    </Fragment>
                                ))
                            ) : (
                                <Paper sx={{margin: 0.5, padding: 1, width: '100%', textAlign: 'center'}}>
                                    <Typography variant="h6" color="textPrimary">
                                        No results found
                                    </Typography>
                                </Paper>
                            )}
                        </List>
                        {!loading && !fetchError && users.length>0 &&(
                            <Box display="flex" justifyContent="space-between" my={2}>
                                <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary"/>
                            </Box>
                        )}
                    </Fragment>
                )
            default:
                return (
                    <Fragment>
                        <List>
                            {posts.length > 0 ? (
                                posts.map((post) => (
                                    <Fragment key={post.uniqueNum}>
                                        <ListItem alignItems="flex-start">
                                            <Paper sx={{margin: 0.5, padding: 1, width: '100%'}}>
                                                <ListItemButton onClick={() => handleClickPost(post.uniqueNum)}>
                                                    <ListItemText
                                                        primary={
                                                            <Typography variant="h6" color="textPrimary"
                                                                        sx={{
                                                                            wordBreak: "break-word",
                                                                            whiteSpace: "pre-wrap"
                                                                        }}>
                                                                {post.title}
                                                            </Typography>
                                                        }
                                                        secondary={
                                                            <Typography variant="body2" color="textPrimary"
                                                                        sx={{
                                                                            wordBreak: "break-word",
                                                                            whiteSpace: "pre-wrap"
                                                                        }}>
                                                                {truncateContent(post.content, 500)}
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
                                        No results found
                                    </Typography>
                                </Paper>
                            )}
                        </List>
                        {!loading && !fetchError && posts.length>0 && (
                            <Box display="flex" justifyContent="space-between" my={2}>
                                <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary"/>
                            </Box>
                        )}
                    </Fragment>
                )
        }
    }


    return (
        <Fragment>
            <TopAppBar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}/>
            <Container>
                <Typography variant="h4" gutterBottom sx={{wordBreak: "break-word"}}>
                    Search results of {"'" + searchTerm + "'"}
                </Typography>
                <ToggleButtonGroup value={searchType} exclusive onChange={handleSearchType} aria-label="search type">
                    <ToggleButton value="posts" aria-label="posts">Posts</ToggleButton>
                    <ToggleButton value="tags" aria-label="tags">Tags</ToggleButton>
                    <ToggleButton value="users" aria-label="users">Users</ToggleButton>
                </ToggleButtonGroup>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                        <CircularProgress/>
                    </Box>
                ) : fetchError ? (
                    <Alert severity="error">{fetchError}</Alert>
                ) : (
                    renderList()
                )}
            </Container>
        </Fragment>
    )
}

