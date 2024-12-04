import React, { useState, useEffect } from 'react';
import { Table, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import ProgramModel from '../ReactModels/ProgramModel'; 
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import '../App.css';

export default function RegistrarProfessor() {
  const [academicYear, setAcademicYear] = useState('');
  const [program, setProgram] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [semester, setSemester] = useState('First');
  const [academicYears, setAcademicYears] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [yearLevels, setYearLevels] = useState([]);
  const [programsByAcademicYear, setProgramsByAcademicYear] = useState({});
  const [yearLevelsByProgram, setYearLevelsByProgram] = useState({});
  const [showModal, setShowModal] = useState(false);

  const handleCloseModal = () => setShowModal(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch academic years
        const fetchedAcademicYears = await AcademicYearModel.fetchExistingAcademicYears();
        setAcademicYears(fetchedAcademicYears);

        if (fetchedAcademicYears.length > 0) {
          setAcademicYear(fetchedAcademicYears[0].academicYear);
        }

        // Fetch all programs
        const fetchedPrograms = await ProgramModel.fetchAllPrograms();
        const groupedPrograms = fetchedPrograms.reduce((acc, program) => {
          acc[program.academicYear] = acc[program.academicYear] || [];
          acc[program.academicYear].push(program);
          return acc;
        }, {});

        setProgramsByAcademicYear(groupedPrograms);

        // Group year levels by program
        const groupedYearLevels = fetchedPrograms.reduce((acc, program) => {
          acc[program.programName] = Array.from(
            { length: program.programNumOfYear },
            (_, index) => ({
              id: `${program.programName}-${index + 1}`,
              year: index + 1,
              hasSummer: program.programYrLvlSummer.includes(index + 1),
            })
          );
          return acc;
        }, {});

        setYearLevelsByProgram(groupedYearLevels);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleAcademicYearChange = (year) => {
    setAcademicYear(year);
    setProgram('');
    setYearLevel('');
  };

  const handleProgramChange = (prog) => {
    setProgram(prog);
    setYearLevel('');
  };

  const availablePrograms = programsByAcademicYear[academicYear] || [];
  const availableYearLevels = yearLevelsByProgram[program] || [];

  return (
    <section className="container-fluid ms-0">
      <h2 className="custom-font custom-color-green-font my-3">Grade Submission Status</h2>
      <Row className="mb-4 bg-white rounded p-3">
        <Col>
          <Form.Group controlId="academicYear">
            <Form.Label>Academic Year</Form.Label>
            <Form.Control
              as="select"
              value={academicYear}
              onChange={(e) => handleAcademicYearChange(e.target.value)}
            >
              {academicYears
                .sort((a, b) => b.academicYear.localeCompare(a.academicYear))
                .map((year) => (
                  <option key={year.id} value={year.academicYear}>
                    {year.academicYear}
                  </option>
                ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="program">
            <Form.Label>Program</Form.Label>
            <Form.Control
              as="select"
              value={program}
              onChange={(e) => handleProgramChange(e.target.value)}
              disabled={!academicYear}
            >
              <option value="">Select Program</option>
              {availablePrograms.map((prog) => (
                <option key={prog.id} value={prog.programName}>
                  {prog.programName}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="yearLevel">
            <Form.Label>Year Level</Form.Label>
            <Form.Control
              as="select"
              value={yearLevel}
              onChange={(e) => setYearLevel(e.target.value)}
              disabled={!program}
            >
              <option value="">Select Year Level</option>
              {availableYearLevels.map((yl) => (
                <option key={yl.id} value={yl.year}>
                  {`Year ${yl.year}${yl.hasSummer ? ' (with Summer)' : ''}`}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="semester">
            <Form.Label>Semester</Form.Label>
            <Form.Control
              as="select"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              disabled={!yearLevel}
            >
              <option value="First">First</option>
              <option value="Second">Second</option>
              {availableYearLevels.find((yl) => yl.year === parseInt(yearLevel))?.hasSummer && (
                <option value="Summer">Summer</option>
              )}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      {/* Table */}
      <Row>
        <div className="card mb-4 bg-white rounded p-3">
          <div className="card-body">
            <Table bordered className="table">
              <thead className="table-success">
                <tr>
                  <th>Course</th>
                  <th>Faculty</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Submitted On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Example row mapping */}
                {/* Use dynamic data for rows */}
                <tr>
                  <td>Course 1</td>
                  <td>Faculty 1</td>
                  <td>2024-12-04</td>
                  <td>10:00 AM</td>
                  <td>Completed</td>
                  <td>2024-12-03</td>
                  <td>
                    <button
                      className="btn btn-warning"
                      onClick={() => setShowModal(true)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              </tbody>
            </Table>
          </div>
        </div>
      </Row>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Grade Submission</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="courseCode">
              <Form.Label>Course Code</Form.Label>
              <Form.Control type="text">

              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3" controlId="courseDescription">
              <Form.Label>Course Description</Form.Label>
              <Form.Control type="text">

              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3" controlId="personnelNumber">
              <Form.Label>Personnel Number</Form.Label>
              <Form.Control type="text">

              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3" controlId="personnelName">
              <Form.Label>Personnel Name</Form.Label>
              <Form.Control type="text">

              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3" controlId="date">
              <Form.Label>Date of Submission</Form.Label>
              <Form.Control type="date">

              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3" controlId="time">
              <Form.Label>Time of Submission</Form.Label>
              <Form.Control type="time">

              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3" controlId="status">
              <Form.Label>Status</Form.Label>
              <Form.Control type="text">

              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3" controlId="submittedOn">
              <Form.Label>Submitted On</Form.Label>
              <Form.Control type="text">

              </Form.Control>
            </Form.Group>
          </Form>
          
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-outline-success" onClick={handleCloseModal}>Close</button>
          <button className="btn btn-success">Save</button>     
        </Modal.Footer>
      </Modal>
    </section>
  );
}





