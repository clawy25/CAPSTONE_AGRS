import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../StudentComponents/Dashboard.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function FacultySchedulePage(){
  
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('click', handleOutsideClick);
    } else {
      document.removeEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [showDropdown]);

  return (
      
          <section className="m-3">
            <div className='card card-success border-success rounded'>
              <table className="table">
                <thead className='table-success'>
                  <tr>
                    <th className='text-success custom-font'>Subject</th>
                    <th className='text-success custom-font'>Class</th>
                    <th className='text-success custom-font'>Time</th>
                    <th className='text-success custom-font'>Hours</th>
                  </tr>
                </thead>
                <tbody>
                <tr>
                  <td className='custom-font'>Introduction to Information Technology</td>
                  <td className='custom-font'>BSIT 3-1</td>
                  <td className='custom-font'>08:00 AM - 09:30 AM (Mon, Wed)</td>
                  <td className='custom-font'>1.5</td>
                </tr>
                <tr>
                  <td className='custom-font'>Computer Programming</td>
                  <td className='custom-font'>BSIT 3-1</td>
                  <td className='custom-font'>09:40 AM - 11:10 AM (Mon, Wed)</td>
                  <td className='custom-font'>1.5</td>
                </tr>
                <tr>
                  <td className='custom-font'>Discrete Mathematics</td>
                  <td className='custom-font'>BSIT 3-1</td>
                  <td className='custom-font'>02:00 PM - 03:00 PM (Mon, Wed)</td>
                  <td className='custom-font'>1.5</td>
                </tr>
                <tr>
                  <td className='custom-font'>Data Structures and Algorithm</td>
                  <td className='custom-font'>BSIT 3-1</td>
                  <td className='custom-font'>08:00 AM - 09:30 AM (Tue, Thu)</td>
                  <td className='custom-font'>1.5</td>
                </tr>
                <tr>
                  <td className='custom-font'>Web Development</td>
                  <td className='custom-font'>BSIT 3-1</td>
                  <td className='custom-font'>01:00 PM - 02:30 PM (Tue)</td>
                  <td className='custom-font'>1.5</td>
                </tr>
                <tr>
                  <td className='custom-font'>Object Oriented Programming</td>
                  <td className='custom-font'>BSIT 3-1</td>
                  <td className='custom-font'>08:00 AM - 11:00 AM (Fri)</td>
                  <td className='custom-font'>3</td>
                </tr>
                <tr>
                  <td className='custom-font'>Human Computer Interaction</td>
                  <td className='custom-font'>BSIT 3-1</td>
                  <td className='custom-font'>07:00 AM - 09:30 AM (Sat)</td>
                  <td className='custom-font'>2</td>
                </tr>
                <tr>
                  <td className='custom-font'>Network Administration</td>
                  <td className='custom-font'>BSIT 3-1</td>
                  <td className='custom-font'>01:00 PM - 02:30 PM (Wed, Fri)</td>
                  <td className='custom-font'>1.5</td>
                </tr>
                <tr>
                  <td className='custom-font'>People and the Earth's Ecosystem</td>
                  <td className='custom-font'>BSIT 3-1</td>
                  <td className='custom-font'>11:20 AM - 12:50 PM (Mon, Thu)</td>
                  <td className='custom-font'>1.5</td>
                </tr>
                <tr>
                  <td className='custom-font'>Database Administration</td>
                  <td className='custom-font'>BSIT 3-1</td>
                  <td className='custom-font'>02:40 PM - 04:10 PM (Tue, Thu)</td>
                  <td className='custom-font'>1.5</td>
                </tr>
                <tr>
                  <td className='custom-font'>Multimedia</td>
                  <td className='custom-font'>BSIT 3-1</td>
                  <td className='custom-font'>08:00 AM - 11:00 AM (Fri)</td>
                  <td className='custom-font'>3</td>
                </tr>

                </tbody>
              </table>
            </div>
          </section>
       
  );
};

