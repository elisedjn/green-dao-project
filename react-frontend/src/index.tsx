import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import GlobalContextProvider from './utils/GlobalContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#31572C',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4F772D',
      // light: '#ECF39E',
      // dark: '#132A13',
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <GlobalContextProvider>
        <App />
      </GlobalContextProvider>
    </ThemeProvider>
  </React.StrictMode>
);
