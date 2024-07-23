import DefaultRoutes from "./DefaultRoutes.jsx";
import {BrowserRouter} from "react-router-dom";

export default function App() {

    return (
        <BrowserRouter>
            <DefaultRoutes/>
        </BrowserRouter>
    )
}
