import {useContext, useState, useEffect} from 'react';
import { Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../Context/UserContext';
import PersonnelModel from '../ReactModels/PersonnelModel';
import AcademicYearModel from '../ReactModels/AcademicYearModel';


export default function RegistrarProfile(){

    const {user} = useContext(UserContext);
    const [personnelInfo, setPersonnelInfo] = useState([]);

    const fetchPersonnelData = async () => {
        try {
            // Fetch all academic years
            const academicYearData = await AcademicYearModel.fetchExistingAcademicYears();
            console.log("Academic years:", academicYearData);
    
            // Find the current academic year
            const currentAcademicYear = academicYearData.find(year => year.isCurrent);
            if (!currentAcademicYear) {
                console.error("No current academic year found");
                return;
            }
            console.log("Current academic year:", currentAcademicYear.academicYear);
    
            // Fetch personnel data using programNumber and current academic year
            const personnelData = await PersonnelModel.getProfessorsbyProgram(user.programNumber, currentAcademicYear.academicYear);
            console.log("Personnel data:", personnelData);

            const findPersonnel = personnelData.find(personnel => personnel.personnelNumber === user.personnelNumber);
            console.log("Personnel matched",findPersonnel)
    
            if (findPersonnel) {
                setPersonnelInfo(findPersonnel);
            } else {
                console.error("Cannot fetch the personnel data");
            }


        } catch (error) {
            console.error("Error in fetchPersonnelData:", error);
        }
    };
    

    useEffect(() => {
        fetchPersonnelData()
    }, [user.personnelNumber]) 

    
    return(
        <div className="card bg-white rounded">
            <div className="card-header bg-white">
                <p className="fs-5 fw-semibold my-2">{user.personnelNameLast}, {user.personnelNameFirst} {user.personnelNameMiddle} ({user.personnelNumber})</p>
            </div>
            <div className="card-body">
                <div className="row d-flex justify-content-center align-items-center">
                    <div className="col">
                        <p className="fs-6">Personnel Number: </p>
                        <p className="fs-6">Personnel Name: </p>
                        <p className="fs-6">Gender: </p>
                        <p className="fs-6">Date of Birth: </p>                    
                    </div>
                    <div className="col">
                        <p className="fs-6 mb-2 fw-semibold">{user.personnelNumber}</p>
                        <p className="fs-6 mb-3 fw-semibold">{user.personnelNameFirst} {user.personnelNameMiddle} {user.personnelNameLast}</p>
                        <p className="fs-6 mb-2 fw-semibold">{personnelInfo.personnelSex}</p>
                        <p className="fs-6 mb-2 fw-semibold">{personnelInfo.personnelBirthDate}</p>
                    </div>
                    <div className="col">
                        <p className="fs-6">Personnel Type: </p>
                        <p className="fs-6">Mobile No.: </p>
                        <p className="fs-6">Email Address: </p>
                        <p className="fs-6">Home Address: </p>
                    </div>
                    <div className="col">
                        <p className="fs-6 mb-3 fw-semibold">{personnelInfo.personnelType}</p>
                        <input 
                            type="text" 
                            className="fs-6 mb-3 fw-semibold" 
                            value={personnelInfo.personnelContact || ''} 
                            readOnly
                        />
                        <input 
                            type="text" 
                            className="fs-6 mb-3 fw-semibold d-block" 
                            value={personnelInfo.personnelEmail || ''} 
                            readOnly
                        />
                        <input 
                            type="text" 
                            className="fs-6 mb-2 fw-semibold" 
                            value={personnelInfo.personnelAddress || ''} 
                            readOnly
                        />
                    </div>
                </div>
            </div>
            <div className="card-footer p-2 bg-white">
                <button className="btn btn-success">Save</button>
            </div>
        </div>

    )
}