import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App'; // Import the App component
import { BrowserRouter as Router } from 'react-router-dom'; // Router setup

ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById('root')
);
