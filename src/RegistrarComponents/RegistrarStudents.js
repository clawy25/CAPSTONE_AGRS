import React, { useState } from 'react';
import '../App.css'; // Custom styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFileAlt, faCog, faFileSignature, faFilter } from '@fortawesome/free-solid-svg-icons'; // Import the icons you want to use

export default function RegistrarStudents() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOption, setFilterOption] = useState('All');
    const [showFilterDropdown, setShowFilterDropdown] = useState(false); // State to toggle filter dropdown
    const [students, setStudents] = useState([
        // Sample data, replace with actual student data
        { 
            itemNumber: 1, 
            name: 'John Doe',
            studentNumber: '0000-001-PCC-0' ,
            batchYear: '2020', 
            section: 'A', 
            course: 'BSCS', 
            status: 'Regular' 
        },
        { 
            itemNumber: 2, 
            name: 'Jane Smith', 
            studentNumber: '0000-002-PCC-0' ,
            batchYear: '2021', 
            section: 'B', 
            course: 'BSIT', 
            status: 'Irregular' 
        },
        { 
            itemNumber: 3, 
            name: 'Alex Johnson', 
            studentNumber: '0000-003-PCC-0' ,
            batchYear: '2022', 
            section: 'C', 
            course: 'BSCS', 
            status: 'Regular' 
        }
    ]);

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
        return (
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (filterOption === 'All' || student.status === filterOption)
        );
    });

    const importStudents = (e) => {
        //insert API
    };

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
                        <button className="btn btn-success custom-font w-100 w-md-50" onClick={importStudents}> {/* Use w-md-50 for 50% width on desktop */}
                            <FontAwesomeIcon icon={faFileAlt} /> Import Student Classlist {/* Font Awesome file icon */}
                        </button>
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
                                    {filteredStudents.map(student => (
                                        <tr key={student.itemNumber}>
                                            <td className='custom-color-green-font'>{student.itemNumber}</td>
                                            <td className='custom-color-green-font'>{student.name}</td>
                                            <td className='custom-color-green-font'>{student.studentNumber}</td>
                                            <td className='custom-color-green-font'>{student.batchYear}</td>
                                            <td className='custom-color-green-font'>{student.section}</td>
                                            <td className='custom-color-green-font'>{student.course}</td>
                                            <td>
                                                <select
                                                    className="form-select custom-color-green-font"
                                                    value={student.status}
                                                    onChange={(e) => handleStatusChange(student.itemNumber, e.target.value)} // Changed from student.id to student.itemNumber
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
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
