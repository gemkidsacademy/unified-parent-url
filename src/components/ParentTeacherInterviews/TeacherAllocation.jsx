import { useState } from "react";
import "./TeacherAllocation.css";

const initialAllocations = [
  {
    teacher: "Mrs Sarah Johnson",
    className: "Selective",
    classYear: "Year 5",
    students: [
      { name: "Oliver Brown", parent: "Emma Brown" },
      { name: "Sophie Wilson", parent: "James Wilson" },
      { name: "Liam Taylor", parent: "Sarah Taylor" },
    ],
  },
];

const teacherOptions = [
  "Mrs Sarah Johnson",
  "Mrs Emily Williams",
  "Mr David Smith",
];

const classNameOptions = [
  "Selective",
  "OC",
  "Foundation",
  "NAPLAN",
];

const classYearOptions = ["Year 4", "Year 5", "Year 6"];

function TeacherAllocation() {
  const [allocations, setAllocations] = useState(initialAllocations);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedClassName, setSelectedClassName] = useState("");
  const [selectedClassYear, setSelectedClassYear] = useState("");
  const [expandedTeacher, setExpandedTeacher] = useState(null);

  const addAllocation = () => {
    if (!selectedTeacher || !selectedClassName || !selectedClassYear) return;

    const alreadyExists = allocations.some(
      (allocation) =>
        allocation.teacher === selectedTeacher ||
        allocation.className === selectedClassName ||
        allocation.classYear === selectedClassYear
    );

    if (alreadyExists) return;

    setAllocations((current) => [
      ...current,
      {
        teacher: selectedTeacher,
        className: selectedClassName,
        classYear: selectedClassYear,
        students: [
          {
            name: "Demo Student",
            parent: "Demo Parent",
          },
        ],
      },
    ]);

    setSelectedTeacher("");
    setSelectedClassName("");
    setSelectedClassYear("");
  };

  const toggleStudents = (teacher) => {
    setExpandedTeacher((current) =>
      current === teacher ? null : teacher
    );
  };

  return (
    <div className="teacher-allocation-page">

      <div className="teacher-allocation-intro">
        <span className="allocation-eyebrow">
          DEMO VIEW
        </span>

        <h2>Teacher Allocation</h2>

        <p>
          Assign teachers to classes. Active students and
          parents in the selected class will automatically
          be linked to that teacher.
        </p>
      </div>

      {/* Add allocation */}
      <section className="allocation-card">

        <div className="allocation-card-header">
          <div>
            <h3>Assign Teacher to Class</h3>
            <p>
              The teacher will automatically be linked to
              students and parents in this class.
            </p>
          </div>
        </div>

        <div className="allocation-form">

          <label>
            <span>Class Name</span>

            <select
              value={selectedClassName}
              onChange={(event) =>
                setSelectedClassName(event.target.value)
              }
            >
              <option value="">
                Select a class name
              </option>

              {classNameOptions.map((className) => (
                <option
                  key={className}
                  value={className}
                >
                  {className}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Class Year</span>

            <select
              value={selectedClassYear}
              onChange={(event) =>
                setSelectedClassYear(event.target.value)
              }
            >
              <option value="">
                Select a class year
              </option>

              {classYearOptions.map((classYear) => (
                <option key={classYear} value={classYear}>
                  {classYear}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Teacher</span>

            <select
              value={selectedTeacher}
              onChange={(event) =>
                setSelectedTeacher(event.target.value)
              }
            >
              <option value="">
                Select a teacher
              </option>

              {teacherOptions.map((teacher) => (
                <option key={teacher} value={teacher}>
                  {teacher}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="allocation-add-button"
            onClick={addAllocation}
            disabled={!selectedTeacher || !selectedClassName || !selectedClassYear}
          >
            + Assign Teacher
          </button>

        </div>
      </section>

      {/* Current allocations */}
      <section className="allocation-card">

        <div className="allocation-section-header">
          <div>
            <h3>Current Teacher Allocations</h3>
            <p>
              Students and parents are automatically linked
              through their class.
            </p>
          </div>

          <span className="allocation-count">
            {allocations.length} allocations
          </span>
        </div>

        <div className="allocation-table">

          <div className="allocation-table-header">
            <span>Teacher</span>
            <span>Class Name</span>
            <span>Class Year</span>
            <span>Students</span>
            <span>Parents</span>
            <span></span>
          </div>

          {allocations.map((allocation) => (
            <div key={allocation.teacher}>

              <div className="allocation-row">

                <strong>
                  {allocation.teacher}
                </strong>

                <span>
                  {allocation.className}
                </span>

                <span>
                  {allocation.classYear}
                </span>

                <span>
                  {allocation.students.length}
                </span>

                <span>
                  {allocation.students.length}
                </span>

                <button
                  type="button"
                  className="view-students-button"
                  onClick={() =>
                    toggleStudents(allocation.teacher)
                  }
                >
                  {expandedTeacher === allocation.teacher
                    ? "Hide Students"
                    : "View Students"}
                </button>

              </div>

              {expandedTeacher === allocation.teacher && (
                <div className="student-list">

                  <div className="student-list-header">
                    <span>Student</span>
                    <span>Parent</span>
                  </div>

                  {allocation.students.map((student) => (
                    <div
                      className="student-list-row"
                      key={student.name}
                    >
                      <span>{student.name}</span>
                      <span>{student.parent}</span>
                    </div>
                  ))}

                </div>
              )}

            </div>
          ))}

        </div>
      </section>

      {/* Automation explanation */}
      <section className="allocation-flow">

        <div className="flow-step">
          <strong>Teacher</strong>
          <span>Mrs Sarah Johnson</span>
        </div>

        <span className="flow-arrow">→</span>

        <div className="flow-step">
          <strong>Class</strong>
          <span>Selective · Year 5</span>
        </div>

        <span className="flow-arrow">→</span>

        <div className="flow-step">
          <strong>Students</strong>
          <span>Automatically linked</span>
        </div>

        <span className="flow-arrow">→</span>

        <div className="flow-step">
          <strong>Parents</strong>
          <span>Correct teacher link</span>
        </div>

      </section>

    </div>
  );
}

export default TeacherAllocation;