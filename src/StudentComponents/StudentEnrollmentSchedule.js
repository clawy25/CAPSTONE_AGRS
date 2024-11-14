import React, { useState } from 'react';
import { Table, Form, Button, Modal, Card } from 'react-bootstrap';

const ScheduleTable = () => {
  const [subjects, setSubjects] = useState([
    {
      id: 'CS101',
      description: 'Introduction to Computer Science',
      lectureHours: 3,
      labHours: 1,
      creditedUnits: 4,
      schedule: '',
      checked: false
    },
    {
      id: 'MATH201',
      description: 'Calculus I',
      lectureHours: 4,
      labHours: 0,
      creditedUnits: 4,
      schedule: '',
      checked: false
    },
    // Add more subjects as needed
  ]);

  const [showModal, setShowModal] = useState(false);
  const [checkedCount, setCheckedCount] = useState(0);
  const [userSelectedCount, setUserSelectedCount] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const handleCheckboxChange = (subjectId) => {
    setSubjects((prevSubjects) =>
      prevSubjects.map((subject) =>
        subject.id === subjectId ? { ...subject, checked: !subject.checked } : subject
      )
    );
  };

  const handleScheduleChange = (subjectId, event) => {
    const selectedSchedule = event.target.value;
    setSubjects((prevSubjects) =>
      prevSubjects.map((subject) =>
        subject.id === subjectId ? { ...subject, schedule: selectedSchedule } : subject
      )
    );
  };

  const handleSaveAndAssess = () => {
    const checkedBoxesCount = subjects.filter(subject => subject.checked).length;
    setCheckedCount(checkedBoxesCount);
    setShowModal(true);
  };

  const handleNumberClick = (number) => {
    setUserSelectedCount(number);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (userSelectedCount === checkedCount) {
      setIsEnrolled(true);
    }
  };

  return (
    <section className='container-fluid ms-0'>
      {!isEnrolled && (
        <div>
          <Button className='btn bg-custom-color-green mb-2' onClick={handleSaveAndAssess}>
            Save & Assess
          </Button>

          <div className='card card-success border-success rounded'>
            <span className='card-header bg-custom-color-green text-white custom-font fs-5 ms-0'>
              Check all the subjects and schedule to enroll:
            </span>

            <div className="table-responsive"> {/* Enable horizontal scrolling */}
              <Table hover className="mt-2">
                <thead>
                  <tr>
                    <th className="text-success custom-font">#</th>
                    <th className="text-success custom-font">Subject ID</th>
                    <th className="text-success custom-font">Select</th>
                    <th className="text-success custom-font">Subject Description</th>
                    <th className="text-success custom-font">Lecture Hrs</th>
                    <th className="text-success custom-font">Lab Hrs</th>
                    <th className="text-success custom-font">Credited Units</th>
                    <th className="text-success custom-font">Schedule</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject, index) => (
                    <tr key={subject.id}>
                      <td className="custom-font">{index + 1}</td>
                      <td className="custom-font">{subject.id}</td>
                      <td className="custom-font">
                        <Form.Check 
                          type="checkbox" 
                          checked={subject.checked} 
                          onChange={() => handleCheckboxChange(subject.id)} 
                          className="m-0" 
                        />
                      </td>
                      <td className="custom-font">{subject.description}</td>
                      <td className="custom-font">{subject.lectureHours}</td>
                      <td className="custom-font">{subject.labHours}</td>
                      <td className="custom-font">{subject.creditedUnits}</td>
                      <td className="custom-font">
                        <Form.Select
                          aria-label="Select Schedule"
                          value={subject.schedule}
                          onChange={(event) => handleScheduleChange(subject.id, event)}
                          className="form-select-sm"
                        >
                          <option value="">Select a schedule</option>
                          <option value="Mon 8-10 AM">Mon 8-10 AM</option>
                          <option value="Tue 2-4 PM">Tue 2-4 PM</option>
                          <option value="Wed 10-12 PM">Wed 10-12 PM</option>
                        </Form.Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* Modal for selecting number of checked boxes */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Number of Checked Boxes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You have checked {checkedCount} subjects. Please confirm the count by selecting a number:</p>
          <div className="d-flex flex-wrap gap-2">
            {[...Array(10).keys()].map(i => (
              <Button
                key={i + 1}
                variant={userSelectedCount === i + 1 ? 'success' : 'outline-success'}
                onClick={() => handleNumberClick(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="success" onClick={handleCloseModal} disabled={userSelectedCount !== checkedCount}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Display the Enrollment Card after confirmation */}
      {isEnrolled && (
        <Card className="mt-4">
          <Card.Header className="bg-custom-color-green text-white">
            <strong>You are qualified to Free Higher Education Act.</strong>
          </Card.Header>
          <Card.Body className="text-center">
            <h5 className="text-success fs-3 custom-font">
              You are officially enrolled.
            </h5>
            <p>(S.Y. 2425 - First Semester)</p>
            <Button className='bg-custom-color-green'>
              Certificate of Registrations
            </Button>
          </Card.Body>
        </Card>
      )}
    </section>
  );
};

export default ScheduleTable;
