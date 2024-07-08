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
    Toolbar
} from "@mui/material";
import {AccountBoxOutlined} from "@mui/icons-material";
import {useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import {useState} from "react";

function TopAppBar({handleLogout}) {
    const navigate = useNavigate();
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);


    const handleProfileClick = () => {
        const token = localStorage.getItem('jwt');
        if (token) {
            const decodedToken = jwtDecode(token);
            const username = decodedToken.sub;
            navigate(`/profile/${username}`);
        } else {
            console.error('JWT not found');
        }
    };

    const handleLogoutClickOpen = () => {
        setLogoutDialogOpen(true)
    }

    const handleLogoutClickClose = () => {
        setLogoutDialogOpen(false)
    }

    const handleLogoClick = () => {
        navigate('/home')
    }

    return (
        <Box sx={{flexGrow: 1}}>
            <AppBar position="static">
                <Toolbar>
                    <Button variant="h6" component="div" sx={{flexGrow: 1}} onClick={handleLogoClick}>
                        Karacablog
                    </Button>
                    <IconButton onClick={() => handleProfileClick()} size="large">
                        <AccountBoxOutlined color="secondary" fontSize="large"/>
                    </IconButton>
                    <Button variant="contained" color="secondary" onClick={handleLogoutClickOpen}>Logout</Button>
                </Toolbar>
            </AppBar>
            <Dialog open={logoutDialogOpen} onClose={handleLogoutClickClose}>
                <DialogTitle>Logout</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to logout?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleLogoutClickClose} color="primary">Cancel</Button>
                    <Button type="submit" onClick={handleLogout} color="error">Logout</Button>
                </DialogActions>
            </Dialog>
        </Box>
    )

}

export default TopAppBar;