import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePasswordReset = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('http://localhost:3001/api/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Password has been successfully reset!');
                setTimeout(() => navigate('/login'), 3000); // Redirect to login page after 3 seconds
            } else {
                setError(data.error || 'Failed to reset password. Please try again.');
            }
        } catch (err) {
            console.error('Error resetting password:', err);
            setError('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container-fluid hide-scrollbar">
            <div className="row d-flex flex-column flex-md-row">
                <div className="col-12 col-md-6 bg-custom-color-green d-flex flex-column justify-content-center align-items-center min-vh-100 order-1 order-md-2">
                    <p className="custom-font text-light fs-1 fw-bold text-center mb-4">
                        Reset Your Password
                    </p>

                    <form className="d-grid gap-2 col-8 mx-auto mt-2" onSubmit={handlePasswordReset}>
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
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        {error && <p className="text-danger mt-2">{error}</p>}
                        {success && <p className="text-success mt-2">{success}</p>}

                        <button
                            className="btn bg-custom-color-yellow custom-font custom-button fs-5 fw-semibold"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
                <div className="col-12 col-md-6 d-flex justify-content-center align-items-center flex-column order-2 order-md-1">
                    <img
                        className="PCClogo img-fluid rounded mt-4 pt-md-3"
                        src="pcc.png"
                        alt="PCC Logo"
                        style={{ maxWidth: '100%', height: 'auto' }}
                    />
                </div>
            </div>
        </div>
    );
}
