import {useParams} from "react-router-dom";
import TopAppBar from "./TopAppBar.jsx";
import {Fragment} from "react";

function Search({isAuthenticated, setIsAuthenticated}) {
    const {searchTerm} = useParams()


    return (
        <Fragment>
            <TopAppBar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}/>
        </Fragment>
    )
}

export default Search;