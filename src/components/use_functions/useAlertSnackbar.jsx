import {useCallback, useState} from "react";
import {Alert, Snackbar} from "@mui/material";

export const useAlertSnackbar = () => {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('info');
    const [snackbarAutoHideDuration, setSnackbarAutoHideDuration] = useState(null);

    const openSnackbar = useCallback((message, severity = 'info',autoHideDuration) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
        setSnackbarAutoHideDuration(autoHideDuration)
    }, []);

    const handleSnackbarClose = () => setSnackbarOpen(false);

    const AlertSnackbar = () => (
        <Snackbar
            open={snackbarOpen}
            onClose={handleSnackbarClose}
            autoHideDuration={snackbarAutoHideDuration}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert severity={snackbarSeverity}>
                {snackbarMessage}
            </Alert>
        </Snackbar>
    );

    return { openSnackbar,handleSnackbarClose, AlertSnackbar };
};