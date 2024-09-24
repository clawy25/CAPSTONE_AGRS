import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';

export default function RegistrarGrades(){
    const navigate = useNavigate();
    return(
    
        <section  className="container-fluid">

            <div className='card card-success border-success rounded'>
            <table className="table">
              <thead className='table-success'>
                <tr>
                  <th className='text-success custom-font'>Code</th>
                  <th className='text-success custom-font'>Subject</th>
                  <th className='text-success custom-font'>Total Units</th>
                  <th className='text-success custom-font'>Grade</th>
                  <th className='text-success custom-font'>Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className='custom-font'>IT101</td>
                  <td className='custom-font'>Introduction to Information Technology</td>
                  <td className='custom-font'>3</td>
                  <td className='custom-font'>1.5</td>
                  <td className='custom-font'>P</td>
                </tr>
                <tr>
                  <td className='custom-font'>CS102</td>
                  <td className='custom-font'>Computer Programming</td>
                  <td className='custom-font'>3</td>
                  <td className='custom-font'>1.2</td>
                  <td className='custom-font'>P</td>
                </tr>
                <tr>
                  <td className='custom-font'>DM103</td>
                  <td className='custom-font'>Discrete Mathematics</td>
                  <td className='custom-font'>3</td>
                  <td className='custom-font'>1.0</td>
                  <td className='custom-font'>P</td>
                </tr>
                <tr>
                  <td className='custom-font'>DB104</td>
                  <td className='custom-font'>Database Systems</td>
                  <td className='custom-font'>3</td>
                  <td className='custom-font'>1.7</td>
                  <td className='custom-font'>P</td>
                </tr>
                <tr>
                  <td className='custom-font'>OS105</td>
                  <td className='custom-font'>Operating Systems</td>
                  <td className='custom-font'>3</td>
                  <td className='custom-font'>2.0</td>
                  <td className='custom-font'>P</td>
                </tr>
                <tr>
                  <td className='custom-font'>WN106</td>
                  <td className='custom-font'>Web Development</td>
                  <td className='custom-font'>3</td>
                  <td className='custom-font'>1.3</td>
                  <td className='custom-font'>P</td>
                </tr>
                <tr>
                  <td className='custom-font'>SE107</td>
                  <td className='custom-font'>Software Engineering</td>
                  <td className='custom-font'>3</td>
                  <td className='custom-font'>1.4</td>
                  <td className='custom-font'>P</td>
                </tr>
                <tr>
                  <td className='custom-font'>AE108</td>
                  <td className='custom-font'>Advanced Algorithms</td>
                  <td className='custom-font'>3</td>
                  <td className='custom-font'>1.6</td>
                  <td className='custom-font'>P</td>
                </tr>
              </tbody>
            </table>
        </div>
        
        </section>
    )
}