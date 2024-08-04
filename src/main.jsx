import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {createTheme, CssBaseline, ThemeProvider} from "@mui/material";

const theme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: '#8d6e63'
        },
        secondary:{
            main: '#ec407a'
        }
    },

})

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline>
                <App/>
            </CssBaseline>
        </ThemeProvider>
    </React.StrictMode>,
)
