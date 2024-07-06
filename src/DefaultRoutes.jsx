import {Navigate, Route, Routes} from "react-router-dom";
import Home from "./components/Home.jsx";
import Auth from "./components/Auth.jsx";
import {useEffect, useState} from "react";
import Post from "./components/Post.jsx";
import Profile from "./components/Profile.jsx";



function DefaultRoutes() {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('jwt'));

    useEffect(() => {
        const jwt = localStorage.getItem('jwt');
        setIsAuthenticated(!!jwt);
    }, []);

    return (
        <Routes>
            <Route path="/auth" element={isAuthenticated ? <Navigate to="/home" /> : <Auth onAuthChange={setIsAuthenticated}/>}/>
            <Route path="/home" element={isAuthenticated ? <Home onLogout={setIsAuthenticated}/> : <Navigate to="/auth" />}/>
            <Route path="/post/:uniqueNum" element={isAuthenticated ? <Post onLogout={setIsAuthenticated}/> : <Navigate to="/auth" />}/>
            <Route path="/profile/:username" element={isAuthenticated ? <Profile onLogout={setIsAuthenticated}/> : <Navigate to="/profile" />}/>
            <Route path="*" element={<Navigate to={isAuthenticated ? "/home" : "/auth"} />} />
        </Routes>)

}

export default DefaultRoutes;