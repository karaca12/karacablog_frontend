import * as yup from "yup";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import axios from "axios";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    TextField
} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";

function Auth({open, setOpen}) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const registerSchema = yup.object().shape({
        email: yup.string().email('Please enter a valid email').required('Email is required'),
        username: yup.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be maximum 20 of characters').required('Username is required'),
        password: yup.string().min(6, 'Password must be at least 6 characters').max(20, 'Password must be maximum 20 of characters').required('Password is required'),
        firstName: yup.string().min(1, 'Name must be at least 1 character').max(50, 'Name must be maximum 50 of characters').required('Name is required'),
        lastName: yup.string().min(1, 'Surname must be at least 1 character').max(50, 'Surname must be maximum 50 of characters').required('Surname is required'),
        birthDate: yup.date().required('Birth date is required')
    });

    const loginSchema = yup.object().shape({
        username: yup.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be maximum 20 of characters').required('Username is required'),
        password: yup.string().min(6, 'Password must be at least 6 characters').max(20, 'Password must be maximum 20 of characters').required('Password is required'),
    });

    const loginForm = useForm({
        resolver: yupResolver(loginSchema)
    })

    const registerForm = useForm({
        resolver: yupResolver(registerSchema)
    })

    const handleRegisterLoginToggle = () => {
        setIsRegistering(!isRegistering);
        setError(null)
    }

    const handleLoginSubmit = data => {
        axios.post('http://localhost:8080/api/auth/login', data)
            .then(response => {
                localStorage.setItem('jwt', response.data)
                setOpen(false)
                window.location.reload()
            })
            .catch(error => {
                setError(error.response?.data?.message || 'Login failed')
            })
    }

    const handleRegisterSubmit = data => {
        axios.post('http://localhost:8080/api/auth/register', data)
            .then(response => {
                localStorage.setItem('jwt', response.data)
                setOpen(false)
                window.location.reload()
            })
            .catch(error => {
                setError(error.response?.data?.message || 'Registration failed')
            })
    }

    const handleClickOnClose = () => setOpen((state)=>!state)
    const handleClickShowPassword = () => setShowPassword((show) => !show);

    return (
        <Dialog open={open} onClose={handleClickOnClose}>
            {isRegistering ? (
                <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}>
                    <DialogTitle>Register</DialogTitle>
                    <DialogContent>
                        <TextField
                            id="usernameRegister"
                            fullWidth
                            label="Username"
                            margin="normal"
                            {...registerForm.register('username')}
                            error={!!registerForm.formState.errors.username}
                            helperText={registerForm.formState.errors.username?.message}
                        />
                        <TextField
                            id="passwordRegister"
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            margin="normal"
                            {...registerForm.register('password')}
                            error={!!registerForm.formState.errors.password}
                            helperText={registerForm.formState.errors.password?.message}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleClickShowPassword}>
                                            {showPassword ? <VisibilityOff/> : <Visibility/>}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <TextField
                            id="email"
                            fullWidth
                            label="Email"
                            margin="normal"
                            {...registerForm.register('email')}
                            error={!!registerForm.formState.errors.email}
                            helperText={registerForm.formState.errors.email?.message}
                        />
                        <TextField
                            id="firstName"
                            fullWidth
                            label="Name"
                            margin="normal"
                            {...registerForm.register('firstName')}
                            error={!!registerForm.formState.errors.firstName}
                            helperText={registerForm.formState.errors.firstName?.message}
                        />
                        <TextField
                            id="lastName"
                            fullWidth
                            label="Surname"
                            margin="normal"
                            {...registerForm.register('lastName')}
                            error={!!registerForm.formState.errors.lastName}
                            helperText={registerForm.formState.errors.lastName?.message}
                        />
                        <TextField
                            id="birthDate"
                            fullWidth
                            label="Birth Date"
                            type="date"
                            InputLabelProps={{
                                shrink: true,
                            }}
                            margin="normal"
                            {...registerForm.register('birthDate')}
                            error={!!registerForm.formState.errors.birthDate}
                            helperText={registerForm.formState.errors.birthDate?.message}
                        />
                        <Box display="flex" justifyContent="center" my={2}>
                            <Button type="submit" variant="contained" color="primary" sx={{mt: 2, mb: 2}}>
                                Register
                            </Button>
                        </Box>
                        <Box display="flex" justifyContent="center" my={2}>
                            <Button onClick={handleRegisterLoginToggle} variant="outlined" color="primary" sx={{mt: 2, mb: 2}}>
                                {isRegistering ? 'Already have an account?' : 'Don\'t have an account?'}
                            </Button>
                        </Box>
                    </DialogContent>
                </form>
            ) : (
                <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)}>
                    <DialogTitle>Login</DialogTitle>
                    <DialogContent>
                        <TextField
                            id="usernameLogin"
                            fullWidth
                            label="Username"
                            margin="normal"
                            {...loginForm.register('username')}
                            error={!!loginForm.formState.errors.username}
                            helperText={loginForm.formState.errors.username?.message}
                        />
                        <TextField
                            id="passwordLogin"
                            fullWidth
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            margin="normal"
                            {...loginForm.register('password')}
                            error={!!loginForm.formState.errors.password}
                            helperText={loginForm.formState.errors.password?.message}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleClickShowPassword}>
                                            {showPassword ? <VisibilityOff/> : <Visibility/>}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Box display="flex" justifyContent="center" my={2}>
                            <Button type="submit" variant="contained" color="primary" sx={{mt: 2, mb: 2}}>
                                Login
                            </Button>
                        </Box>
                        <Box display="flex" justifyContent="center" my={2}>
                            <Button onClick={handleRegisterLoginToggle} variant="outlined" color="primary" sx={{mt: 2, mb: 2}}>
                                {isRegistering ? 'Already have an account?' : 'Don\'t have an account?'}
                            </Button>
                        </Box>
                    </DialogContent>
                </form>
            )}
            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
        </Dialog>
    )
}

export default Auth;