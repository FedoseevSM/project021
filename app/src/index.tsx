import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import createMuiTheme from '@material-ui/core/styles/createMuiTheme';
import { MuiThemeProvider, StylesProvider } from '@material-ui/core/styles';

import { BrowserRouter as Router } from 'react-router-dom';
import * as Sentry from "@sentry/react"

import './reset.css';
import './index.scss';
import App from 'components/App/App';
import store from 'store';
import * as serviceWorker from './serviceWorker';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({ dsn: 'https://ebce09db3c6c414389ceb71b7ff97247@o469034.ingest.sentry.io/5497764' });
}


const theme = createMuiTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1850,
    }
  },
  typography: {
    fontFamily: `
      'SF Pro', 'Arial', 'Roboto', 'Oxygen';
    `,
  },
  palette: {
    primary: {
      main: '#88CAF7',
    },
    secondary: {
      main: '#88CAF7',
    },
  },
  overrides: {
  },

});

ReactDOM.render(
  <React.StrictMode>
    <StylesProvider injectFirst>
      <MuiThemeProvider theme={theme}>
        <Provider store={store}>
          <Router>
            <App />
          </Router>
        </Provider>
      </MuiThemeProvider>
    </StylesProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
