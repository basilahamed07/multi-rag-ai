import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';  // Import useNavigate hook
import axios from 'axios';
import toast from 'react-hot-toast';

// The SignIn component
const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post('http://localhost:5000/login', {
          username: formData.email,
          password: formData.password,
        });

        if (response.status === 200) {
          // Storing the access token, username, and userId in sessionStorage
          sessionStorage.setItem('access_token', response.data.access_token);
          sessionStorage.setItem('username', response.data.user.username);
          sessionStorage.setItem('userId', response.data.user.userId);

          toast.success('Login successful!', {
            duration: 3000,
          });

          setTimeout(() => {
            navigate('/chat');
          }, 1000);
        }
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.error || 'Login failed', {
            duration: 5000,
          });
        } else {
          toast.error('An error occurred. Please try again.', {
            duration: 5000,
          });
        }
      }
    }
  };

  const handleSignUpRedirect = () => {
    navigate('/signup'); // Navigate to the signup page when clicked
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',  // Full height of the viewport
        width: '100vw',   // Full width of the viewport
        background: 'linear-gradient(45deg, #2196F3, #9c27b0)', // Gradient background
        position: 'relative', // Make sure content is positioned correctly
      }}
    >
      <Paper
        sx={{
          padding: 4,
          borderRadius: 4,
          boxShadow: 3,
          background: 'rgba(0, 0, 0, 0.8)',  // Semi-transparent background
          width: '100%',
          maxWidth: '400px',  // Restrict max width to create a centered form
          position: 'relative', // Ensure it is placed correctly inside the container
        }}
      >
        <Typography variant="h5" align="center" sx={{ color: '#fff', marginBottom: 4 }}>
          Sign In to Your Account
        </Typography>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            variant="outlined"
            error={Boolean(errors.email)}
            helperText={errors.email}
            sx={{
              background: 'rgba(255, 255, 255, 0.2)',  // Light background to make the input stand out
              borderRadius: 2,
              '& .MuiInputBase-input': {
                color: 'white', // White text color
              },
              '& .MuiInputLabel-root': {
                color: 'white', // White label color
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'white', // White placeholder text
              },
            }}
            InputProps={{
              style: {
                color: 'white', // White text inside the input field
              },
            }}
            InputLabelProps={{
              style: {
                color: 'white', // White label color
              },
            }}
          />
          <TextField
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            variant="outlined"
            error={Boolean(errors.password)}
            helperText={errors.password}
            sx={{
              background: 'rgba(255, 255, 255, 0.2)',  // Light background
              borderRadius: 2,
              '& .MuiInputBase-input': {
                color: 'white', // White text color
              },
              '& .MuiInputLabel-root': {
                color: 'white', // White label color
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'white', // White placeholder text
              },
            }}
            InputProps={{
              style: {
                color: 'white', // White text inside the input field
              },
            }}
            InputLabelProps={{
              style: {
                color: 'white', // White label color
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              marginTop: 2,
              padding: '12px',
              fontSize: '16px',
              backgroundColor: '#00bcd4',
              '&:hover': {
                backgroundColor: '#0097a7',  // Hover effect
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
              },
            }}
          >
            Sign In
          </Button>

          <Box sx={{ textAlign: 'center', marginTop: 2 }}>
            <Typography variant="body2" sx={{ color: 'white' }}>
              Don't have an account?{' '}
              <span
                onClick={handleSignUpRedirect}  // Use handleSignUpRedirect on click
                style={{
                  color: '#00bcd4',
                  cursor: 'pointer', // Indicate it's clickable
                  textDecoration: 'none',
                }}
              >
                Create one
              </span>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default SignIn;
