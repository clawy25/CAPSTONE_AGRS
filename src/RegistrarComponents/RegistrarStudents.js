import React, { useState, useEffect } from 'react';
import '../App.css'; // Custom styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFileAlt, faCog, faFileSignature, faFilter } from '@fortawesome/free-solid-svg-icons'; // Import the icons you want to use
import * as XLSX from 'xlsx';
import StudentModel from '../ReactModels/StudentModel';

export default function RegistrarStudents() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOption, setFilterOption] = useState('All');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [students, setStudents] = useState([]);

    // Fetch existing students from StudentModel
    const fetchExistingStudents = async () => {
        try {
            const existingStudents = await StudentModel.fetchExistingStudents();
            setStudents(existingStudents);
        } catch (error) {
            console.error('Error fetching existing students:', error);
        }
    };

    // Fetch existing students onload
    useEffect(() => {
        fetchExistingStudents();
    }, []);

    // Insert the list of newStudents into the database
    const insertStudents = async (newStudents) => {
        try {
            const response = await StudentModel.insertStudent(newStudents); // Pass the entire array for bulk insert
            console.log('Inserted students:', response);
        } catch (error) {
            console.error('Error inserting students in bulk:', error);
        }
    };

    // Scan the spreadsheet to get the list of newStudents
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            console.error('No file selected');
            return; // Exit if no file is selected
        }
        const reader = new FileReader();
    
        reader.onload = async (event) => {
            const binaryStr = event.target.result;
            const workbook = XLSX.read(binaryStr, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet);
    
            // Get the existing student numbers
            const existingStudentNumbers = new Set(students.map(student => student.studentNumber));
            const newStudents = [];
    
            for (const row of data) {
                // Map each column from the spreadsheet to a field in the model
                const studentPassword = row["studentPassword"] || '';
                const studentType = row["studentType"] || '';
                const studentName = row["studentName"] || '';
                const studentGender = row["studentGender"] || '';
                const studentEmail = row["studentEmail"] || '';
                const studentBirthDate = row["studentBirthDate"] || '';
                const studentPccEmail = row["studentPccEmail"] || '';
                const studentAdmissionYr = row["studentAdmissionYr"] || '';
                const studentYrLevel = row["studentYrLevel"] || '';
                const studentProgramNumber = row["studentProgramNumber"] || '';
                const studentProgramName = row["Program Name"] || '';
    
                // Validate the row and add it to newStudents if valid
                if (validateRow(row, existingStudentNumbers)) {
                    // Generate a unique student number for each valid student
                    let studentNumber = generateNextStudentNumber(existingStudentNumbers);
    
                    // Ensure unique student number (though it should be unique if generated correctly)
                    while (existingStudentNumbers.has(studentNumber)) {
                        studentNumber = generateNextStudentNumber(existingStudentNumbers);
                    }
    
                    // Add new student to the array
                    newStudents.push(new StudentModel(
                        students.length + newStudents.length + 1, // Generate ID
                        studentNumber,
                        studentPassword,
                        studentType,
                        studentName,
                        studentGender,
                        studentEmail,
                        studentBirthDate,
                        studentPccEmail,
                        studentAdmissionYr,
                        studentYrLevel,
                        studentProgramNumber,
                        studentProgramName
                    ));
    
                    // Add the newly generated student number to the existing set
                    existingStudentNumbers.add(studentNumber);
                }
            }
    
            // Insert all valid records in bulk
            console.log("New students to insert:", newStudents);
            await insertStudents(newStudents);
            await fetchExistingStudents(); // Refresh the student list after import
        };
    
        reader.readAsArrayBuffer(file);
    };
    

    // Validate each row
    const validateRow = (row, existingStudentNumbers) => {
        if (!row.studentName) {
            return false; // Invalid row
        }
        return true; // Valid row
    };

    // Function for generating new studentNumbers
    const generateNextStudentNumber = (existingNumbers) => {
        const year = new Date().getFullYear(); // Get current year (e.g., 2024)
        let highestNumber = 0;

        // Loop through existing student numbers to find the highest
        existingNumbers.forEach(num => {
            const currentYear = num.split('-')[0];
            if (currentYear === year.toString()) {
                const numberPart = parseInt(num.split('-')[1]);
                if (numberPart > highestNumber) {
                    highestNumber = numberPart;
                }
            }
        });

        const nextNumber = highestNumber + 1;
        return `${year}-${nextNumber.toString().padStart(6, '0')}`; // Format as '2024-000001'
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleFilterChange = (option) => {
        setFilterOption(option);
        setShowFilterDropdown(false); // Close the dropdown after selection
    };

    const handleStatusChange = (id, newStatus) => {
        const updatedStudents = students.map(student =>
            student.id === id ? { ...student, status: newStatus } : student
        );
        setStudents(updatedStudents);
    };

    const filteredStudents = students.filter(student => {
        const searchQueryLower = searchQuery.toLowerCase();
        return (
            (student.studentName && student.studentName.toLowerCase().includes(searchQueryLower)) ||
            (student.studentNumber && student.studentNumber.toLowerCase().includes(searchQueryLower)) ||
            (student.studentType && student.studentType.toLowerCase().includes(searchQueryLower)) &&
            (filterOption === 'All' || student.studentType === filterOption)
        );
    });
    
    

    return (
        <div className="container-fluid">
            <h2 className="custom-font custom-color-green-font">Students Masterlist</h2>
        
            <section className='container-fluid bg-white p-2 px-4 rounded'>
                <div className="row my-3">
                    {/* Upper left: Search input with icon on the right side */}
                    <div className="col-12 col-md-6 d-flex align-items-center mb-2 mb-md-0">
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search student..."
                                value={searchQuery}
                                onChange={handleSearch}
                            />
                            <span className="input-group-text">
                                <FontAwesomeIcon icon={faSearch} /> {/* Font Awesome search icon */}
                            </span>
                        </div>
                        {/* Filter Icon with dropdown */}
                        <div className="ms-2 position-relative">
                            <span
                                className="input-group-text cursor-pointer"
                                onClick={() => setShowFilterDropdown(!showFilterDropdown)} // Toggle dropdown
                            >
                                <FontAwesomeIcon className='custom-color-green-font' icon={faFilter} /> {/* Filter icon */}
                            </span>
                            {showFilterDropdown && (
                                <div className="dropdown-menu show" style={{ position: 'absolute', zIndex: 100 }}>
                                    <button className="dropdown-item" onClick={() => handleFilterChange('All')}>All</button>
                                    <button className="dropdown-item" onClick={() => handleFilterChange('Year')}>Year</button>
                                    <button className="dropdown-item" onClick={() => handleFilterChange('Section')}>Section</button>
                                    <button className="dropdown-item" onClick={() => handleFilterChange('Program')}>Program</button>
                                    <button className="dropdown-item" onClick={() => handleFilterChange('Status')}>Status</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upper right: Import Student Classlist button */}
                    <div className="col-12 col-md-6 d-flex justify-content-end align-items-center">
                        <button className="btn btn-success custom-font w-100 w-md-50" onClick={() => document.querySelector('input[type="file"]').click()}> {/* Use w-md-50 for 50% width on desktop */}
                            <FontAwesomeIcon icon={faFileAlt} /> Import Student Classlist {/* Font Awesome file icon */}
                        </button>
                        <input 
                            type="file" 
                            style={{ display: 'none' }} 
                            accept=".xlsx, .xls" 
                            onChange={handleFileUpload} 
                        />

                    </div>
                </div>

                {/* Student list table */}
                <div className="row">
                    <div className="col-md-12">
                        <div className="table-responsive"> {/* Add table-responsive class for responsive scrolling */}
                            <table className="table table-hover ">
                                <thead className="table-success">
                                    <tr>
                                        <th className='custom-color-green-font custom-font'>Item No.</th>
                                        <th className='custom-color-green-font custom-font'>Name</th>
                                        <th className='custom-color-green-font custom-font'>Student Number</th>
                                        <th className='custom-color-green-font custom-font'>Batch Year</th>
                                        <th className='custom-color-green-font custom-font'>Section</th>
                                        <th className='custom-color-green-font custom-font'>Course</th>
                                        <th className='custom-color-green-font custom-font'>Status</th>
                                        <th className='custom-color-green-font custom-font'>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className='bg-white'>
                                    {filteredStudents.map((student) => {
                                        return (
                                            <tr key={student.id}>
                                                <td className='custom-color-green-font'>{student.id}</td>
                                                <td className='custom-color-green-font'>{student.studentName}</td>
                                                <td className='custom-color-green-font'>{student.studentNumber}</td>
                                                <td className='custom-color-green-font'>{student.studentAdmissionYr}</td>
                                                <td className='custom-color-green-font'>{student.section}</td>
                                                <td className='custom-color-green-font'>{student.studentProgramName}</td>
                                                <td>
                                                <select
                                                    className="form-select custom-color-green-font"
                                                    value={student.studentType}
                                                    onChange={(e) => handleStatusChange(student.id, e.target.value)} // Changed from student.id to student.itemNumber
                                                >
                                                    <option value="Regular">Regular</option>
                                                    <option value="Irregular">Irregular</option>
                                                    <option value="Withdraw">Withdraw</option>
                                                    <option value="INC">Incomplete (INC)</option>
                                                </select>
                                                </td>
                                                <td>
                                                    <button className="btn btn-success btn-sm me-2">
                                                        <FontAwesomeIcon icon={faCog} /> COG {/* Font Awesome settings icon */}
                                                    </button>
                                                    <button className="btn btn-success btn-sm">
                                                        <FontAwesomeIcon icon={faFileSignature} /> TOR {/* Font Awesome signature icon */}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
