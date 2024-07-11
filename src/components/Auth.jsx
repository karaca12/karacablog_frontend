import * as yup from "yup";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import axios from "axios";
import {Alert, Box, Button, Container, TextField, Typography} from "@mui/material";

function Auth({onAuthChange}) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState(null);
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

    const handleToggle = () => {
        setIsRegistering(!isRegistering);
        setError(null)
    }

    const handleLoginSubmit = data => {
        axios.post('http://localhost:8080/api/auth/login', data)
            .then(response => {
                localStorage.setItem('jwt', response.data)
                onAuthChange(true)
            })
            .catch(error => {
                setError(error.response?.data?.message || 'Login failed')
            })
    }

    const handleRegisterSubmit = data => {
        axios.post('http://localhost:8080/api/auth/register', data)
            .then(response => {
                localStorage.setItem('jwt', response.data)
                onAuthChange(true)
                console.log(data.birthDate)
            })
            .catch(error => {
                setError(error.response?.data?.message || 'Registration failed')
            })
    }

    return (
        <Container maxWidth="sm">
            {isRegistering ? (
                <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{textAlign: 'center'}}>
                        Register
                    </Typography>

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
                        type="password"
                        margin="normal"
                        {...registerForm.register('password')}
                        error={!!registerForm.formState.errors.password}
                        helperText={registerForm.formState.errors.password?.message}
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
                </form>
            ) : (
                <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{textAlign: 'center'}}>
                        Login
                    </Typography>
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
                        type="password"
                        margin="normal"
                        {...loginForm.register('password')}
                        error={!!loginForm.formState.errors.password}
                        helperText={loginForm.formState.errors.password?.message}
                    />
                    <Box display="flex" justifyContent="center" my={2}>
                        <Button type="submit" variant="contained" color="primary" sx={{mt: 2, mb: 2}}>
                            Login
                        </Button>
                    </Box>
                </form>
            )}
            <Box display="flex" justifyContent="center" my={2}>
                <Button onClick={handleToggle} variant="outlined" color="primary">
                    {isRegistering ? 'Already have an account?' : 'Don\'t have an account?'}
                </Button>
            </Box>
            {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}
        </Container>
    )
}

export default Auth;