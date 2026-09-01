import { useEffect, useState } from "react";
import "./TeacherAllocation.css";
import { API_BASE_URL } from "../../config/api";

function TeacherAllocation() {
  const interviewAdmin = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("interviewAdminData") || "null"
      ) || {};
    } catch {
      return {};
    }
  })();
  const [allocations, setAllocations] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [classYearOptions, setClassYearOptions] = useState([]);
  const [classDayOptions, setClassDayOptions] = useState([]);
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedClassName, setSelectedClassName] = useState("");
  const [selectedClassYear, setSelectedClassYear] = useState("");
  const [selectedClassDay, setSelectedClassDay] = useState("");
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [allocationMessage, setAllocationMessage] = useState("");

  useEffect(() => {
    const loadClasses = async () => {
      const response = await fetch(
        `${API_BASE_URL}/parent-teacher-interview/classes?center_code=${encodeURIComponent(interviewAdmin.center_code || "")}`
      );
      const data = await response.json();
      setClassOptions(data.classes || []);
    };

    loadClasses();
  }, []);

  const loadAllocations = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/parent-teacher-interview/teacher-allocations?center_code=${encodeURIComponent(interviewAdmin.center_code || "")}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to load teacher allocations."
        );
      }

      setAllocations(
        (data.allocations || []).map((allocation) => ({
          id: allocation.id,
          teacherId: allocation.teacher_id,
          classId: allocation.class_id,
          classYearId: allocation.class_year_id,
          teacher: allocation.teacher_name,
          className: allocation.class_name,
          classYear: allocation.class_year,
          classDay: allocation.class_day,
          parentCount: allocation.parent_count,
        }))
      );
    } catch (error) {
      console.error("Failed to load teacher allocations:", error);
      setAllocations([]);
    }
  };

  useEffect(() => {
    const loadInitialAllocations = async () => {
      await loadAllocations();
    };

    loadInitialAllocations();
  }, []);

  useEffect(() => {
    if (!selectedClassName) {
      setClassYearOptions([]);
      return;
    }

    const loadClassYears = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/parent-teacher-interview/class-years?center_code=${encodeURIComponent(interviewAdmin.center_code || "")}&class_name=${encodeURIComponent(selectedClassName)}`
        );
        const data = await response.json();
        setClassYearOptions(data.class_years || []);
      } catch (error) {
        console.error("Failed to load class years:", error);
        setClassYearOptions([]);
      }
    };

    loadClassYears();
  }, [selectedClassName]);

  useEffect(() => {
    if (!editingAllocation || classYearOptions.length === 0) {
      return;
    }

    const matchingClassYear = classYearOptions.find(
      (classYear) =>
        Number(classYear.id) === Number(editingAllocation.classYearId)
    );

    if (matchingClassYear) {
      setSelectedClassYear(matchingClassYear.year_name);
    }
  }, [editingAllocation, classYearOptions]);

  useEffect(() => {
    if (
      !interviewAdmin.center_code ||
      !selectedClassName ||
      !selectedClassYear
    ) {
      return;
    }

    const loadClassDays = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/parent-teacher-interview/class-days?center_code=${encodeURIComponent(interviewAdmin.center_code)}&class_name=${encodeURIComponent(selectedClassName)}&class_year=${encodeURIComponent(selectedClassYear)}`
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            typeof data?.detail === "string"
              ? data.detail
              : "Unable to load class days."
          );
        }

        setClassDayOptions(
          (data.class_days || []).filter(Boolean)
        );
      } catch (error) {
        console.error("Failed to load class days:", error);
        setClassDayOptions([]);
      }
    };

    loadClassDays();
  }, [interviewAdmin.center_code, selectedClassName, selectedClassYear]);

  useEffect(() => {
    const loadTeachers = async () => {
      const response = await fetch(
        `${API_BASE_URL}/parent-teacher-interview/teachers?center_code=${encodeURIComponent(interviewAdmin.center_code || "")}`
      );
      const data = await response.json();
      setTeacherOptions(data.teachers || []);
    };

    loadTeachers();
  }, []);

  const deleteAllocation = async (allocationId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/parent-teacher-interview/teacher-allocations/${allocationId}?center_code=${encodeURIComponent(interviewAdmin.center_code || "")}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to delete teacher allocation."
        );
      }

      setAllocations((current) =>
        current.filter((allocation) => allocation.id !== allocationId)
      );

      if (editingAllocation?.id === allocationId) {
        setEditingAllocation(null);
        setSelectedTeacher("");
        setSelectedClassName("");
        setSelectedClassYear("");
        setSelectedClassDay("");
        setClassDayOptions([]);
      }
    } catch (error) {
      console.error("Failed to delete teacher allocation:", error);
      window.alert(
        error.message || "Failed to delete teacher allocation."
      );
    }
  };

    const addAllocation = async () => {
    setAllocationMessage("");

    if (
      !selectedTeacher ||
      !selectedClassName ||
      !selectedClassYear ||
      !selectedClassDay
    ) {
      return;
    }

    const selectedTeacherRecord = teacherOptions.find(
      (teacher) => teacher.full_name === selectedTeacher
    );

    const selectedClassRecord = classOptions.find(
      (classItem) => classItem.class_name === selectedClassName
    );

    const selectedClassYearRecord = classYearOptions.find(
      (classYear) => classYear.year_name === selectedClassYear
    );

    if (
      !selectedTeacherRecord ||
      !selectedClassRecord ||
      !selectedClassYearRecord
    ) {
      return;
    }

    try {
      if (editingAllocation) {
        const response = await fetch(
          `${API_BASE_URL}/parent-teacher-interview/teacher-allocations/${editingAllocation.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              center_code: interviewAdmin.center_code,
              teacher_id: Number(selectedTeacherRecord.id),
              class_id: Number(selectedClassRecord.id),
              class_year_id: Number(selectedClassYearRecord.id),
              class_day: selectedClassDay,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to update teacher allocation."
          );
        }

        setAllocations((current) =>
          current.map((allocation) =>
            allocation.id === editingAllocation.id
              ? {
                  ...allocation,
                  teacherId: Number(selectedTeacherRecord.id),
                  classId: Number(selectedClassRecord.id),
                  classYearId: Number(selectedClassYearRecord.id),
                  teacher: selectedTeacher,
                  className: selectedClassName,
                  classYear: selectedClassYear,
                  classDay: selectedClassDay,
                }
              : allocation
          )
        );

        setEditingAllocation(null);
        setAllocationMessage("Teacher allocation updated successfully.");
      } else {
        const alreadyExists = allocations.some(
          (allocation) =>
            allocation.teacherId === Number(selectedTeacherRecord.id) &&
            allocation.classId === Number(selectedClassRecord.id) &&
            allocation.classYearId === Number(selectedClassYearRecord.id) &&
            allocation.classDay === selectedClassDay
        );

        if (alreadyExists) {
          window.alert(
            "This teacher is already allocated to this class, class year, and class day."
          );
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/parent-teacher-interview/teacher-allocations`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              center_code: interviewAdmin.center_code,
              teacher_id: Number(selectedTeacherRecord.id),
              class_id: Number(selectedClassRecord.id),
              class_year_id: Number(selectedClassYearRecord.id),
              class_day: selectedClassDay,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to save teacher allocation."
          );
        }

        setAllocationMessage("Teacher assigned successfully.");

        // Reload allocations from the backend so the newly created
        // allocation receives the backend-calculated parent_count.
        await loadAllocations();
      }

      setSelectedTeacher("");
      setSelectedClassName("");
      setSelectedClassYear("");
      setSelectedClassDay("");
      setClassDayOptions([]);
    } catch (error) {
      console.error("Failed to save teacher allocation:", error);
      window.alert(
        error.message || "Failed to save teacher allocation."
      );
    }
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
              onChange={(event) => {
                setSelectedClassName(event.target.value);
                setSelectedClassYear("");
                setSelectedClassDay("");
                setClassDayOptions([]);
              }}
            >
              <option value="">
                Select a class name
              </option>

              {classOptions.map((classItem) => (
                <option key={classItem.id} value={classItem.class_name}>
                  {classItem.class_name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Class Year</span>

            <select
              value={selectedClassYear}
              onChange={(event) => {
                setSelectedClassYear(event.target.value);
                setSelectedClassDay("");
                setClassDayOptions([]);
              }}
            >
              <option value="">
                Select a class year
              </option>

              {classYearOptions.map((classYear) => (
                <option key={classYear.id} value={classYear.year_name}>
                  {classYear.year_name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Class Day</span>

            <select
              value={selectedClassDay}
              onChange={(event) => setSelectedClassDay(event.target.value)}
              disabled={classDayOptions.length === 0}
            >
              <option value="">Select Class Day</option>

              {classDayOptions.map((day) => (
                <option key={day} value={day}>
                  {day}
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
                <option key={teacher.id} value={teacher.full_name}>
                  {teacher.full_name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="allocation-add-button"
            onClick={addAllocation}
            disabled={
              !selectedClassName ||
              !selectedClassYear ||
              !selectedClassDay ||
              !selectedTeacher
            }
          >
            {editingAllocation ? "Save Changes" : "+ Assign Teacher"}
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
            <span>Class Day</span>
            <span>Parents</span>
            <span></span>
          </div>

          {allocations.map((allocation) => (
            <div key={allocation.id}>

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
                  {allocation.classDay || "—"}
                </span>

                <span>
                  {allocation.parentCount ?? 0}
                </span>

                <div className="allocation-action-buttons">
                  <button
                    type="button"
                    className="allocation-edit-button"
                    onClick={() => {
                      setEditingAllocation(allocation);
                      setSelectedTeacher(allocation.teacher);
                      setSelectedClassName(allocation.className);
                      setSelectedClassYear("");
                      setSelectedClassDay("");
                      setClassDayOptions([]);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="allocation-delete-button"
                    onClick={() => deleteAllocation(allocation.id)}
                  >
                    Delete
                  </button>
                </div>

              </div>

            </div>
          ))}

        </div>

        {allocationMessage && (
          <p className="allocation-success-message" role="status">
            {allocationMessage}
          </p>
        )}
      </section>

      

    </div>
  );
}

export default TeacherAllocation;