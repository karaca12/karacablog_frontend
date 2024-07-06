import {AppBar, Box, Button, Toolbar, Typography} from "@mui/material";

function TopAppBar({handleLogout}) {
    return (
        <Box sx={{flexGrow: 1}}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                        Karacablog
                    </Typography>
                    <Button variant="contained" color="secondary" onClick={handleLogout}>Logout</Button>
                </Toolbar>
            </AppBar>
        </Box>
    )

}

export default TopAppBar;