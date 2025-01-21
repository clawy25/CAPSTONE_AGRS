import { useState } from "react";
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleBackClick = () => {
        navigate('/login');
    };

    const handleRequestPassword = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);
    
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/forgot-password/set`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
    
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Request failed');
    
            setMessage({ type: 'success', text: data.message });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.message || 'An error occurred.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    

    return (
        <div className="container-fluid hide-scrollbar">
            <div className="row d-flex flex-column flex-md-row">
                <div className="col-12 col-md-6 bg-custom-color-green d-flex flex-column justify-content-center align-items-center min-vh-100 order-1 order-md-2">
                    <p className="custom-font text-light fs-1 fw-bold text-center mb-4">
                        Request New Password
                    </p>

                    <form onSubmit={handleRequestPassword} className="d-grid gap-2 col-8 mx-auto mt-2">
                        <input
                            type="email"
                            className="form-control custom-input custom-font fs-5"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button
                            className="btn bg-custom-color-yellow custom-font custom-button fs-5 fw-semibold"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Requesting...' : 'Request New Password'}
                        </button>
                    </form>
                    {message && (
                        <p className={`mt-3 text-center fw-bold ${message.type === 'success' ? 'text-success' : 'text-danger'}`}>
                            {message.text}
                        </p>
                    )}
                    <button
                        className="btn btn-back custom-font fs-6 mt-3 custom-color-font fw-semibold"
                        onClick={handleBackClick}
                    >
                        BACK
                    </button>
                </div>
            </div>
        </div>
    );
}
