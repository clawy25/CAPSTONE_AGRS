import React, { useState, useEffect } from 'react';


{/* ATTENDANCE */}
export function calculatePLEAStatus(totalSessions, attendance1, attendance2) {
    // Multiply 100 by the sum of attendance1 and attendance2, divided by totalSessions
    const result = (100 / totalSessions) * (attendance1 + attendance2);

    // If the result is 0, return 50 (default value as per the formula logic)
    if (result === 0) {
        return 50;
    }

    // Otherwise, apply the formula and return the calculated status
    return (result / 100) * 50 + 50;
};


