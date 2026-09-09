import { useState, useEffect } from "react";
import "./AddStudentForm.css";
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";


export default function AddStudentForm({ centerCode, onClose }) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";  
  const [id, setId] = useState(""); // Non-editable ID from backend
  const [studentId, setStudentId] = useState(""); // Editable Student ID entered by admin
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [className, setClassName] = useState("");
  const [classDay, setClassDay] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [classOptions, setClassOptions] = useState([]);
  const [studentYearOptions, setStudentYearOptions] = useState([]);
  const [studentYear, setStudentYear] = useState("");
  const fetchClassYears = async (selectedClassName) => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/class-years-exam-module?center_code=${centerCode}&class_name=${encodeURIComponent(selectedClassName)}`
    );

    if (!response.ok) {
      throw new Error("Failed to load class years");
    }

    const data = await response.json();

    setStudentYearOptions(data);

  } catch (err) {
    console.error("Error fetching class years:", err);
    alert("Unable to load class years.");
  }
};
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  

const CLASS_DAY_OPTIONS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const GENDER_OPTIONS = [
  "Male",
  "Female",
  "Other",
];


  useEffect(() => {
  const fetchClasses = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/classes/${centerCode}`
      );

      if (!response.ok) {
        throw new Error("Failed to load classes");
      }

      const data = await response.json();
      setClassOptions(data);
    } catch (err) {
      console.error("Error fetching classes:", err);
      alert("Unable to load classes.");
    }
  };

  if (centerCode) {
    fetchClasses();
  }
}, [centerCode]);


  useEffect(() => {
  const fetchNextId = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/get_next_user_id_exam_module`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Assuming backend returns { next_id: "Gem001" }
      const backendId = data.next_id || data;
      setId(backendId);

    } catch (err) {
      console.error("Error fetching next user ID:", err);
      alert("Unable to fetch next user ID");
    }
  };

  fetchNextId();
}, []);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (isSubmitting) return;

  const payload = {
    id,
    student_id: studentId,
    name,
    gender,
    student_year: studentYear,
    class_name: className,
    class_day: classDay,
    parent_email: parentEmail,
    center_code: centerCode,
  };

  try {
    setIsSubmitting(true);

    const response = await fetch(
      `${API_BASE}/add_student_exam_module`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) throw new Error("Failed to add student");

    alert("Student added successfully!");

    // Reset form
    setStudentId("");
    setName("");
    setGender("");
    setClassName("");
    setClassDay("");
    setParentEmail("");
    setStudentYear("");
  } catch (err) {
    console.error(err);
    alert("Error adding student");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="add-student-container">
      <div className="add-student-header">
        <button
          type="button"
          className="add-student-back-button"
          onClick={onClose}
        >
          ← Back to User Management
        </button>

        <h2>Add New Student</h2>
        <p>Add a new student to the exam module.</p>
      </div>
      <form onSubmit={handleSubmit}>
        {/* Non-editable ID from backend */}
        <label>ID</label>
        <input type="text" value={id} readOnly />

        {/* Editable Student ID entered by admin */}
        <label>Student ID</label>
        <input
          type="text"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
        />

        <label>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <label>Gender</label>

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          required
        >
          <option value="">
            Select gender
          </option>

          {GENDER_OPTIONS.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

        <label>Class Name</label>
          <select
            value={className}
            onChange={(e) => {
              const selectedClass = e.target.value;
              setClassName(selectedClass);
              setStudentYear(""); // reset previous selection
              fetchClassYears(selectedClass);
            }}
            required
          >
            <option value="">
              Select class
            </option>

            {classOptions.map((cls) => (
              <option
                key={cls.id}
                value={cls.class_name}
              >
                {cls.class_name}
              </option>
            ))}
          </select>
        <label>Student Year</label>
          <select
            value={studentYear}
            onChange={(e) => setStudentYear(e.target.value)}
            required
          >
            <option value="">Select year</option>
            {studentYearOptions.map((year) => (
              <option
                key={year.id}
                value={year.year_name}
              >
                {year.year_name}
              </option>
            ))}
          </select>

        <label>Class Day</label>
          <select
            value={classDay}
            onChange={(e) => setClassDay(e.target.value)}
            required
          >
            <option value="">Select day</option>
            {CLASS_DAY_OPTIONS.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>

        <label>Parent Email</label>
        <input
          type="email"
          value={parentEmail}
          onChange={(e) => setParentEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className={isSubmitting ? "submit-btn disabled" : "submit-btn"}
        >
          {isSubmitting ? "Adding Student..." : "Add Student"}
        </button>
      </form>
    </div>
  );
}
