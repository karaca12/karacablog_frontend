import {Navigate, Route, Routes} from "react-router-dom";
import Home from "./components/Home.jsx";
import Post from "./components/Post.jsx";
import Profile from "./components/Profile.jsx";
import {Fragment, useEffect, useState} from "react";
import {jwtDecode} from "jwt-decode";
import Search from "./components/Search.jsx";
import {useAlertSnackbar} from "./components/use_functions/useAlertSnackbar.jsx";


export default function DefaultRoutes() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const {openSnackbar, AlertSnackbar} = useAlertSnackbar();

    useEffect(() => {
        const checkAuth = () => {
            const jwt = localStorage.getItem('jwt');
            if (jwt) {
                const decodedToken = jwtDecode(jwt);
                if (decodedToken.exp * 1000 < Date.now()) {
                    setIsAuthenticated(false);
                    localStorage.removeItem('jwt');
                    openSnackbar("Session expired. Please log in again.", "warning");
                } else {
                    setIsAuthenticated(true);
                }
            } else {
                setIsAuthenticated(false);
            }
        };

        checkAuth();

        const intervalId = setInterval(checkAuth, 10000);

        return () => clearInterval(intervalId);
    }, [])

    return (
        <Fragment>
            <Routes>
                <Route path="/home"
                       element={<Home isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}/>}/>
                <Route path="/post/:uniqueNum"
                       element={<Post isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}/>}/>
                <Route path="/profile/:username"
                       element={<Profile isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}/>}/>
                <Route path="/search/:searchTerm"
                       element={<Search isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}/>}/>
                <Route path="*" element={<Navigate to={"/home"}/>}/>
            </Routes>
            <AlertSnackbar/>
        </Fragment>
    )
}