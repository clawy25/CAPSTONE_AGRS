export default class CourseModel {
    constructor(id, courseCode, courseDescriptiveTitle, courseLecture, courseLaboratory, coursePreRequisite, courseUnits) {
      this.id = id;
      this.courseCode = courseCode;
      this.courseDescriptiveTitle = courseDescriptiveTitle;
      this.courseLecture = courseLecture;
      this.courseLaboratory = courseLaboratory;
      this.coursePreRequisite = coursePreRequisite;
      this.courseUnits = courseUnits;
    }
  
    // Fetch all courses
    static async fetchExistingCourses() {
      try {
        const response = await fetch('http://localhost:5000/course');
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
          course.courseUnits
        ));
      } catch (error) {
        console.error('Error fetching courses:', error);
        throw error;
      }
    }
  
    // Create and insert a new course
    static async createAndInsertCourse(courseCode, courseDescriptiveTitle, courseLecture, courseLaboratory, coursePreRequisite, courseUnits) {
      const courseData = {
        courseCode,
        courseDescriptiveTitle,
        courseLecture,
        courseLaboratory,
        coursePreRequisite,
        courseUnits
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
            data.courseUnits
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
  