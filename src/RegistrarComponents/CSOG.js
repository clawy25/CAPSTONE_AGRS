import React, { useState, useEffect } from 'react'; 
import { Table, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import AcademicYearModel from '../ReactModels/AcademicYearModel';
import YearLevelModel from '../ReactModels/YearLevelModel';
import ProgramModel from '../ReactModels/ProgramModel';
import SectionModel from '../ReactModels/SectionModel';

const MasterlistOfGradesTable = () => {
  const [academicYear, setAcademicYear] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [semester, setSemester] = useState('First'); // Default to "First" semester
  const [program, setProgram] = useState('');
  const [sections, setSections] = useState(Array(8).fill(null).map((_, index) => `Section ${index + 1}`));

  const [academicYears, setAcademicYears] = useState([]);
  const [yearLevels, setYearLevels] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState(null);

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedAcademicYears = await AcademicYearModel.fetchExistingAcademicYears();
        setAcademicYears(fetchedAcademicYears);
        if (fetchedAcademicYears.length > 0) {
          setAcademicYear(fetchedAcademicYears[0].academicYear); // Set first academic year as default
        }

        const fetchedYearLevels = await YearLevelModel.fetchExistingYearLevels();
        setYearLevels(fetchedYearLevels);
        if (fetchedYearLevels.length > 0) {
          setYearLevel(fetchedYearLevels[0].yearName); // Set first year level as default
        }

        const fetchedPrograms = await ProgramModel.fetchAllPrograms();
        setPrograms(fetchedPrograms);
        if (fetchedPrograms.length > 0) {
          setProgram(fetchedPrograms[0].programName); // Set first program as default
        }

        setSections(Array(8).fill(null).map((_, index) => `Section ${index + 1}`));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const columns = ["ITEM", "SNUMBER", "STUDENT NAME", "PAN101", "HUM101", "STS101", "VE101", "NSTP102", "PE12", "LIT101"];
  const weightedColumns = ["PAN101", "HUM101", "STS101", "VE101", "NSTP102", "PE12", "LIT101", "WGA"];
  const professors = ["Oreta", "Gatdula", "Escaran", "Sagun", "Bautista", "Dela Cruz", "Ramos"];

  const handleView = () => {
    const selectedProgram = programs.find((prog) => prog.programName === program);
    if (selectedProgram && academicYear && yearLevel && semester) {
      setSelectedProgramId(selectedProgram.id);
    } else {
      setSelectedProgramId(null);
    }
  };

  const printCSOG = () => {
    // Open the PDF file from the public folder in a new tab
    window.open('/SOG.pdf', '_blank');
  };

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      <Row className="mb-4 bg-white rounded p-3 m-1">
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
        <Col className="d-flex align-items-end ">
          <Button className="w-25 btn-success me-2" onClick={handleView}>View</Button>
          <Button className="w-75 btn-success" onClick={printCSOG}>Download CSOG</Button>
        </Col>
      </Row>

      {selectedProgramId && (
        <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
          <h5 className="text-center">{program}</h5>
          {sections.map((section, sectionIndex) => (
            <Table bordered key={sectionIndex} className="text-center">
              <thead className='table-success'>
                <tr>
                  <th colSpan="3" className='custom-color-green-font'>{`${program} - ${section}`}</th>
                  {columns.slice(3).map((col, index) => (
                    <th key={index} className='custom-color-green-font'>{professors[index]}</th>
                  ))}
                  <th colSpan={weightedColumns.length} className='custom-color-green-font'>
                    WEIGHTED GRADE AVERAGE
                  </th>
                  <th rowSpan={2} className='custom-color-green-font'>Certificate of Grades (COG)</th>
                </tr>
                <tr>
                  {columns.map((col, index) => (
                    <td key={index} className='bg-success text-white'>{col}</td>
                  ))}
                  {weightedColumns.map((col, index) => (
                    <td key={`wg-${index}`} className='bg-success text-white'>{col}</td>
                  ))}
                </tr>
              </thead>
              <tbody className='table-success'>
                {Array.from({ length: 15 }).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className='bg-white'>{rowIndex + 1}</td>
                    <td className='bg-white'>-</td>
                    <td className='bg-white'>-</td>
                    {columns.slice(3).map((_, colIndex) => (
                      <td key={`col-${colIndex}`} className='bg-white'></td>
                    ))}
                    {weightedColumns.map((_, colIndex) => (
                      <td key={`wg-col-${colIndex}`}>0.0</td>
                    ))}
                    <td><Button 
                      variant="success" 
                      className='w-100' 
                      onClick={openModal}
                    >
                      COG
                    </Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ))}
        </div>
      )}

      {/* Modal for COG */}
      <Modal show={showModal} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className='custom-color-green-font'>Certificate of Grades</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table bordered className="text-center">
            <thead className='table-success'>
              <tr>
                <th colSpan="2" className='custom-color-green-font'>STUDENT NAME:</th>
                <th colSpan="3" className='custom-color-green-font'>STUDENT ID NO.:</th>
              </tr>
              <tr>
                <th colSpan="2" className='custom-color-green-font'>PROGRAM CODE & DESCRIPTION:</th>
                <th className='custom-color-green-font'>ACADEMIC YEAR:</th>
                <th className='custom-color-green-font'>SEMESTER:</th>
                <th className='custom-color-green-font'>YEAR LEVEL:</th>
              </tr>
              <tr>
                <th className='custom-color-green-font'>CODE</th>
                <th className='custom-color-green-font'>COURSE DESCRIPTION</th>
                <th className='custom-color-green-font'>UNITS</th>
                <th className='custom-color-green-font'>GRADE</th>
                <th className='custom-color-green-font'>REMARKS</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 10 }).map((_, index) => (
                <tr key={index}>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={closeModal}>Close</Button>
          <Button variant="success" >Download COG</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MasterlistOfGradesTable;
