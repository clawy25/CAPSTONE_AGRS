import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

export default function RegistrarProfessor(){
    const navigate = useNavigate();
    return(
    
        <section  className="container-fluid ms-0">

                      <div className="row g-4">
                            {/* BS in Entrepreneurship */}
                            <div className="col-6 col-md-3 mb-3">
                                <button
                                    className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center"
                                    style={{ height: '200px', width: '100%' }}
                                   // Switch to Grades section
                                >
                                    <span className="ms-2">BS in Entrepreneurship</span>
                                </button>
                            </div>

                            {/* BS in Real Estate Management */}
                            <div className="col-6 col-md-3 mb-3">
                                <button className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center" style={{ height: '200px', width: '100%' }}>
                                    <span className="ms-2">BS in Real Estate Management</span>
                                </button>
                            </div>

                            {/* BS in Tourism Management */}
                            <div className="col-6 col-md-3 mb-3">
                                <button className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center" style={{ height: '200px', width: '100%' }}>
                                    <span className="ms-2">BS in Tourism Management</span>
                                </button>
                            </div>

                            {/* 2-Year Hospitality Management Services */}
                            <div className="col-6 col-md-3 mb-3">
                                <button className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center" style={{ height: '200px', width: '100%' }}>
                                    <span className="ms-2">2-Year Hospitality Mgmt Services</span>
                                </button>
                            </div>

                            {/* Bookkeeping NC III */}
                            <div className="col-6 col-md-3 mb-3">
                                <button className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center" style={{ height: '200px', width: '100%' }}>
                                    <span className="ms-2">Bookkeeping NC III</span>
                                </button>
                            </div>

                            {/* Food and Beverage Services NC II */}
                            <div className="col-6 col-md-3 mb-3">
                                <button className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center" style={{ height: '200px', width: '100%' }}>
                                    <span className="ms-2">F&B Services NC II</span>
                                </button>
                            </div>

                            {/* Housekeeping NC II */}
                            <div className="col-6 col-md-3 mb-3">
                                <button className="btn btn-bg-custom-color-green custom-color-font fs-5 rounded custom-font d-flex align-items-center justify-content-center" style={{ height: '200px', width: '100%' }}>
                                    <span className="ms-2">Housekeeping NC II</span>
                                </button>
                            </div>
                        </div>
        
        </section>
    )
}