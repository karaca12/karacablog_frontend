import {Fragment, useEffect, useState} from "react";
import axios from "axios";
import {useParams} from "react-router-dom";
import TopAppBar from "./TopAppBar.jsx";
import {Container, Divider, Paper, Typography} from "@mui/material";

function Profile({onLogout}) {
    const [user, setUser] = useState({});
    const {username} = useParams()
    useEffect(() => {
        const token = localStorage.getItem("jwt");
        axios.get(`http://localhost:8080/api/users/${username}`,
            {
                headers: {Authorization: 'Bearer ' + token}
            })
            .then(response => {
                setUser(response.data)
            }).catch(error => {
            console.error(error);
        })
    }, [username]);

    const handleLogout = () => {
        localStorage.removeItem('jwt')
        onLogout(false);
    }

    return (<Fragment>
        <TopAppBar handleLogout={handleLogout}/>
        <Container sx={{marginTop: 3}}>
            <Typography variant="h4" gutterBottom>
                Profile
            </Typography>
            <Divider/>
            <Paper sx={{width: '100%'}}>
                <Typography variant="body2" color="textPrimary">
                    Username: {user.username}
                </Typography>
                <Typography variant="body2" color="textPrimary">
                    Email: {user.email}
                </Typography>
                <Typography variant="body2" color="textPrimary">
                    First Name: {user.firstName}
                </Typography>
                <Typography variant="body2" color="textPrimary">
                    Last Name: {user.lastName}
                </Typography>
                <Typography variant="body2" color="textPrimary">
                    Birth Date: {user.birthDate}
                </Typography>
            </Paper>
        </Container>

    </Fragment>)
}

export default Profile;