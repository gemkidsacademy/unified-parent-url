import { useState } from "react";

function HomeworkSupportAttendance({
  studentName,
  onAttend,
  onNotAttend,
  isSubmitting = false,
}) {
  const [selectedResponse, setSelectedResponse] = useState(null);

  const handleYes = () => {
    setSelectedResponse("ATTENDING");
    onAttend();
  };

  const handleNo = () => {
    setSelectedResponse("NOT_ATTENDING");
    onNotAttend();
  };

  return (
    <div className="homework-attendance-section">

      <h2>
        Will {studentName} be attending Homework Support?
      </h2>

      <p className="attendance-subtitle">
        Please select an option below.
      </p>

      <div className="homework-actions">

        <button
          type="button"
          className="homework-attend-button"
          onClick={handleYes}
          disabled={isSubmitting}
        >
          {selectedResponse === "ATTENDING" && isSubmitting
            ? "Loading..."
            : "Yes, my child will attend"}
        </button>

        <button
          type="button"
          className="homework-not-attend-button"
          onClick={handleNo}
          disabled={isSubmitting}
        >
          {selectedResponse === "NOT_ATTENDING" && isSubmitting
            ? "Submitting..."
            : "No, my child will not attend"}
        </button>

      </div>

    </div>
  );
}

export default HomeworkSupportAttendance;