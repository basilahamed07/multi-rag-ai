import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({
    name: '',
    password: '',
    confirmPassword: '',
    acceptTerms: '',
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Make the API call to register the user
        const response = await axios.post('http://localhost:5000/register', {
          username: formData.name,
          password: formData.password,
        });

        // If registration is successful, navigate to the login page
        if (response.status === 201) {
          toast.success('Registration successful!', {
            position: 'top-right',
            duration: 5000,
          });
          navigate('/login'); // Navigate to login page after successful registration
        }
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.error || 'Registration failed', {
            position: 'top-right',
            duration: 5000,
          });
        } else {
          toast.error('An error occurred. Please try again.', {
            position: 'top-right',
            duration: 5000,
          });
        }
      }
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // Full screen height
        width: '100vw', // Full screen width
        background: 'linear-gradient(45deg, #2196F3, #9c27b0)', // Gradient background
      }}
    >
      {/* Left side (Registration Form) */}
      <Paper
        sx={{
          padding: 4,
          width: '100%',
          maxWidth: '600px', // Limit the width of the form
          borderRadius: 3,
          boxShadow: 3,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h5" align="center" sx={{ color: '#fff', marginBottom: 4 }}>
          Registration
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            variant="outlined"
            error={Boolean(errors.name)}
            helperText={errors.name}
            sx={{ background: 'rgba(255, 255, 255, 0.2)', borderRadius: 2 }}
          />
          <TextField
            label="Create Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            variant="outlined"
            error={Boolean(errors.password)}
            helperText={errors.password}
            sx={{ background: 'rgba(255, 255, 255, 0.2)', borderRadius: 2 }}
          />
          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            variant="outlined"
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword}
            sx={{ background: 'rgba(255, 255, 255, 0.2)', borderRadius: 2 }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleInputChange}
              id="acceptTerms"
              style={{ marginRight: '10px' }}
            />
            <label htmlFor="acceptTerms" style={{ color: '#fff' }}>
              I accept all terms & conditions
            </label>
          </Box>
          {errors.acceptTerms && <span className="error" style={{ color: 'red' }}>{errors.acceptTerms}</span>}

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
                backgroundColor: '#0097a7',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
              },
            }}
          >
            Register Now
          </Button>

          <Typography variant="body2" align="center" sx={{ color: '#fff', marginTop: 2 }}>
            Already have an account? <a href="/login" style={{ color: '#00bcd4' }}>Login now</a>
          </Typography>
        </form>
      </Paper>
      <Toaster />
    </Box>
  );
};

export default SignUp;