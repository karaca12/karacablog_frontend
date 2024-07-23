import {Navigate, Route, Routes} from "react-router-dom";
import Home from "./components/Home.jsx";
import Post from "./components/Post.jsx";
import Profile from "./components/Profile.jsx";
import {useEffect, useState} from "react";
import {jwtDecode} from "jwt-decode";
import Search from "./components/Search.jsx";


export default function DefaultRoutes() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const jwt = localStorage.getItem('jwt');
        if (jwt) {
            const decodedToken = jwtDecode(jwt);
            if (decodedToken.exp * 1000 < Date.now()) {
                setIsAuthenticated(false);
                localStorage.removeItem('jwt');
            } else {
                setIsAuthenticated(true);
            }

        } else {
            setIsAuthenticated(false)
        }
    }, [])

    return (
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
        </Routes>)
}