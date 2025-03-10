import React from 'react';
import ReactDOM from 'react-dom/client';

// Import Bootstrap CSS and Icons
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Import custom styles
import './index.css';
import './App.css';

// Import Bootstrap JS with Popper.js included
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);