export default class CourseModel {
    constructor(id, courseCode, courseDescriptiveTitle, courseLecture, 
                courseLaboratory, coursePreRequisite, courseUnits,
                programNumber,courseYearLevel, courseSemester, isBridgingCourse,
                academicYear) {
      this.id = id;
      this.courseCode = courseCode;
      this.courseDescriptiveTitle = courseDescriptiveTitle;
      this.courseLecture = courseLecture;
      this.courseLaboratory = courseLaboratory;
      this.coursePreRequisite = coursePreRequisite;
      this.courseUnits = courseUnits;
      this.programNumber = programNumber;
      this.courseYearLevel = courseYearLevel;
      this.courseSemester = courseSemester;
      this.isBridgingCourse = isBridgingCourse;
      this.academicYear = academicYear;
    }
  
    // Fetch all courses
    static async getCoursesbyProgram(programNumber, currentAcadYear) {
      try {
        const response = await fetch('http://localhost:5000/course/byProgram', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ programNumber, currentAcadYear }), // Send credentials
        });
        if (!response.ok) {
          throw new Error('Error fetching courses');
        }
        const data = await response.json();
  
        // Assuming data is an array of course objects
        return data.map(course => new CourseModel(
          course.id,
          course.courseCode,
          course.courseDescriptiveTitle,
          course.courseLecture,
          course.courseLaboratory,
          course.coursePreRequisite,
          course.courseUnits,
          course.courseYearLevel,
          course.courseSemester,
          course.isBridgingCourse,
          course.academicYear
        ));
      } catch (error) {
        console.error('Error fetching courses:', error);
        throw error;
      }
    }
  
    // Create and insert a new course
    static async createAndInsertCourse(courseCode, courseDescriptiveTitle, courseLecture,
      courseLaboratory, coursePreRequisite, courseUnits, programNumber, courseYearLevel, 
      courseSemester, isBridgingCourse) {
        
      const courseData = {
        courseCode,
        courseDescriptiveTitle,
        courseLecture,
        courseLaboratory,
        coursePreRequisite,
        courseUnits,
        programNumber,
        courseYearLevel,
        courseSemester,
        isBridgingCourse,
        academicYear: sessionStorage.getItem('currentAcadYear')
      };
  
      try {
        const response = await fetch('http://localhost:5000/course/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: [courseData] }), // Send data as an array
        });
  
        if (!response.ok) {
          throw new Error('Error creating course');
        }
  
        const data = await response.json();
        return data; // Return the response or any necessary data
      } catch (error) {
        console.error('Error creating course:', error);
        throw error;
      }
    }
  
    static async updateCourse(id, updatedData) {
        try {
          const response = await fetch(`http://localhost:5000/course/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
          });
    
          if (!response.ok) {
            throw new Error('Error updating course data');
          }
    
          const data = await response.json();
          return new CourseModel(
            data.id,
            data.courseCode,
            data.courseDescriptiveTitle,
            data.courseLecture,
            data.courseLaboratory,
            data.coursePreRequisite,
            data.courseUnits,
            data.programNumber,
            data.academicYear
          ); // Return an updated CourseModel instance
        } catch (error) {
          console.error('Error updating course:', error);
          throw error;
        }
    }
    
      // Delete course by `id`
      static async deleteCourse(id) {
        try {
          const response = await fetch(`http://localhost:5000/course/${id}`, {
            method: 'DELETE',
          });
    
          if (!response.ok) {
            throw new Error('Error deleting course');
          }
    
          const data = await response.json();
          return data; // Return response or success message
        } catch (error) {
          console.error('Error deleting course:', error);
          throw error;
        }
      }
  
  }
  