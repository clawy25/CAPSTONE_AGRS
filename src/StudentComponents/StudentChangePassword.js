import { useContext, useState } from "react";
import { Form, Button, Card, CardHeader, CardBody, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"; // Import necessary icons
import { UserContext } from "../Context/UserContext";
import StudentModel from "../ReactModels/StudentModel";

export default function StudentChangePassword() {
  const { user } = useContext(UserContext);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for toggling visibility

  // Function to handle the password change request
  const handlePasswordChange = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (!newPassword || !confirmPassword) {
      setError("Both fields are required.");
      setSuccess("");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setSuccess("");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      setSuccess("");
      return;
    }

    try {
      setIsSaving(true); // Indicate saving in progress
      await updateStudentData({ studentPassword: newPassword });
      setError("");
      setSuccess("Password changed successfully!");
      // Clear input fields after a successful update
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setError("Failed to update password. Please try again.");
      setSuccess("");
    } finally {
      setIsSaving(false); // Reset saving state
    }
  };

  const updateStudentData = async (data) => {
    try {
      console.log("Sending data to update student:", {
        studentNumber: user.studentNumber,
        ...data,
      });

      const response = await StudentModel.updateStudent(user.studentNumber, data);

      if (response && response.status === 204) {
        console.log("Student data updated successfully (no content returned).");
      } else {
        console.log("Student data updated successfully:", response?.data || "No additional data.");
      }
    } catch (error) {
      console.error("Error in updateStudentData:", error.response?.data || error.message || error);
      throw error; // Rethrow for the calling function to handle
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); // Toggle the password visibility
  };

  return (
    <Card>
      <CardHeader className="bg-white">
        <p className="fs-5 fw-semibold my-2">
          {user.studentNameLast}, {user.studentNameFirst} {user.studentNameMiddle} ({user.studentNumber})
        </p>
      </CardHeader>
      <CardBody>
        {/* Error and Success messages */}
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Form onSubmit={handlePasswordChange}>
          <Form.Group controlId="newPassword" className="mb-3">
            <Form.Label>New Password</Form.Label>
            <div className="input-group">
              <Form.Control
                type={showPassword ? "text" : "password"} // Toggle type between "text" and "password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={togglePasswordVisibility}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </Form.Group>

          <Form.Group controlId="confirmPassword" className="mb-3">
            <Form.Label>Confirm Password</Form.Label>
            <div className="input-group">
              <Form.Control
                type={showPassword ? "text" : "password"} // Toggle type between "text" and "password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={togglePasswordVisibility}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </Form.Group>

          <Button type="submit" variant="success" disabled={isSaving}>
            {isSaving ? "Changing Password..." : "Change Password"}
          </Button>
        </Form>
      </CardBody>
    </Card> 
  );
}
