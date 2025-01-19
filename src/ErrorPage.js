import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Row, Col, Container } from 'react-bootstrap';
import './App.css';

export default function ErrorPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <Container fluid className="p-5 error-page">
            <Row className="justify-content-center align-items-center vh-100">
                <Col md={8} lg={6} className="text-center">
                    <h1 className='fs-1 fw-bold text-danger'>Oops!</h1>
                    <h2 className="mb-4">Page Not Found</h2> {/* Replaced "Nawawala ka na" */}
                    {location.pathname !== '/error' && (
                        <p className="mb-4">The page at <code>{location.pathname}</code> could not be found.</p>
                    )}
                    <p className="mb-4">Please check the URL or return to the homepage.</p>
                    <button className="btn btn-primary" onClick={handleGoHome}>Go Home</button>
                </Col>
            </Row>
        </Container>
    );
}