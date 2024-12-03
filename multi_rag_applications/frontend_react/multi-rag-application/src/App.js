import React from 'react';
import { Route, Routes } from 'react-router-dom'; // Importing routing components
import Landing from './components/Landing'; // The landing page component (ensure the correct path)
import SignUp from './components/SignUp'; // SignUp component (if you add it later)
import Login from './components/login'; // Login component (if you add it later)
import './App.css'; // Global styles (optional)
import { Toaster } from 'react-hot-toast';
function App() {
  return (
    <div className="App">
      < Toaster/>
      <Routes>
        {/* Define routes for different components/pages */}
        <Route path="/" element={<Landing />} /> {/* Main landing page route */}
        <Route path="/signup" element={<SignUp />} /> {/* Signup page route */}
        <Route path="/login" element={<Login />} /> {/* Login page route */}
      </Routes>
    </div>
  );
}

export default App;
