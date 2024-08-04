import {
    AppBar,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    InputAdornment,
    TextField,
    Toolbar
} from "@mui/material";
import {AccountBoxOutlined, Adb, Search} from "@mui/icons-material";
import {useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import {Fragment, useState} from "react";
import Auth from "./Auth.jsx";


export default function TopAppBar({isAuthenticated, setIsAuthenticated}) {
    const navigate = useNavigate();
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [openAuthDialog, setOpenAuthDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleClickProfile = () => {
        if (isAuthenticated) {
            const jwt = localStorage.getItem('jwt');
            const decodedToken = jwtDecode(jwt);
            const username = decodedToken.sub;
            navigate(`/profile/${username}`);
        }
    };
    const handleClickHomePage = () => {
        navigate('/home')
    }

    const handleClickLogout = () => setLogoutDialogOpen((state) => !state)
    const handleClickAuth = () => setOpenAuthDialog((state) => !state)


    const handleLogout = () => {
        localStorage.removeItem('jwt');
        setIsAuthenticated(false)
        setLogoutDialogOpen(false)
        window.location.reload()
    }

    const handleSearch = () => {
        navigate(`/search/${searchTerm}`)
    }

    return (
        <Box sx={{flexGrow: 1}}>
            <AppBar position="static">
                <Toolbar>
                    <IconButton onClick={handleClickHomePage}>
                        <Adb color="primary" fontSize="large"/>
                    </IconButton>
                    <form onSubmit={handleSearch}>
                        <TextField
                            label="Search"
                            variant="filled"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleSearch}>
                                            <Search/>
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </form>
                    <Box flexGrow={1}/>
                    {isAuthenticated ? (
                        <Fragment>
                            <IconButton onClick={handleClickProfile} size="large">
                                <AccountBoxOutlined color="primary" fontSize="large"/>
                            </IconButton>
                            <Button variant="contained" color="secondary"
                                    onClick={handleClickLogout}>Logout</Button>
                        </Fragment>
                    ) : (
                        <Button variant="contained" color="primary"
                                onClick={handleClickAuth}>Login</Button>
                    )}
                </Toolbar>
            </AppBar>
            {openAuthDialog && <Auth open={openAuthDialog} setOpen={setOpenAuthDialog}/>}
            <Dialog open={logoutDialogOpen} onClose={handleClickLogout}>
                <DialogTitle>Logout</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to logout?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClickLogout} color="primary">Cancel</Button>
                    <Button type="submit" color="secondary" onClick={handleLogout}>Logout</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )

}

