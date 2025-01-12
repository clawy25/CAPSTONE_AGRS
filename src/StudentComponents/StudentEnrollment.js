import React, { useState, useEffect } from 'react';
import StudentEnrollmentSchedule from './StudentEnrollmentSchedule';
import '../App.css';
import './StudentEnrollment.css'; // Import the CSS file

export default function StudentEnrollment() {
  const [isEnrolled, setIsEnrolled] = useState(false); // State to track enrollment status

  // Simulate enrollment status (replace this logic as needed)
  useEffect(() => {
    // Example: Automatically set enrollment to true after a condition or delay
    const checkEnrollment = () => {
      setIsEnrolled(true); // Replace with actual logic
    };
    checkEnrollment();
  }, []);

  return (
    <section>
      {/* Conditionally render the enrollment status or the schedule */}
      {!isEnrolled ? (
        <div>
          <div className="card bg-custom-color-green text-white fw-bold border-1 rounded mb-2">
            <span className="card-header">STATUS: Grades not complete</span>
            <div className="card-body bg-white rounded border-2 border-success d-flex justify-content-center align-items-center">
              <p className="card-text custom-font fs-2 border-1 fw-bold text-success m-0">
                Online Enrollment is not open yet.
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Once enrolled, display the StudentEnrollmentSchedule component
        <StudentEnrollmentSchedule />
      )}
    </section>
  );
}