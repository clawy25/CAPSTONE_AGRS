import React, { useState, useEffect, useRef } from 'react';
import './Schedule.css'
import '../App.css'; 

export default function Schedule() {
  return (
    
            <section>
              <div className="card card-success border-success rounded">
                <table className="table">
                  <thead className="table-success">
                    <tr>
                      <th className="text-success custom-font">Course Code</th>
                      <th className="text-success custom-font">Course Desc</th>
                      <th className="text-success custom-font">Lecture Units</th>
                      <th className="text-success custom-font">Lab Units</th>
                      <th className="text-success custom-font">Schedule</th>
                      <th className="text-success custom-font">Professor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="custom-font">Introduction to Information Technology</td>
                      <td className="custom-font">BSIT 3-1</td>
                      <td className="custom-font">08:00 AM - 09:30 AM (Mon, Wed)</td>
                      <td className="custom-font">1.5</td>
                      <td className="custom-font">BSIT 3-1</td>
                      <td className="custom-font">08:00 AM - 09:30 AM (Mon, Wed)</td>
                     
                    </tr>
                    <tr>
                      <td className="custom-font">Computer Programming</td>
                      <td className="custom-font">BSIT 3-1</td>
                      <td className="custom-font">09:40 AM - 11:10 AM (Mon, Wed)</td>
                      <td className="custom-font">1.5</td>
                      <td className="custom-font">BSIT 3-1</td>
                      <td className="custom-font">08:00 AM - 09:30 AM (Mon, Wed)</td>
                    </tr>
                    <tr>
                      <td className="custom-font">Discrete Mathematics</td>
                      <td className="custom-font">BSIT 3-1</td>
                      <td className="custom-font">02:00 PM - 03:00 PM (Mon, Wed)</td>
                      <td className="custom-font">1.5</td>
                      <td className="custom-font">BSIT 3-1</td>
                      <td className="custom-font">08:00 AM - 09:30 AM (Mon, Wed)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
          </section>
  

       
  );
};


