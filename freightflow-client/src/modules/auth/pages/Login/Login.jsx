import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { authService } from '../../services/auth.service';
import Input from '../../../../shared/components/Input';
import Button from '../../../../shared/components/Button';
import { toast } from 'react-toastify';
import bgVideo from '../../../../assets/landing-page-bg-video.mp4';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    if (!email) {
      toast.error('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Invalid email format');
      return false;
    }
    if (!password) {
      toast.error('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      login(response.user, response.accessToken, response.refreshToken);
      
      // Role based redirection
      if (response.user.role === 'SUPER_ADMIN') {
        navigate('/app'); // using /app as the generic protected area for now
      } else if (response.user.role === 'COMPANY_OWNER') {
        navigate('/app/companies');
      } else {
        navigate('/app');
      }
    } catch (error) {
      // The Axios response interceptor will catch actual 401s, 
      // but for our mock we handle the error object here too.
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-layout">
      {/* Left Pane - Branding */}
      <div className="login-branding">
        <div className="login-branding-bg">
          <video src={bgVideo} autoPlay loop muted playsInline className="login-bg-video" />
          <div className="login-bg-overlay"></div>
        </div>
        
        <div className="login-branding-content">
          <div className="branding-logo">
            <h2 className="logo-text">FreightFlow</h2>
          </div>
          <div className="branding-text">
            <h1>Global Logistics,<br />Simplified.</h1>
            <p>
              The premium cloud-based ERP built exclusively for global freight forwarders and logistics leaders.
            </p>
          </div>
        </div>
      </div>

      {/* Right Pane - Login Form */}
      <div className="login-form-container">
        <div className="login-card">
          <div className="login-header">
            <h3>Welcome Back</h3>
            <p>Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <Input
              id="email"
              type="email"
              label="Email"
              placeholder="Enter your email"
              prefix={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              autoFocus
            />

            <div className="password-input-wrapper">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="••••••••"
                prefix={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
              <button 
                type="button" 
                className="btn-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" disabled={isLoading} />
                <span>Remember me</span>
              </label>
              {/* <a href="#" className="forgot-password">Forgot password?</a> */}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="btn-login-submit"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="login-footer">
            <p>FreightFlow ERP Version 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
