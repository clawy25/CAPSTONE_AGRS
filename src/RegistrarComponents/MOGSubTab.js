import React, { useState } from 'react';
import { Tab, Tabs, Table, Button } from 'react-bootstrap';
import '../App.css'

export default function MOGSubTab() {

  // State variables for toggling button states for each year
  const [firstYearFirstSemToggled, setFirstYearFirstSemToggled] = useState(false);
  const renderTable = () => (
    <Table hover className="table table-hover success-border">
      <thead className="table-success">
        <tr>
          <th className='custom-color-green-font custom-font'>Subjects</th>
          <th className='custom-color-green-font custom-font'>Professor</th>
          <th className='custom-color-green-font custom-font'>Class Record Link</th>
          <th className='custom-color-green-font custom-font'>Grade Sheet Link</th>
          <th className='custom-color-green-font custom-font'>SoG Link</th>
        </tr>
      </thead>
      <tbody className='bg-white'>
        {[
          { subject: 'Mathematics 101', professor: 'Prof. Smith', classRecord: '#', gradeSheet: '#', sog: '#' },
          { subject: 'English 101', professor: 'Prof. Johnson', classRecord: '#', gradeSheet: '#', sog: '#' },
          { subject: 'Computer Science 101', professor: 'Prof. Williams', classRecord: '#', gradeSheet: '#', sog: '#' },
          { subject: 'Physics 101', professor: 'Prof. Brown', classRecord: '#', gradeSheet: '#', sog: '#' },
          { subject: 'Chemistry 101', professor: 'Prof. Davis', classRecord: '#', gradeSheet: '#', sog: '#' },
          { subject: 'History 101', professor: 'Prof. Wilson', classRecord: '#', gradeSheet: '#', sog: '#' },
          { subject: 'Biology 101', professor: 'Prof. Garcia', classRecord: '#', gradeSheet: '#', sog: '#' },
          { subject: 'Philosophy 101', professor: 'Prof. Martinez', classRecord: '#', gradeSheet: '#', sog: '#' },
          { subject: 'Statistics 101', professor: 'Prof. Rodriguez', classRecord: '#', gradeSheet: '#', sog: '#' },
          { subject: 'Economics 101', professor: 'Prof. Hernandez', classRecord: '#', gradeSheet: '#', sog: '#' }
        ].map((entry, index) => (
          <tr key={index}>
            <td>{entry.subject}</td>
            <td>{entry.professor}</td>
            <td><a href={entry.classRecord} className='custom-color-green-font custom-font'>Class Record</a></td>
            <td><a href={entry.gradeSheet} className='custom-color-green-font custom-font'>Grade Sheet</a></td>
            <td><a href={entry.sog} className='custom-color-green-font custom-font'>SoG</a></td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  return (
   
    <div className='container-fluid bg-white p-2 px-4 rounded'>

      
<Button
                variant={firstYearFirstSemToggled ? 'success' : 'secondary'}
                onClick={() => setFirstYearFirstSemToggled(!firstYearFirstSemToggled)}
                style={{ width: '100%', marginBottom: '20px' }}
              >
                {firstYearFirstSemToggled ? 'MOG' : 'MOG'}
              </Button>

<Tabs defaultActiveKey="1st" id="year-tabs" className="mb-3">
        {/* First Year Tab */}
        <Tab eventKey="1st" title={<span className="custom-color-green-font custom-font">First Year</span>}>
          <Tabs className="mb-3">
            <Tab eventKey="1A" title={<span className="custom-color-green-font custom-font">1A</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="1B" title={<span className="custom-color-green-font custom-font">1B</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="1C" title={<span className="custom-color-green-font custom-font">1C</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="1D" title={<span className="custom-color-green-font custom-font">1D</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="1E" title={<span className="custom-color-green-font custom-font">1E</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="1F" title={<span className="custom-color-green-font custom-font">1F</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="1G" title={<span className="custom-color-green-font custom-font">1G</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="1H" title={<span className="custom-color-green-font custom-font">1H</span>}>
              {renderTable()}
            </Tab>
          </Tabs>
        </Tab>

        {/* Second Year Tab */}
        <Tab eventKey="2nd" title={<span className="custom-color-green-font custom-font">Second Year</span>}>
          <Tabs className="mb-3">
            <Tab eventKey="2A" title={<span className="custom-color-green-font custom-font">2A</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="2B" title={<span className="custom-color-green-font custom-font">2B</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="2C" title={<span className="custom-color-green-font custom-font">2C</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="2D" title={<span className="custom-color-green-font custom-font">2D</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="2E" title={<span className="custom-color-green-font custom-font">2E</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="2F" title={<span className="custom-color-green-font custom-font">2F</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="2G" title={<span className="custom-color-green-font custom-font">2G</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="2H" title={<span className="custom-color-green-font custom-font">2H</span>}>
              {renderTable()}
            </Tab>
          </Tabs>
        </Tab>

        {/* Third Year Tab */}
        <Tab eventKey="3rd" title={<span className="custom-color-green-font custom-font">Third Year</span>}>
          <Tabs className="mb-3">
            <Tab eventKey="3A" title={<span className="custom-color-green-font custom-font">3A</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="3B" title={<span className="custom-color-green-font custom-font">3B</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="3C" title={<span className="custom-color-green-font custom-font">3C</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="3D" title={<span className="custom-color-green-font custom-font">3D</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="3E" title={<span className="custom-color-green-font custom-font">3E</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="3F" title={<span className="custom-color-green-font custom-font">3F</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="3G" title={<span className="custom-color-green-font custom-font">3G</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="3H" title={<span className="custom-color-green-font custom-font">3H</span>}>
              {renderTable()}
            </Tab>
          </Tabs>
        </Tab>

        {/* Fourth Year Tab */}
        <Tab eventKey="4th" title={<span className="custom-color-green-font custom-font">Fourth Year</span>}>
          <Tabs className="mb-3">
            <Tab eventKey="4A" title={<span className="custom-color-green-font custom-font">4A</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="4B" title={<span className="custom-color-green-font custom-font">4B</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="4C" title={<span className="custom-color-green-font custom-font">4C</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="4D" title={<span className="custom-color-green-font custom-font">4D</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="4E" title={<span className="custom-color-green-font custom-font">4E</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="4F" title={<span className="custom-color-green-font custom-font">4F</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="4G" title={<span className="custom-color-green-font custom-font">4G</span>}>
              {renderTable()}
            </Tab>
            <Tab eventKey="4H" title={<span className="custom-color-green-font custom-font">4H</span>}>
              {renderTable()}
            </Tab>
            
          </Tabs>
        </Tab>
      </Tabs>
    </div>
 
  );
}
