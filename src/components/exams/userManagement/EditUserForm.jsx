import { useState, useEffect } from "react";
import "./EditUserForm.css";

export default function EditUserForm({ centerCode, onClose }) {
  const [studentOptions, setStudentOptions] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [classYear, setClassYear] = useState("");
  const [classYearOptions, setClassYearOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);

  
  const [classDay, setClassDay] = useState("");
  const [gender, setGender] = useState("");
  const [parentEmail, setParentEmail] = useState("");

  // NEW: Student active/inactive status
  const [isActive, setIsActive] = useState(true);

  const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

  const CLASS_DAY_OPTIONS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const fetchClassYears = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/class-years-exam-module?center_code=${centerCode}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch class years");
      }

      const data = await response.json();

      setClassYearOptions(data);
    } catch (err) {
      console.error(err);
      alert("Unable to load class years");
    }
  };

  // Fetch all students for dropdown
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/students/by-center/${centerCode}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        setStudentOptions(data.students || []);
      } catch (err) {
        console.error(err);
        alert("Unable to fetch students");
      }
    };

    fetchStudents();
  }, []);

  // When a student is selected from dropdown,
  // populate the form
  useEffect(() => {
    if (!selectedStudentId) return;

    const student = studentOptions.find(
      (s) => s.student_id === selectedStudentId
    );

    if (student) {
      setId(student.id);

      setName(student.name);

      setClassName(student.class_name);

      setClassDay(student.class_day);

      setParentEmail(student.parent_email);

      setGender(student.gender || "");

      setClassYear(student.student_year || "");

      // NEW: Load student's current active status
      setIsActive(student.is_active ?? true);
    }
  }, [selectedStudentId, studentOptions]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/classes/${centerCode}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch classes");
        }

        const data = await response.json();

        setClassOptions(data);
      } catch (err) {
        console.error(err);
        alert("Unable to load classes");
      }
    };

    fetchClasses();
    fetchClassYears();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      id,
      student_id: selectedStudentId,
      name,
      class_name: className,
      student_year: classYear,
      class_day: classDay,
      parent_email: parentEmail,
      gender,

      // NEW
      is_active: isActive,
    };

    console.log("UPDATE STUDENT PAYLOAD:", payload);

    try {
      const response = await fetch(
        `${BACKEND_URL}/edit_student_exam_module`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update student");
      }

      alert("Student updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating student");
    }
  };

  return (
      <div className="edit-student-container">
        <button
          type="button"
          className="edit-student-back-button"
          onClick={onClose}
        >
          ← Back to User Management
        </button>

        <h2>Edit Student</h2>

      <form onSubmit={handleSubmit}>
        {/* Dropdown to select student by student_id */}
        <label>Select Student ID</label>

        <select
          value={selectedStudentId}
          onChange={(e) => setSelectedStudentId(e.target.value)}
          required
        >
          <option value="">-- Select Student --</option>

          {studentOptions.map((s) => (
            <option key={s.id} value={s.student_id}>
              {s.student_id} - {s.name}
            </option>
          ))}
        </select>

        {/* Non-editable ID from backend */}
        <label>ID</label>

        <input
          type="text"
          value={id}
          readOnly
        />

        <label>Name</label>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Class Name</label>

        <select
          value={className}
          onChange={(e) => {
            setClassName(e.target.value);
            setClassYear("");
          }}
          required
        >
          <option value="">
            -- Select Class --
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

        <label>Class Year</label>

        <select
          value={classYear}
          onChange={(e) => setClassYear(e.target.value)}
          required
        >
          <option value="">-- Select Year --</option>

          {classYearOptions
            .filter((year) => year.class_name === className)
            .map((year) => (
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
          <option value="">-- Select Day --</option>

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

        <label>Gender</label>

        <select
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          required
        >
          <option value="">-- Select Gender --</option>

          <option value="Male">
            Male
          </option>

          <option value="Female">
            Female
          </option>
        </select>

        {/* NEW: Active / Inactive */}
        <label>Student Status</label>

        <select
          value={isActive ? "true" : "false"}
          onChange={(e) => setIsActive(e.target.value === "true")}
          required
        >
          <option value="true">
            Active
          </option>

          <option value="false">
            Inactive
          </option>
        </select>

        <button type="submit">
          Update Student
        </button>
      </form>
    </div>
  );
}