import React, { useEffect, useState } from "react";
import "./DeleteUserExamAttempt.css";

const DeleteUserExamAttempt = ({ onClose, centerCode }) => {
  const [studentsList, setStudentsList] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedClassType, setSelectedClassType] = useState("");
  const [examOptionsList, setExamOptionsList] = useState([]);
  const [selectedExamType, setSelectedExamType] = useState("");

  const BACKEND_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  const formatExamLabel = (exam) => {
    return exam
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  /* ============================
     FETCH STUDENTS
  ============================ */

  const fetchStudentsFromBackend = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/students/by-center/${encodeURIComponent(centerCode)}`
      );

      const data = await response.json();

      setStudentsList(data.students || []);
    } catch (error) {
      console.error("❌ Failed to fetch students", error);
    }
  };

  useEffect(() => {
    if (centerCode) {
      fetchStudentsFromBackend();
    }
  }, [centerCode]);

  /* ============================
     HANDLE STUDENT CHANGE
  ============================ */

  const handleStudentChange = (event) => {
    const studentId = event.target.value;

    const matchedStudent = studentsList.find(
      (studentItem) =>
        String(studentItem.student_id) === String(studentId)
    );

    setSelectedStudentId(studentId);
    setSelectedExamType("");

    setSelectedClassType(matchedStudent?.class_name || "");

    updateExamOptionsBasedOnClass(matchedStudent?.class_name);
  };

  /* ============================
     SET EXAM OPTIONS
  ============================ */

  const updateExamOptionsBasedOnClass = (classType) => {
    const normalizedClassType = classType?.toLowerCase();

    if (
      normalizedClassType === "selective" ||
      normalizedClassType === "oc"
    ) {
      setExamOptionsList([
        "thinking_skills",
        "mathematical_reasoning",
        "reading",
        "writing",
      ]);
    } else if (normalizedClassType === "naplan") {
      setExamOptionsList([
        "numeracy",
        "language_conventions",
        "reading",
        "writing",
      ]);
    } else {
      setExamOptionsList([]);
    }

    setSelectedExamType("");
  };

  /* ============================
     DELETE HOMEWORK ATTEMPT
  ============================ */

  const handleDeleteHomeworkAttemptClick = async () => {
    try {
      console.log({
        exam: selectedClassType.toLowerCase(),
        mode: "homework",
        subject: selectedExamType,
        student_id: selectedStudentId,
      });

      const response = await fetch(
        `${BACKEND_URL}/api/admin/delete-exam-attempt-2`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            exam: selectedClassType.toLowerCase(),
            mode: "homework",
            subject: selectedExamType,
            student_id: selectedStudentId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          `❌ ${data.detail || "Failed to delete homework attempt"}`
        );
        return;
      }

      alert(
        `✅ ${
          data.message || "Homework attempt deleted successfully."
        }`
      );

      onClose();
    } catch (error) {
      console.error("❌ Delete failed", error);
      alert("❌ Network error. Please try again.");
    }
  };

  /* ============================
     DELETE EXAM ATTEMPT
  ============================ */

  const handleDeleteExamAttemptClick = async () => {
    try {
      console.log({
        student_id: selectedStudentId,
        exam_type: selectedExamType,
        class_name: selectedClassType,
      });

      const response = await fetch(
        `${BACKEND_URL}/api/admin/delete-exam-attempt-2`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_id: selectedStudentId,
            exam: selectedClassType.toLowerCase(),
            mode: "exam",
            subject: selectedExamType,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          `❌ ${data.detail || "Failed to delete exam attempt"}`
        );
        return;
      }

      alert(`✅ ${data.message || "Exam attempt deleted"}`);

      onClose();
    } catch (error) {
      console.error("❌ Delete failed", error);
      alert("❌ Network error. Please try again.");
    }
  };

  return (
    <div className="modal">
      <button
        type="button"
        className="delete-attempt-back-button"
        onClick={onClose}
      >
        ← Back to User Management
      </button>

      <h2>Delete User Exam Attempt</h2>

      {/* ============================
          STUDENT DROPDOWN
      ============================ */}

      <label>Student</label>

      <select
        value={selectedStudentId}
        onChange={handleStudentChange}
      >
        <option value="">Select Student</option>

        {studentsList.map((studentItem) => (
          <option
            key={studentItem.id}
            value={studentItem.student_id}
          >
            {studentItem.name}
          </option>
        ))}
      </select>

      {/* ============================
          STUDENT ID FIELD
      ============================ */}

      <label>Student ID</label>

      <input
        type="text"
        value={selectedStudentId}
        readOnly
      />

      {/* ============================
          CLASS TYPE
      ============================ */}

      <label>Class</label>

      <input
        type="text"
        value={selectedClassType}
        readOnly
      />

      {/* ============================
          EXAM DROPDOWN
      ============================ */}

      <label>Exam</label>

      <select
        value={selectedExamType}
        onChange={(e) => setSelectedExamType(e.target.value)}
      >
        <option value="">Select Exam</option>

        {examOptionsList.map((examItem) => (
          <option
            key={examItem}
            value={examItem}
          >
            {formatExamLabel(examItem)}
          </option>
        ))}
      </select>

      {/* ============================
          ACTION BUTTONS
      ============================ */}

      <div className="button-group">
        <button
          className="danger-btn"
          onClick={handleDeleteExamAttemptClick}
        >
          Delete Exam Attempt
        </button>

        <button
          className="danger-btn"
          onClick={handleDeleteHomeworkAttemptClick}
        >
          Delete Homework Attempt
        </button>

        <button
          className="cancel-btn"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DeleteUserExamAttempt;