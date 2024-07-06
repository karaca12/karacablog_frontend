import {AppBar, Box, Button, IconButton, Toolbar, Typography} from "@mui/material";
import {AccountBoxOutlined} from "@mui/icons-material";
import {useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";

function TopAppBar({handleLogout}) {
    const navigate = useNavigate();
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

    return (
        <Box sx={{flexGrow: 1}}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                        Karacablog
                    </Typography>
                    <IconButton onClick={()=>handleProfileClick()}>
                        <AccountBoxOutlined color="secondary"/>
                    </IconButton>
                    <Button variant="contained" color="secondary" onClick={handleLogout}>Logout</Button>
                </Toolbar>
            </AppBar>
        </Box>
    )

}

export default TopAppBar;