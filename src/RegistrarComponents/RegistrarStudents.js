import React, { useState, useEffect } from 'react';
import '../App.css'; // Custom styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFileAlt, faCog, faFileSignature, faFilter } from '@fortawesome/free-solid-svg-icons'; // Import the icons you want to use
import * as XLSX from 'xlsx';
import StudentModel from '../ReactModels/StudentModel';
import TimelineModel from '../ReactModels/TimelineModel';
import ProgramModel from '../ReactModels/ProgramModel';
import AcademicYearModel from '../ReactModels/AcademicYearModel';

export default function RegistrarStudents() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOption, setFilterOption] = useState('All');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [students, setStudents] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [currentAcademicYear, setcurrentAcademicYear] = useState(null);

    const fetchCurrentAcadYear = async () => {
        try {
            const years = await AcademicYearModel.fetchExistingAcademicYears();
            console.log(years);
    
            const currentYear = years.find((year) => year.isCurrent === true); 
            console.log("Current year found:", currentYear);
    
            setcurrentAcademicYear(currentYear); // Update state with current year
        } catch (error) {
            console.error("Error fetching current academic Year:", error);
        }
    };
    
    // Fetch programs when currentAcademicYear is updated
    useEffect(() => {
        const fetchPrograms = async () => {
        if (currentAcademicYear) {
            try {
                const existingPrograms = await ProgramModel.fetchAllPrograms();
                const filteredPrograms = existingPrograms.filter((program) => program.academicYear === currentAcademicYear.academicYear);

                const trimmedProgramData = [];
                const addedPrograms = new Set();

                filteredPrograms.forEach(row => {
                    if (!addedPrograms.has(row.programNumber)) {
                        trimmedProgramData.push({
                            programNumber: row.programNumber,
                            programName: row.programName
                        });
                        addedPrograms.add(row.programNumber); // Mark this program as added
                    }
                })

                console.log(trimmedProgramData);
                setPrograms(trimmedProgramData);
            } catch (error) {
                console.error("Error fetching programs:", error);
            }
        }
    };
    fetchPrograms();
}, [currentAcademicYear]); // Run this effect when currentAcademicYear changes
    
    // Fetch existing students from StudentModel
    const fetchExistingStudents = async () => {
        try {
            const existingStudents = await StudentModel.fetchExistingStudents();
            console.log(existingStudents); 
            setStudents(existingStudents);
        } catch (error) {
            console.error('Error fetching existing students:', error);
        }
    };

    // Fetch existing students and programs onload
    useEffect(() => {
        fetchCurrentAcadYear();
        fetchExistingStudents();
    }, []);


    // Insert the list of newStudents into the database
    const insertStudents = async (newStudents) => {
        try {
            await StudentModel.insertStudent(newStudents);
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

            const existingStudentNumbers = new Set(students.map(student => student.studentNumber));
            
            const newStudents = [];
            const currentYear = new Date().getFullYear();
            const nextYear = currentYear + 1;
            const currentMonth = new Date().getMonth() + 1;
            const academicYear = `${currentYear}-${nextYear}`;
            const semester = currentMonth >= 7 && currentMonth <= 12 ? 1 : 2;

            for (const row of data) {
                let studentPassword;
                let studentType = row["Status"] || 'Regular'; // Default to 'Regular'
                const studentNameFirst = row["Given Name"] || '';
                const studentNameMiddle = row["Middle Name"] || '';
                const studentNameLast = row["Last Name"] || '';
                const studentSex = row["Gender"] || '';
                const studentEmail = row["Personal Email"] || '';
                const studentBirthDate = row["Birth Date"] || '';
                let studentPccEmail;
                const studentProgramName = row["Program"] || '';
                const studentContact = row["Contact No."] || '';
                const studentAddress = row["Address"];
                const isABMgraduate = row["ABM Graduate"] || true;

                // Validate the row and add it to newStudents if valid
                if (validateRow(studentNameFirst, studentNameMiddle, studentNameLast, studentContact)) {
                    const admissionYear = row["Year Admitted"] || ''; // Admission year
                    const admissionYearInt = parseInt(row["Year Admitted"], 10);
                    let studentYrLevel = 1; // Default to 1
                    let studentNumber = '';
                    if (admissionYearInt < currentYear) {
                        studentYrLevel = (currentYear - admissionYearInt) + 1; // Calculate year level based on difference
                        studentNumber = generateNextStudentNumber(existingStudentNumbers, admissionYearInt); // Generate number based on admission year

                        // If the year level is greater than 4, set the student type to 'Graduated'
                        if (studentYrLevel > 4) {
                            studentType = 'Graduated';
                        }

                    } else if (admissionYearInt === currentYear) {
                        studentYrLevel = 1; // First year if admission year is the current year
                        studentNumber = generateNextStudentNumber(existingStudentNumbers, currentYear); // Generate number based on current year
                    }
                    //AUTO-GENERATE PASSWORD AND PCC EMAIL
                    studentPassword = generatePassword(studentNameFirst,studentNameLast, admissionYear);
                    studentPccEmail = generatePCCemail(studentNameFirst, studentNameLast, admissionYearInt);

                    //SETTING THE PROGRAM NUMBERS; ADDED CURRENT ACADEMIC YEAR VALIDATION
                    let studentProgramNumber;

                    const program = programs.find((p) => p.programName === studentProgramName);
                    if (program) {
                        studentProgramNumber = program.programNumber;
                    }                    
                    

                    // Ensure unique student number
                    while (existingStudentNumbers.has(studentNumber)) {
                        studentNumber = generateNextStudentNumber(existingStudentNumbers, admissionYearInt);
                    }

                    // Add new student to the array
                    newStudents.push(new StudentModel(
                        students.length + newStudents.length + 1, // Generate ID
                        studentNumber,
                        studentPassword,
                        studentType,
                        studentNameFirst,
                        studentNameMiddle,
                        studentNameLast,
                        studentSex,
                        studentEmail,
                        studentBirthDate,
                        studentPccEmail,
                        admissionYear,
                        studentYrLevel, // Set year level based on admission year
                        studentProgramNumber,
                        studentProgramName,
                        studentContact,
                        studentAddress,
                        isABMgraduate
                    ));

                    
                    // Insert timeline data if yearLevel is 4 or below
                    if (studentYrLevel <= 4) {
                        await TimelineModel.createAndInsertTimeline(academicYear, studentNumber, studentYrLevel, semester, new Date(), null, false, false, admissionYearInt);
                    }

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

    //AUTOMATE GENERATION OF PCC EMAIL
    const generatePCCemail = (FirstName, LastName, admissionYear) => {
        const PCCemail = `${LastName.toLowerCase().replace(/\s+/g, "")}_${FirstName.toLowerCase().replace(/\s+/g, "")}${admissionYear}@paranaquecitycollege.edu.ph`;
        return PCCemail;
    };
    
    const generatePassword = (FirstName, LastName, admissionYear) => {
        const password = `${FirstName.replace(/\s+/g, "")}${admissionYear}${LastName.replace(/\s+/g, "")}`;
        return password;
    };
    
    
    // Modify the generateNextStudentNumber function to accept a year parameter
    const generateNextStudentNumber = (existingNumbers, year) => {
        let highestNumber = 0;
    
        // Loop through existing student numbers to find the highest for the given year
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

    {/* DONT DELETE THIS YET
    const generateNextSectionNumber = (year, studentProgramNumber, existingSectionNumbers) => {
        let highestNumber = 1;
        let sectionCount = 0;
    
        // Loop through existing section numbers
        existingSectionNumbers.forEach(section => {
            const [sectionYear, programNumber, sectionNumber] = section.split('-');
    
            // Check if the section matches the current year and student program number
            if (sectionYear === year.toString() && programNumber === studentProgramNumber.toString()) {
                const numberPart = parseInt(sectionNumber, 10); // Parse section number
    
                // Update highest section number
                if (numberPart > highestNumber) {
                    highestNumber = numberPart;
                }
    
                // Increment the count of students in this section
                sectionCount++;
            }
        });
    
        // Count the number of students in the highest section number
        const highestSectionCount = existingSectionNumbers.filter(section => {
            const [, , secNum] = section.split('-');
            return secNum === highestNumber.toString().padStart(3, '0'); // Match with padded number
        }).length;
    
        // Check if there are already 60 or more students in the current highest section
        if (highestSectionCount >= 60) {
            // Increment the highest number to create a new section
            highestNumber++;
        }
    
        // Return the new or current section number
        return `${year}-${studentProgramNumber}-${highestNumber.toString().padStart(3, '0')}`; // Format as '2024-101-001'
    };*/}
    
    // Validate each row
    const validateRow = (studentNameFirst, studentNameMiddle, studentNameLast, studentContact) => {
    const hasCompleteName = studentNameFirst && studentNameMiddle && studentNameLast;
    if (!hasCompleteName) {
        return false; // Invalid row
    }
    // Validate contact number (must be 11 digits)
    const isValidContact = studentContact && /^\d{11}$/.test(studentContact);
    if (!isValidContact) {
        return false; // Invalid row
    }

    // Add other validations if necessary

    return true; // Row is valid
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

    //Query Function
    const filteredStudents = students.filter(student => {
        const searchQueryLower = searchQuery.toLowerCase();
        return (
            (student.studentNameFirst && student.studentNameFirst.toLowerCase().includes(searchQueryLower)) ||
            (student.studentNameLast && student.studentNameLast.toLowerCase().includes(searchQueryLower)) ||
            (student.studentNumber && student.studentNumber.toLowerCase().includes(searchQueryLower)) ||
            (student.admissionYear && student.admissionYear.toLowerCase().includes(searchQueryLower)) ||
            (student.studentType && student.studentType.toLowerCase().includes(searchQueryLower)) &&
            (filterOption === 'All' || student.studentType === filterOption)
        );
    });
    
    //Page Layout
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
                                    <button className="dropdown-item" onClick={() => handleFilterChange('Program')}>Program</button>
                                    <button className="dropdown-item" onClick={() => handleFilterChange('Status')}>Status</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upper right: Import Student Classlist button */}
                    <div className="col-12 col-md-6 d-flex justify-content-end align-items-center">
                        <button className="btn btn-success custom-font w-100 w-md-50" onClick={() => document.querySelector('input[type="file"]').click()}> {/* Use w-md-50 for 50% width on desktop */}
                            <FontAwesomeIcon icon={faFileAlt} /> Import Students {/* Font Awesome file icon */}
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
                                        <th className='custom-color-green-font custom-font'style={{ textAlign: 'center' }}>Student Number</th>
                                        <th className='custom-color-green-font custom-font'style={{ textAlign: 'center' }}>Name</th>
                                        <th className='custom-color-green-font custom-font'style={{ textAlign: 'center' }}>PCC Email</th>
                                        <th className='custom-color-green-font custom-font'style={{ textAlign: 'center' }}>Program</th>
                                        <th className='custom-color-green-font custom-font'style={{ textAlign: 'center' }}>Status</th>
                                        <th className='custom-color-green-font custom-font'style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className='bg-white'>
                                    {filteredStudents.map((student) => {

                                        return (
                                            <tr key={student.id}>
                                                <td className='custom-color-green-font'>{student.studentNumber}</td>
                                                <td className='custom-color-green-font'>{student.studentNameLast || ''}, {student.studentNameFirst || ''} {student.studentNameMiddle || ''}</td>
                                                <td className='custom-color-green-font'>{student.studentPccEmail}</td>
                                                <td className='custom-color-green-font'>
                                                    {programs.find(program => program.programNumber === student.studentProgramNumber)?.programName || 'No Program Assigned'}
                                                </td>
                                                <td>
                                                <select
                                                    className="form-select custom-color-green-font"
                                                    value={student.studentType}
                                                    onChange={(e) => handleStatusChange(student.id, e.target.value)} 
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
