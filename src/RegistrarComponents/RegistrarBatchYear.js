import React from 'react';

export default function RegistrarBatchYear({ selectedProgram }) {
  // 20 sample data for batch years and program codes (program name will be the selectedProgram)
  const batchData = [
    { year: '2010-2011', programCode: 'ENTR' },
    { year: '2011-2012', programCode: 'REM' },
    { year: '2012-2013', programCode: 'TOUR' },
    { year: '2013-2014', programCode: 'HOSP' },
    { year: '2014-2015', programCode: 'BKNC3' },
    { year: '2015-2016', programCode: 'FBSNC2' },
    { year: '2016-2017', programCode: 'HSKNC2' },
    { year: '2017-2018', programCode: 'BA' },
    { year: '2018-2019', programCode: 'CS' },
    { year: '2019-2020', programCode: 'IT' },
    { year: '2020-2021', programCode: 'BSA' },
    { year: '2021-2022', programCode: 'PSYCH' },
    { year: '2022-2023', programCode: 'BSN' },
    { year: '2023-2024', programCode: 'CRIM' },
    { year: '2024-2025', programCode: 'BSED' },
    { year: '2025-2026', programCode: 'ARCH' },
    { year: '2026-2027', programCode: 'CE' },
    { year: '2027-2028', programCode: 'EE' },
    { year: '2028-2029', programCode: 'ME' },
    { year: '2029-2030', programCode: 'IE' }
  ];

  return (
    <div className="container-fluid bg-white p-2 px-4 rounded">

      {/* Table for batch years with Program Name (selectedProgram), Program Code, and MOG/SOG buttons */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="table-responsive">
            <table className="table table-hover success-border">
              <thead className="table-success">
                <tr>
                  <th scope="col" className="custom-color-green-font custom-font">Program Name</th>
                  <th scope="col" className="custom-color-green-font custom-font">Batch Year</th>
                  <th scope="col" className="custom-color-green-font custom-font">Program Code</th>
                  <th scope="col" className="custom-color-green-font custom-font">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {batchData.map((data, index) => (
                  <tr key={index}>
                    <td className="fs-5 custom-color-green-font">{selectedProgram}</td>
                    <td className="fs-5 custom-color-green-font">{data.year}</td>
                    <td className="fs-5 custom-color-green-font">{data.programCode}</td>
                    <td>
                      <div className="d-flex">
                        <button className="btn btn-success me-2 w-50">
                          MOG
                        </button>
                        <button className="btn btn-success w-50">
                          SOG
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
