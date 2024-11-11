export default class CourseModel {
    constructor(id, courseCode, courseDescriptiveTitle, courseLecture, 
                courseLaboratory, coursePreRequisite,
                programNumber,courseYearLevel, courseSemester, isBridgingCourse,
                academicYear) {
      this.id = id;
      this.courseCode = courseCode;
      this.courseDescriptiveTitle = courseDescriptiveTitle;
      this.courseLecture = courseLecture;
      this.courseLaboratory = courseLaboratory;
      this.coursePreRequisite = coursePreRequisite;
      this.programNumber = programNumber;
      this.courseYearLevel = courseYearLevel;
      this.courseSemester = courseSemester;
      this.isBridgingCourse = isBridgingCourse;
      this.academicYear = academicYear;
    }

    // Fetch all courses by Program
    static async fetchAllCourses() {
      try {
        const response = await fetch('http://localhost:5000/courses');
        if (!response.ok) {
          throw new Error('Error fetching courses');
        }
        const data = await response.json();

        
        return data;
      } catch (error) {
        console.error('Error fetching courses:', error);
        throw error;
      }
    }
    // Fetch all courses by Program
    static async getCoursesbyProgram(academicYear, yearLevel, semester, programNumber) {
      try {
        const response = await fetch('http://localhost:5000/course/byProgram', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ academicYear, yearLevel, semester, programNumber }), // Send credentials
        });
        if (!response.ok) {
          throw new Error('Error fetching courses');
        }
        const data = await response.json();
  
        // Assuming data is an array of course objects
        return data;
      } catch (error) {
        console.error('Error fetching courses:', error);
        throw error;
      }
    }
  
    // Create and insert a new course
    static async createAndInsertCourse(newCourse) {
  
      try {
        const response = await fetch('http://localhost:5000/course/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: [newCourse] }), // Send data as an array
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
  
    static async updateCourse(updatedCourse) {
      try {
          const response = await fetch(`http://localhost:5000/course/update`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ data: updatedCourse }), // Send as an object
          });
  
          if (!response.ok) {
              throw new Error(`Error updating course data: ${response.statusText}`);
          }
  
          const data = await response.json();
          return data;
  
      } catch (error) {
          console.error('Error updating course:', error);
          throw error;
      }
    }

    
    static async deleteCourse(selectedCourse) {
      try {
        const response = await fetch(`http://localhost:5000/course/delete`, {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: selectedCourse }), // Send as an object
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
  