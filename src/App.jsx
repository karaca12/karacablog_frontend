import DefaultRoutes from "./DefaultRoutes.jsx";
import {BrowserRouter} from "react-router-dom";

function App() {

    return (
        <BrowserRouter>
            <DefaultRoutes/>
        </BrowserRouter>
    )
}

export default App
