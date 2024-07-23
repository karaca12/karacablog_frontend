import {useLocation, useNavigate, useParams} from "react-router-dom";
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
    Paper,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from "@mui/material";
import {adjustPostOrCommentDateToUserTimezone} from "../utils/DateUtils.js";

export default function Search({isAuthenticated, setIsAuthenticated}) {
    const {searchTerm} = useParams()
    const location = useLocation();
    const [page, setPage] = useState(1);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();
    const [searchType, setSearchType] = useState('posts');
    const [users, setUsers] = useState([])

    useEffect(() => {
        if (location.state?.searchType) {
            setSearchType(location.state.searchType);
        }
    }, [location.state]);

    useEffect(() => {
        switch (searchType) {
            case 'posts':
                axios.post(endpoints.posts.searchByKeyword(searchTerm, page, size))
                    .then(response => {
                        setPosts(response.data.posts);
                        setTotalPages(response.data.totalPages);
                    }).catch(error => {
                    console.error(error);
                })
                break;
            case 'tags':
                axios.post(endpoints.posts.searchByTag(searchTerm, page, size))
                    .then(response => {
                        setPosts(response.data.posts);
                        setTotalPages(response.data.totalPages);
                    }).catch(error => {
                    console.error(error);
                })
                break;
            case 'users':
                axios.post(endpoints.users.searchByKeyword(searchTerm, page, size))
                    .then(response => {
                        setUsers(response.data.users);
                        setTotalPages(response.data.totalPages);
                    }).catch(error => {
                    console.error(error);
                })
                break;
        }
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

    const truncateContent = (content,maxLength) => {
        const newlineIndex = content.indexOf('\n');

        if (newlineIndex !== -1 && newlineIndex < maxLength) {
            return content.substring(0, newlineIndex)+" ...";
        }

        return content.length > maxLength ? content.substring(0, maxLength) + " ..." : content;
    };

    const renderList = () => {
        switch (searchType) {
            case 'users':
                return <List>
                    {users.map((user) => (
                        <Fragment key={user.username}>
                            <ListItem alignItems="flex-start">
                                <Paper sx={{margin: 0.5, padding: 1, width: '100%'}}>
                                    <ListItemButton onClick={() => handleAuthorClick(user.username)}>
                                        <ListItemText
                                            primary={
                                                <Typography variant="h6" color="textPrimary"
                                                            sx={{wordBreak: "break-word", whiteSpace: "pre-wrap"}}>
                                                    {user.username}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography variant="body2" color="textPrimary"
                                                            sx={{wordBreak: "break-word", whiteSpace: "pre-wrap"}}>
                                                    {user.firstName} {user.lastName}
                                                </Typography>
                                            }
                                        />
                                    </ListItemButton>
                                </Paper>
                            </ListItem>
                        </Fragment>
                    ))}
                </List>
            default:
                return <List>
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
                                                    {truncateContent(post.content,500)}
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
                    ))}
                </List>
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
                {renderList()}
                <Box display="flex" justifyContent="space-between" my={2}>
                    <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary"/>
                </Box>
            </Container>
        </Fragment>
    )
}

