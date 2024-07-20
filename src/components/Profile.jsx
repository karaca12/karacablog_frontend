import {Fragment, useEffect, useState} from "react";
import axios from "axios";
import {useParams} from "react-router-dom";
import TopAppBar from "./TopAppBar.jsx";
import {
    Alert,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, IconButton, InputAdornment,
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

function Profile({isAuthenticated,setIsAuthenticated}) {
    const [user, setUser] = useState({});
    const {username} = useParams()
    const [isOwnProfile, setIsOwnProfile] = useState(false)
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [editProfileDialogOpen, setEditProfileDialogOpen] = useState(false);
    const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
    const [areYouSurePasswordDialogOpen, setAreYouSurePasswordDialogOpen] = useState(false);
    const [passwordData, setPasswordData] = useState(null);
    const [error, setError] = useState(null);
    const [showCurrentPassword,setShowCurrentPassword]=useState(false);
    const [showNewPassword,setShowNewPassword]=useState(false);


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
        axios.get(endpoints.users.getByUsername(username))
            .then(response => {
                setUser(response.data)
                const token = localStorage.getItem("jwt");
                if (token) {
                    const decodedToken = jwtDecode(token);
                    const userFromToken = decodedToken.sub;
                    if (response.data.username === userFromToken) {
                        setIsOwnProfile(true)
                    }
                }
            }).catch(error => {
            console.error(error);
        })
    }, [username]);

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
    const handleEditProfile = data => {
        const token = localStorage.getItem("jwt");
        axios.put(endpoints.users.editByUsername(username), data, {
            headers: {
                Authorization: 'Bearer ' + token
            }
        }).then(() => {
            setEditProfileDialogOpen(false)
            window.location.reload();
        }).catch(error => {
            console.error(error)
        })

    }

    const handleClickEditProfile = () => setEditProfileDialogOpen((state)=>!state)

    //change password
    const handleChangePassword = data => {
        setPasswordData(data);
        handleCLickChangePassword();
        setAreYouSurePasswordDialogOpen(true);
    };

    const handleConfirmChangePassword = () => {
        const token = localStorage.getItem("jwt");
        axios.put(endpoints.users.changePasswordByUsername(username), passwordData, {
            headers: {
                Authorization: 'Bearer ' + token
            }
        }).then(() => {
            setAreYouSurePasswordDialogOpen(false);
            window.location.reload();
        }).catch(error => {
            handleClickAreYouSurePassword()
            setError(error.response?.data?.message || 'Password change failed')
        });
    };

    const handleCLickChangePassword=()=> setChangePasswordDialogOpen((state)=>!state)
    const handleClickAreYouSurePassword = () => setAreYouSurePasswordDialogOpen((state)=>!state)
    const handleClickShowCurrentPassword = () => setShowCurrentPassword((show) => !show);
    const handleClickShowNewPassword = () => setShowNewPassword((show) => !show);


    return (<Fragment>
        <TopAppBar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}/>
        <Container sx={{marginTop: 3}}>
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
                            <TableCell align="left" sx={{backgroundColor: '#757575', color: 'white'}}>Name</TableCell>
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
        </Container>
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
        {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}

    </Fragment>)
}

export default Profile;