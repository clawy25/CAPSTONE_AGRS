import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [accessToken, setAccessToken] = useState('');
    console.log(accessToken);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('access_token'); // Directly extract token
    
        if (token) {
            setAccessToken(token);
        } else {
            setError('Access token is missing or invalid.');
        }
    }, [location]);
    
    const validatePassword = (password) => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters long.';
        }
        if (!/[A-Z]/.test(password)) {
            return 'Password must contain at least one uppercase letter.';
        }
        if (!/[!@#$%^&*]/.test(password)) {
            return 'Password must contain at least one special character.';
        }
        return '';
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();
    
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
    
        if (!accessToken) {
            setError('Access token is missing. Please use the password reset link again.');
            return;
        }
    
        setIsSubmitting(true);
        setError('');
        setSuccess('');
    
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/forgot-password/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: accessToken, newPassword }),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                console.error('Error response:', data);
                setError(data.error || 'Failed to reset password.');
            } else {
                setSuccess('Password has been successfully reset!');
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch (err) {
            console.error('Error resetting password:', err);
            setError('An unexpected error occurred. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setNewPassword(newPassword);
        setPasswordError(validatePassword(newPassword));
    };
    
    

    return (
        <div className="container-fluid hide-scrollbar">
            <div className="row d-flex flex-column flex-md-row">
                <div className="col-12 col-md-6 bg-custom-color-green d-flex flex-column justify-content-center align-items-center min-vh-100 order-1 order-md-2">
                    <p className="custom-font text-light fs-1 fw-bold text-center mb-4">Reset Password</p>

                    <form onSubmit={handlePasswordReset} className="d-grid gap-2 col-8 mx-auto mt-2">
                        <input
                            type="password"
                            className="form-control custom-input custom-font fs-5"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={handlePasswordChange}
                            required
                        />
                        <input
                            type="password"
                            className="form-control custom-input custom-font fs-5"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <button
                            className="btn bg-custom-color-yellow custom-font custom-button fs-5 fw-semibold"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                    <div className="invalid-feedback">{passwordError}</div>
                    {error && <p className="mt-3 text-center text-danger">{error}</p>}
                    {success && <p className="mt-3 text-center text-success">{success}</p>}
                </div>
            </div>
        </div>
    );
}
