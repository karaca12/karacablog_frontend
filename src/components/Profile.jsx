import {Fragment, useEffect, useState} from "react";
import axios from "axios";
import {useNavigate, useParams} from "react-router-dom";
import TopAppBar from "./TopAppBar.jsx";
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
    DialogTitle,
    Divider,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Pagination,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    useMediaQuery
} from "@mui/material";
import {jwtDecode} from "jwt-decode";
import {useTheme} from "@mui/material/styles";
import * as yup from "yup";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {adjustBirthDateToUserTimezone} from "../utils/DateUtils.js";
import endpoints from "../utils/Endpoints.js";
import {truncateContent} from "../utils/TruncateContent.js";
import {useAlertSnackbar} from "./use_functions/useAlertSnackbar.jsx";

export default function Profile({isAuthenticated, setIsAuthenticated}) {
    const [user, setUser] = useState({});
    const [isOwnProfile, setIsOwnProfile] = useState(false)
    const [editProfileDialogOpen, setEditProfileDialogOpen] = useState(false);
    const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
    const [areYouSurePasswordDialogOpen, setAreYouSurePasswordDialogOpen] = useState(false);
    const [passwordData, setPasswordData] = useState(null);
    const [postsLoading, setPostsLoading] = useState(true);
    const [fetchPostsError, setFetchPostsError] = useState(null);
    const [userLoading, setUserLoading] = useState(true);
    const [fetchUserError, setFetchUserError] = useState(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [displayPosts, setDisplayPosts] = useState(true)
    const [posts, setPosts] = useState([])
    const [page, setPage] = useState(1);
    const [size] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const {openSnackbar, AlertSnackbar} = useAlertSnackbar();
    const {username} = useParams()
    const navigate = useNavigate();
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const editSchema = yup.object().shape({
        email: yup.string().email('Please enter a valid email').required('Email is required'),
        firstName: yup.string().min(1, 'Name must be at least 1 character').max(50, 'Name must be maximum 50 of characters').required('Name is required'),
        lastName: yup.string().min(1, 'Surname must be at least 1 character').max(50, 'Surname must be maximum 50 of characters').required('Surname is required'),
        birthDate: yup.date().required('Birth date is required')
    });

    const passwordSchema = yup.object().shape({
        currentPassword: yup.string().min(6, 'Password must be at least 6 characters').max(20, 'Password must be maximum 20 of characters').required('Password is required'),
        newPassword: yup.string().min(6, 'Password must be at least 6 characters').max(20, 'Password must be maximum 20 of characters').required('Password is required'),
        confirmNewPassword: yup.string().oneOf([yup.ref('newPassword'), null], 'Passwords must match').required('Password is required')
    });

    const editForm = useForm({
        resolver: yupResolver(editSchema)
    })

    const passwordForm = useForm({
        resolver: yupResolver(passwordSchema)
    })


    useEffect(() => {
        const fetchPosts = async () => {
            setPostsLoading(true);
            await axios.get(endpoints.posts.getByUsername(username, page, size))
                .then(response => {
                    setPosts(response.data.posts)
                    setTotalPages(response.data.totalPages)
                }).catch(error => {
                    console.error(error);
                    setFetchPostsError('Failed to load posts. Please try again later.')
                }).finally(() => {
                    setPostsLoading(false)
                })
        }

        const fetchUser = async () => {
            setUserLoading(true)
            try {
                const response = await axios.get(endpoints.users.getByUsername(username));
                setUser(response.data);
                const token = localStorage.getItem("jwt");
                if (token) {
                    const decodedToken = jwtDecode(token);
                    const userFromToken = decodedToken.sub;
                    if (response.data.username === userFromToken) {
                        setIsOwnProfile(true);
                    }
                }
                fetchPosts();
            } catch (error) {
                console.error(error);
                setFetchUserError('Failed to load user. Please try again later.')
                setFetchPostsError('Failed to load posts. Please try again later.')
            } finally {
                setUserLoading(false)
                setPostsLoading(false)
            }
        };

        fetchUser();
    }, [username, page, size]);


    const handleDisplayPosts = () => setDisplayPosts((state) => !state)
    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleClickPost = (uniqueNum) => {
        navigate(`/post/${uniqueNum}`);
    };

    const handleSearchTag = (keyword) => {
        navigate(`/search/${keyword}`, {state: {searchType: 'tags'}})
    }

    useEffect(() => {
        if (user) {
            editForm.setValue("email", user.email);
            editForm.setValue("firstName", user.firstName);
            editForm.setValue("lastName", user.lastName);
            editForm.setValue("birthDate", user.birthDate ?
                adjustBirthDateToUserTimezone(user.birthDate).split('-').reverse().join('-') : '');
        }
    }, [user, editForm]);


    //edit profile
    const handleEditProfile = async data => {
        const token = localStorage.getItem("jwt");
        setEditProfileDialogOpen(false)
        openSnackbar('Editing', 'info', 6000)
        await axios.put(endpoints.users.editByUsername(username), data, {
            headers: {
                Authorization: 'Bearer ' + token
            }
        }).then(() => {
            window.location.reload();
        }).catch(error => {
            console.error(error)
            openSnackbar('Editing failed. Please try again later.', 'error', 6000)
        })

    }

    const handleClickEditProfile = () => setEditProfileDialogOpen((state) => !state)

    //change password
    const handleChangePassword = data => {
        setPasswordData(data);
        handleCLickChangePassword();
        setAreYouSurePasswordDialogOpen(true);
    };

    const handleConfirmChangePassword = async () => {
        const token = localStorage.getItem("jwt");
        setAreYouSurePasswordDialogOpen(false);
        openSnackbar('Changing password', 'info', 6000)
        await axios.put(endpoints.users.changePasswordByUsername(username), passwordData, {
            headers: {
                Authorization: 'Bearer ' + token
            }
        }).then(() => {
            window.location.reload();
        }).catch(error => {
            console.error(error);
            openSnackbar('Couldn\'t change password. Please try again later.', 'error', 6000)
        });
    };

    const handleCLickChangePassword = () => setChangePasswordDialogOpen((state) => !state)
    const handleClickAreYouSurePassword = () => setAreYouSurePasswordDialogOpen((state) => !state)
    const handleClickShowCurrentPassword = () => setShowCurrentPassword((show) => !show);
    const handleClickShowNewPassword = () => setShowNewPassword((show) => !show);


    return (<Fragment>
        <TopAppBar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}/>
        <Container sx={{marginTop: 3}}>
            {userLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                    <CircularProgress/>
                </Box>
            ) : fetchUserError ? (
                <Alert severity="error">{fetchUserError}</Alert>
            ) : (
                <Fragment>
                    <Typography variant="h4" gutterBottom sx={{wordBreak: "break-word"}}>
                        {user.username}
                    </Typography>
                    {isOwnProfile && <Fragment>
                        <Button color="primary" onClick={handleClickEditProfile}>
                            Edit Profile
                        </Button>
                        <Button color="error" onClick={handleCLickChangePassword}>
                            Change Password
                        </Button>
                    </Fragment>
                    }
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{backgroundColor: '#757575', color: 'white'}}>Email</TableCell>
                                    <TableCell align="left"
                                               sx={{backgroundColor: '#757575', color: 'white'}}>Name</TableCell>
                                    <TableCell align="left"
                                               sx={{backgroundColor: '#757575', color: 'white'}}>Surname</TableCell>
                                    <TableCell align="left" sx={{backgroundColor: '#757575', color: 'white'}}>Birth
                                        Date</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell align="left">{user.firstName}</TableCell>
                                    <TableCell align="left">{user.lastName}</TableCell>
                                    <TableCell align="left">{adjustBirthDateToUserTimezone(user.birthDate)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Fragment>
            )}
            <Divider sx={{marginTop: 2}}>
                <Chip label="POSTS" onClick={handleDisplayPosts} color="primary"/>
            </Divider>
            {displayPosts &&
                <Fragment>
                    {postsLoading ? (
                        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                            <CircularProgress/>
                        </Box>
                    ) : fetchPostsError ? (
                        <Alert severity="error">{fetchPostsError}</Alert>
                    ) : (
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
                                        User has no posts.
                                    </Typography>
                                </Paper>
                            )}
                        </List>
                    )}
                    {!postsLoading && !fetchPostsError && posts.length>0&& (
                        <Box display="flex" justifyContent="space-between" my={2}>
                            <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary"/>
                        </Box>
                    )}
                </Fragment>
            }
        </Container>
        <AlertSnackbar/>
        <Dialog id="editPofileDialog" open={editProfileDialogOpen} onClose={handleClickEditProfile}
                fullWidth={true}
                fullScreen={fullScreen}>
            <DialogTitle>Edit</DialogTitle>
            <form onSubmit={editForm.handleSubmit(handleEditProfile)}>
                <DialogContent>
                    <TextField
                        id="email"
                        label="Email"
                        type="email"
                        margin="normal"
                        variant="standard"
                        fullWidth
                        inputProps={{maxLength: 320}}
                        {...editForm.register('email')}
                        error={!!editForm.formState.errors.email}
                        helperText={editForm.formState.errors.firstName?.message}
                    />
                    <TextField
                        id="firstName"
                        label="Name"
                        type="text"
                        margin="normal"
                        variant="standard"
                        fullWidth
                        {...editForm.register('firstName')}
                        error={!!editForm.formState.errors.firstName}
                        helperText={editForm.formState.errors.firstName?.message}
                    />
                    <TextField
                        id="lastName"
                        label="Surname"
                        type="text"
                        margin="normal"
                        variant="standard"
                        fullWidth
                        {...editForm.register('lastName')}
                        error={!!editForm.formState.errors.lastName}
                        helperText={editForm.formState.errors.lastName?.message}
                    />
                    <TextField
                        id="birthDate"
                        label="Birth Date"
                        type="date"
                        margin="normal"
                        variant="standard"
                        fullWidth
                        InputLabelProps={{
                            shrink: true,
                        }}
                        {...editForm.register('birthDate')}
                        error={!!editForm.formState.errors.birthDate}
                        helperText={editForm.formState.errors.birthDate?.message}
                    />

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClickEditProfile}>Cancel</Button>
                    <Button type="submit">Edit</Button>
                </DialogActions>
            </form>
        </Dialog>

        <Dialog id="changePasswordDialog" open={changePasswordDialogOpen} onClose={handleCLickChangePassword}
                fullWidth={true}
                fullScreen={fullScreen}>
            <DialogTitle>Edit Comment</DialogTitle>
            <form onSubmit={passwordForm.handleSubmit(handleChangePassword)}>
                <DialogContent>
                    <TextField
                        id="currentPassword"
                        margin="normal"
                        variant="standard"
                        label="Current Password"
                        type={showCurrentPassword ? 'text' : 'password'}
                        fullWidth
                        {...passwordForm.register('currentPassword')}
                        error={!!passwordForm.formState.errors.currentPassword}
                        helperText={passwordForm.formState.errors.currentPassword?.message}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleClickShowCurrentPassword}>
                                        {showCurrentPassword ? <VisibilityOff/> : <Visibility/>}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    <TextField
                        id="newPassword"
                        margin="normal"
                        variant="standard"
                        label="New Password"
                        type={showNewPassword ? 'text' : 'password'}
                        fullWidth
                        {...passwordForm.register('newPassword')}
                        error={!!passwordForm.formState.errors.newPassword}
                        helperText={passwordForm.formState.errors.newPassword?.message}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={handleClickShowNewPassword}>
                                        {showNewPassword ? <VisibilityOff/> : <Visibility/>}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    <TextField
                        id="confirmNewPassword"
                        margin="normal"
                        variant="standard"
                        label="Confirm Password"
                        type={'password'}
                        fullWidth
                        {...passwordForm.register('confirmNewPassword')}
                        error={!!passwordForm.formState.errors.confirmNewPassword}
                        helperText={passwordForm.formState.errors.confirmNewPassword?.message}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCLickChangePassword}>Cancel</Button>
                    <Button type="submit" color="error">Change
                        Password</Button>
                </DialogActions>
            </form>
        </Dialog>

        <Dialog id="areYouSurePasswordDialog" open={areYouSurePasswordDialogOpen}
                onClose={handleClickAreYouSurePassword}
                fullWidth={true}
                fullScreen={fullScreen}>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogContent>Are you sure that you want to change your password?</DialogContent>
            <DialogActions>
                <Button onClick={handleClickAreYouSurePassword}>Cancel</Button>
                <Button type="submit" color="error" onClick={handleConfirmChangePassword}>Change Password</Button>
            </DialogActions>
        </Dialog>

    </Fragment>)
}

