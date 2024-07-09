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
    DialogTitle,
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

function Profile({onLogout}) {
    const [user, setUser] = useState({});
    const {username} = useParams()
    const token = localStorage.getItem("jwt");
    const decodedToken = jwtDecode(token);
    const userFromToken = decodedToken.sub;
    const [isOwnProfile, setIsOwnProfile] = useState(false)
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [editProfileDialogOpen, setEditProfileDialogOpen] = useState(false);
    const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
    const [areYouSurePasswordDialogOpen, setAreYouSurePasswordDialogOpen] = useState(false);
    const [passwordData, setPasswordData] = useState(null);
    const [error, setError] = useState(null);


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
        axios.get(`http://localhost:8080/api/users/${username}`,
            {
                headers: {Authorization: 'Bearer ' + token}
            })
            .then(response => {
                setUser(response.data)
                if (response.data.username === userFromToken) {
                    setIsOwnProfile(true)
                }
            }).catch(error => {
            console.error(error);
        })
    }, [token, userFromToken, username]);

    useEffect(() => {
        if (user) {
            editForm.setValue("email", user.email);
            editForm.setValue("firstName", user.firstName);
            editForm.setValue("lastName", user.lastName);
            editForm.setValue("birthDate", user.birthDate ? user.birthDate.split('T')[0] : '');
        }
    }, [user, editForm]);

    const handleLogout = () => {
        localStorage.removeItem('jwt')
        onLogout(false);
    }

    //edit profile
    const handleEditProfile = data => {

        axios.put(`http://localhost:8080/api/users/${username}`, data, {
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

    const handleEditProfileClickOpen = () => {
        setEditProfileDialogOpen(true)
    }
    const handleEditProfileClickClose = () => {
        setEditProfileDialogOpen(false)
    }

    //change password
    const handleChangePassword = data => {
        setPasswordData(data);
        handleChangePasswordClickClose();
        setAreYouSurePasswordDialogOpen(true);
    };

    const handleConfirmChangePassword = () => {
        axios.put(`http://localhost:8080/api/users/${username}/password`, passwordData, {
            headers: {
                Authorization: 'Bearer ' + token
            }
        }).then(() => {
            setAreYouSurePasswordDialogOpen(false);
            window.location.reload();
        }).catch(error => {
            handleAreYouSurePasswordClickClose()
            setError(error.response?.data?.message || 'Password change failed')
        });
    };

    const handleChangePasswordClickOpen = () => {
        setChangePasswordDialogOpen(true)
    }
    const handleChangePasswordClickClose = () => {
        setChangePasswordDialogOpen(false)
    }

    const handleAreYouSurePasswordClickClose = () => {
        setAreYouSurePasswordDialogOpen(false)
    }

    return (<Fragment>
        <TopAppBar handleLogout={handleLogout}/>
        <Container sx={{marginTop: 3}}>
            <Typography variant="h4" gutterBottom sx={{wordBreak: "break-word"}}>
                {user.username}
            </Typography>
            {isOwnProfile && <Fragment>
                <Button color="primary" onClick={handleEditProfileClickOpen}>
                    Edit Profile
                </Button>
                <Button color="error" onClick={handleChangePasswordClickOpen}>
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
                            <TableCell align="left">{user.birthDate}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
        <Dialog id="editPofileDialog" open={editProfileDialogOpen} onClose={handleEditProfileClickClose}
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
                    <Button onClick={handleEditProfileClickClose}>Cancel</Button>
                    <Button type="submit">Edit</Button>
                </DialogActions>
            </form>
        </Dialog>

        <Dialog id="changePasswordDialog" open={changePasswordDialogOpen} onClose={handleChangePasswordClickClose}
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
                        type="password"
                        fullWidth
                        {...passwordForm.register('currentPassword')}
                        error={!!passwordForm.formState.errors.currentPassword}
                        helperText={passwordForm.formState.errors.currentPassword?.message}
                    />
                    <TextField
                        id="newPassword"
                        margin="normal"
                        variant="standard"
                        label="New Password"
                        type="password"
                        fullWidth
                        {...passwordForm.register('newPassword')}
                        error={!!passwordForm.formState.errors.newPassword}
                        helperText={passwordForm.formState.errors.newPassword?.message}
                    />
                    <TextField
                        id="confirmNewPassword"
                        margin="normal"
                        variant="standard"
                        label="Confirm Password"
                        type="password"
                        fullWidth
                        {...passwordForm.register('confirmNewPassword')}
                        error={!!passwordForm.formState.errors.confirmNewPassword}
                        helperText={passwordForm.formState.errors.confirmNewPassword?.message}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleChangePasswordClickClose}>Cancel</Button>
                    <Button type="submit" color="error">Change
                        Password</Button>
                </DialogActions>
            </form>
        </Dialog>

        <Dialog id="areYouSurePasswordDialog" open={areYouSurePasswordDialogOpen}
                onClose={handleAreYouSurePasswordClickClose}
                fullWidth={true}
                fullScreen={fullScreen}>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogContent>Are you sure that you want to change your password?</DialogContent>
            <DialogActions>
                <Button onClick={handleAreYouSurePasswordClickClose}>Cancel</Button>
                <Button type="submit" color="error" onClick={handleConfirmChangePassword}>Change Password</Button>
            </DialogActions>
        </Dialog>
        {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}

    </Fragment>)
}

export default Profile;