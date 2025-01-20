import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ResetPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [accessToken, setAccessToken] = useState('');

    // Extract access token from URL query parameters
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('access_token');
        console.log('Access Token:', token);
        setAccessToken(token || '');
    }, [location]);
    

    // Handle password reset form submission
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
            const response = await fetch(`${process.env.REACT_APP_API_URL}/reset-password`, {
                method: 'POST', // Change from PUT to POST
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ token: accessToken, newPassword }),
            });
            
    
            const contentType = response.headers.get('Content-Type');
            if (!response.ok) {
                const responseText = await response.text();
                console.error('Error response:', responseText);
                setError('Failed to reset password. ' + responseText);
            } else if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                setSuccess('Password has been successfully reset!');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setError('Unexpected response format.');
            }
        } catch (err) {
            console.error('Error resetting password:', err);
            setError('An unexpected error occurred. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
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
                            onChange={(e) => setNewPassword(e.target.value)}
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
                    {error && <p className="mt-3 text-center text-danger">{error}</p>}
                    {success && <p className="mt-3 text-center text-success">{success}</p>}
                </div>
            </div>
        </div>
    );
}
