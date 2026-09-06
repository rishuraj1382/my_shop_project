// frontend/src/components/GoogleAuthButton.js
import React from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useToast } from '../Toast';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { API_URL } from '../config';

function GoogleAuthButtonInner() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/google`, { credential: credentialResponse.credential });
      login(res.data.token, res.data.role, res.data.name);
      toast({ message: 'Signed in with Google!', type: 'success' });
      navigate(
        res.data.role === 'shopkeeper' ? '/admin' :
        res.data.role === 'superadmin' ? '/super-admin' :
        '/dashboard'
      );
    } catch (err) {
      toast({ message: err.response?.data?.message || 'Google sign-in failed. Please try again.', type: 'error' });
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => toast({ message: 'Google sign-in was cancelled or failed.', type: 'error' })}
      width="100%"
      theme={resolvedTheme === 'dark' ? 'filled_black' : 'outline'}
    />
  );
}

function GoogleAuthButton() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <GoogleAuthButtonInner />
    </GoogleOAuthProvider>
  );
}

export default GoogleAuthButton;
