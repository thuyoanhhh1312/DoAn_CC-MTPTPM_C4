import { createTheme } from '@mui/material/styles';

export const getMuiTheme = (mode = 'light') =>
    createTheme({
        palette: {
            mode,
            primary: {
                main: mode === 'dark' ? '#ab7967' : '#6b4c3b',
            },
            secondary: {
                main: '#9c27b0',
            },
            background: {
                default: mode === 'dark' ? '#121212' : '#fafafa',
                paper: mode === 'dark' ? '#1d1d1d' : '#fff',
            },
        },
        typography: {
            fontFamily: '"Public Sans", "Roboto", "Helvetica", "Arial", sans-serif',
        },
    });
