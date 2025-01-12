import { useState } from "react";
import { useNavigate } from 'react-router-dom';

export default function Forgotpassword() {
    const navigate = useNavigate();
    const [email, setEmail] = useState(''); // Store the email input
    const [message, setMessage] = useState(null); // Store success or error messages
    const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

    const handleBackClick = () => {
        navigate('/login');
    };

    const handleRequestPassword = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);
    
        try {
            
            const apiUrl = process.env.REACT_APP_API_URL;
            const response = await fetch(`${apiUrl}/forgot-password/set`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
    
            console.log('Raw response:', response);
    
            if (!response.ok) {
                const error = await response.text(); // Capture server's error message
                console.error('Backend Error:', error);
                throw new Error(error || 'Request failed');
            }
    
            const data = await response.json();
            setMessage({ type: 'success', text: data.message });
        } catch (error) {
            console.error('Network or Server Error:', error);
            setMessage({ type: 'error', text: error.message || 'Network error or server is unreachable.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    
  

    return (
        <div className="container-fluid hide-scrollbar">
            <div className="row d-flex flex-column flex-md-row">
                <div className="col-12 col-md-6 bg-custom-color-green d-flex flex-column justify-content-center align-items-center min-vh-100 order-1 order-md-2">
                    <img
                        className="miniPCClogo img-fluid rounded mt-4 mb-3 pt-md-3"
                        src="pcc.png"
                        alt="PCC Logo"
                        style={{ maxWidth: '17%', height: 'auto' }}
                    />
                    <p className="custom-font text-light fs-1 fw-bold text-center mb-4">
                        Request New Password
                    </p>

                    <div className="d-grid gap-2 col-8 mx-auto mt-2">
                        <form onSubmit={handleRequestPassword} className="d-grid gap-2 col-8 mx-auto mt-2">
                            <input
                                type="email"
                                className="form-control custom-input custom-font fs-5"
                                id="StudentEmail"
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
                            <p
                                className={`mt-3 text-center fw-bold ${
                                    message.type === 'success' ? 'text-success' : 'text-danger'
                                }`}
                            >
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
