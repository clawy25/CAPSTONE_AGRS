import React, { useState, useEffect } from 'react';
import { Table, Form, Button, Row, Col } from 'react-bootstrap';
import ProgramModel from '../ReactModels/ProgramModel'; 
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import YearLevelModel from '../ReactModels/YearLevelModel';
import '../App.css';

export default function RegistrarProfessor() {
  const [activeView, setActiveView] = useState('professor');
  const [academicYear, setAcademicYear] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [semester, setSemester] = useState('First');
  const [program, setProgram] = useState('');
  const [programs, setPrograms] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [yearLevels, setYearLevels] = useState([]);
  const [options, setOptions] = useState([]); // Added options state for courses

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedAcademicYears = await AcademicYearModel.fetchExistingAcademicYears();
        setAcademicYears(fetchedAcademicYears);
        if (fetchedAcademicYears.length > 0) {
          setAcademicYear(fetchedAcademicYears[0].academicYear);
        }

        const fetchedYearLevels = await YearLevelModel.fetchExistingYearLevels();
        setYearLevels(fetchedYearLevels);
        if (fetchedYearLevels.length > 0) {
          setYearLevel(fetchedYearLevels[0].yearName);
        }

        const fetchedPrograms = await ProgramModel.fetchAllPrograms();
        setPrograms(fetchedPrograms);
        if (fetchedPrograms.length > 0) {
          setProgram(fetchedPrograms[0].programName);
        }

        // Initialize dummy data for options (courses with statuses)
        setOptions([
          { id: 1, name: 'Course 1', faculty: 'Faculty A', deadline: '2024-12-15', status: 'Pending', color: 'warning', submittedOn: null },
          { id: 2, name: 'Course 2', faculty: 'Faculty B', deadline: '2024-12-20', status: 'Completed', color: 'success', submittedOn: '2024-12-10' },
          { id: 3, name: 'Course 3', faculty: 'Faculty C', deadline: '2024-12-25', status: 'Overdue', color: 'danger', submittedOn: null },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Update status of a specific course
  const setStatus = (id, newStatus, color) => {
    setOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.id === id ? { ...option, status: newStatus, color } : option
      )
    );
  };

  return (
    <section className="container-fluid ms-0">
      {/* Filters */}
      <Row className="mb-4 bg-white rounded p-3">
        <Col>
          <Form.Group controlId="academicYear">
            <Form.Label>Academic Year</Form.Label>
            <Form.Control as="select" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
              {academicYears.map((year) => (
                <option key={year.id} value={year.academicYear}>
                  {year.academicYear}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="yearLevel">
            <Form.Label>Year Level</Form.Label>
            <Form.Control as="select" value={yearLevel} onChange={(e) => setYearLevel(e.target.value)}>
              {yearLevels.map((level) => (
                <option key={level.id} value={level.yearName}>
                  {level.yearName}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="semester">
            <Form.Label>Semester</Form.Label>
            <Form.Control as="select" value={semester} onChange={(e) => setSemester(e.target.value)}>
              <option value="First">First</option>
              <option value="Second">Second</option>
            </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="program">
            <Form.Label>Program</Form.Label>
            <Form.Control as="select" value={program} onChange={(e) => setProgram(e.target.value)}>
              {programs.map((prog) => (
                <option key={prog.id} value={prog.programName}>
                  {prog.programName}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
        <Col>
          <Form.Group controlId="program">
            <Form.Label>Section</Form.Label>
            <Form.Control as="select" value={program} onChange={(e) => setProgram(e.target.value)}>
              {programs.map((prog) => (
                <option key={prog.id} value={prog.programName}>
                  {prog.programName}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Col>
      </Row>

      {/* Table */}
      <div className="card mb-4 bg-white rounded p-3">
        <div className="card-header bg-white">
          <h3>Grade Submission Status</h3>
        </div>
        <div className="card-body">
          <Table bordered className="table">
            <thead className="table-success">
              <tr>
                <th className='align-middle text-center custom-color-green-font custom-font'>Course</th>
                <th className='align-middle text-center custom-color-green-font custom-font'>Faculty</th>
                <th className='align-middle text-center custom-color-green-font custom-font'>Deadline</th>
                <th className='align-middle text-center custom-color-green-font custom-font'>Status</th>
                <th className='align-middle text-center custom-color-green-font custom-font'>Submitted On</th>
              </tr>
            </thead>
            <tbody>
              {options.map((option) => (
                <tr key={option.id}>
                  <td>{option.name}</td>
                  <td>{option.faculty}</td>
                  <td>{option.deadline}</td>
                  <td>
                    <Form.Control
                      as="select"
                      value={option.status}
                      className={`text-${option.color} fw-semibold`}
                      onChange={(e) => {
                        const status = e.target.value;
                        const color = status === 'Pending' ? 'warning' : status === 'Completed' ? 'success' : 'danger';
                        setStatus(option.id, status, color);
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Overdue">Overdue</option>
                    </Form.Control>
                  </td>
                  <td>{option.submittedOn || 'Not Submitted'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </section>
  );
}
