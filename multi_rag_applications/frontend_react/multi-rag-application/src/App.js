import React from 'react';
import { Route, Routes } from 'react-router-dom'; // Importing routing components
import Landing from './components/Landing'; // The landing page component
import SignUp from './components/SignUp'; // SignUp component
import SignIn from './components/login'; // Login component
import './App.css'; // Global styles (optional) // Correct path to ChatContainer
import { Toaster } from 'react-hot-toast'; // For toast notifications
import Chat from './components/chat';
function App() {
  return (
    <div className="App">
      {/* Toast notifications will appear here */}
      <Toaster />
      <Routes>
        {/* Define routes for different components/pages */}
        <Route path="/" element={<Landing />} /> {/* Main landing page route */}
        <Route path="/signup" element={<SignUp />} /> {/* Signup page route */}
        <Route path="/login" element={<SignIn />} /> {/* Login page route */}
        <Route path="/chat" element={<Chat />} /> {/* Chat page route */}
      </Routes>
    </div>
  );
}

export default App;
