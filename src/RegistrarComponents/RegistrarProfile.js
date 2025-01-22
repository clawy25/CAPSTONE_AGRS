import { useContext, useState, useEffect } from 'react';
import { Form, Table, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../Context/UserContext';
import PersonnelModel from '../ReactModels/PersonnelModel';
import AcademicYearModel from '../ReactModels/AcademicYearModel';

export default function RegistrarProfile() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [personnelInfo, setPersonnelInfo] = useState({});
    const [editablePersonnelInfo, setEditablePersonnelInfo] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    //On loading the page
    useEffect(() => {
        if (!user) {
            navigate('/'); // Redirect to login if user is not present
        }
    }, [user, navigate]);

    // Synchronize editablePersonnelInfo with personnelInfo
    useEffect(() => {
        setEditablePersonnelInfo(personnelInfo);
    }, [personnelInfo]);

    useEffect(() => {
        fetchPersonnelData();
    }, [user.personnelNumber]);

    const fetchPersonnelData = async () => {
        try {
            const academicYearData = await AcademicYearModel.fetchExistingAcademicYears();
            const currentAcademicYear = academicYearData.find((year) => year.isCurrent);

            if (!currentAcademicYear) {
                console.error("No current academic year found");
                return;
            }

            const personnelData = await PersonnelModel.getProfessorsbyProgram(user.programNumber, currentAcademicYear.academicYear);
            const findPersonnel = personnelData.find((personnel) => personnel.personnelNumber === user.personnelNumber);

            if (findPersonnel) {
                setPersonnelInfo(findPersonnel);
            } else {
                console.error("Cannot fetch the personnel data");
            }
        } catch (error) {
            console.error("Error in fetchPersonnelData:", error);
        }
    };

    const updatePersonnelData = async (personnelData) => {
        try {
          // Make the API call but ignore the response
          await PersonnelModel.updatePersonnel(user.personnelNumber, personnelData);
      
          console.log('Personnel data updated successfully.');
          
        } catch (error) {
          console.error('Error in updatePersonnelData:', error.message || error);
        }
      };
      
    
    const handleInputChange = (field, value) => {
        setEditablePersonnelInfo((prev) => ({
            ...prev,
            [field]: value,
        }));
    };
    const getUpdatedFields = () => {
        const { personnelContact, personnelEmail, personnelAddress } = editablePersonnelInfo;
        return { personnelContact, personnelEmail, personnelAddress };
    };
        
    const isUnchanged = JSON.stringify(personnelInfo) === JSON.stringify(editablePersonnelInfo);

    const validatePersonnelInfo = (personnelData) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10,15}$/;
    
        if (!emailRegex.test(personnelData.personnelEmail)) {
            alert("Please enter a valid email address.");
            return false;
        }
    
        if (!phoneRegex.test(personnelData.personnelContact)) {
            alert("Please enter a valid contact number (10-15 digits).");
            return false;
        }
    
        if (!personnelData.personnelAddress || personnelData.personnelAddress.trim() === "") {
            alert("Home address cannot be empty.");
            return false;
        }
    
        return true;
    };
    
    return (
        <Card className="bg-white rounded">
            <Card.Header className="bg-white">
                <p className="fs-5 fw-semibold my-2">
                    {user.personnelNameLast}, {user.personnelNameFirst} {user.personnelNameMiddle} ({user.personnelNumber})
                </p>
            </Card.Header>
            <Card.Body>
            <Table>
                <tbody>
                    <tr>
                        <td>Personnel Number</td>
                        <td className='fs-6 fw-semibold'>{user.personnelNumber}</td>
                    </tr>
                    <tr>
                        <td>Personnel Name</td>
                        <td className='fs-6 fw-semibold'>
                            {user.personnelNameFirst} {user.personnelNameMiddle} {user.personnelNameLast}
                        </td>
                    </tr>
                    <tr>
                        <td>Gender</td>
                        <td className='fs-6 fw-semibold'>{editablePersonnelInfo.personnelSex || '-'}</td>
                    </tr>
                    <tr>
                        <td>Date of Birth</td>
                        <td className='fs-6 fw-semibold'>{editablePersonnelInfo.personnelBirthDate || '-'}</td>
                    </tr>
                    <tr>
                        <td>Personnel Type</td>
                        <td className='fs-6 fw-semibold'>{editablePersonnelInfo.personnelType || '-'}</td>
                    </tr>
                    <tr>
                        <td>Mobile No.</td>
                        <td>
                            <Form.Control
                                type="number"
                                value={editablePersonnelInfo.personnelContact || ''}
                                onChange={(e) => handleInputChange('personnelContact', e.target.value)}
                                className='fs-6 fw-semibold'
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Email Address</td>
                        <td>
                            <Form.Control
                                type="email"
                                value={editablePersonnelInfo.personnelEmail || ''}
                                onChange={(e) => handleInputChange('personnelEmail', e.target.value)}
                                className='fs-6 fw-semibold'
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Home Address</td>
                        <td>
                            <Form.Control
                                type="text"
                                value={editablePersonnelInfo.personnelAddress || ''}
                                onChange={(e) => handleInputChange('personnelAddress', e.target.value)}
                                className='fs-6 fw-semibold'
                            />
                        </td>
                    </tr>
                </tbody>
            </Table>
            </Card.Body>
            <Card.Footer className="p-2 bg-white">
            <Button
                variant="success"
                disabled={isUnchanged}
                onClick={() => {
                    const updatedFields = getUpdatedFields();
                    if (validatePersonnelInfo(updatedFields)) {
                        updatePersonnelData(updatedFields);
                    }
                }}
            >
            {isSaving ? "Saving..." : "Save"}
            </Button>
            </Card.Footer>
        </Card>
    );
}
