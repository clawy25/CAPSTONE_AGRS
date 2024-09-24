import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

export default function StudentEnrollment(){
    const navigate = useNavigate();
    return(
    
        <section>
            <div className="card bg-custom-color-green text-white fw-bold border-1 rounded mb-2">
              <span className="card-header">STATUS: Grades not complete</span>
              <div className="card-body bg-white rounded border-2 border-success d-flex justify-content-center align-items-center">
                <p className="card-text custom-font fs-2 border-1 fw-bold text-success m-0">
                  Online Enrollment is not open yet.
                </p>
              </div>
            </div>
        
        </section>
    )
}