import React, { useState, useEffect } from "react";
import "./QuizSetup.css";

export default function QuizSetup_naplan_writing({ userType, centerCode }) {
  console.log("QuizSetup_naplan_writing rendered");
  const [classYear, setClassYear] = useState("");
  const [topic, setTopic] = useState("");
  const API_BASE =  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  const [difficultyLevels, setDifficultyLevels] = useState([]);
  const [difficulty, setDifficulty] = useState("");

  const handleSaveExam = async () => {
  if (!classYear || !topic || !difficulty) {
    alert("Please fill in all required fields.");
    return;
  }

  const payload = {
    class_name: "Naplan",
    class_year: classYear,
    subject: "Writing",
    topic: topic,
    difficulty: difficulty,
    center_code: centerCode,
  };

  try {
    setLoading(true);

    const response = await fetch(
      `${API_BASE}/api/quizzes-writing`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to save writing exam");
    }

    alert("✅ Naplan Writing exam setup saved successfully!");

    // Reset form
    setClassYear("");
    setDifficulty("");
    setTopic("");
    setDifficultyLevels([]);
    setTopics([]);

  } catch (error) {
    console.error(error);
    alert(error.message || "❌ Error saving writing exam setup.");
  } finally {
    setLoading(false);
  }
};

  const handleSaveHomework = async () => {
  if (!classYear || !topic || !difficulty) {
    alert("Please fill in all required fields.");
    return;
  }

  const payload = {
    class_name: "Naplan",
    class_year: classYear,
    subject: "writing",
    topic: topic,
    difficulty: difficulty,
    center_code: centerCode,
  };

  try {
    setLoading(true);

    const response = await fetch(
      `${API_BASE}/api/quizzes-writing-homework`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to save Naplan writing homework exam"
      );
    }

    alert("✅ Naplan Writing Homework exam saved successfully!");

    // Reset form
    setClassYear("");
    setDifficulty("");
    setTopic("");
    setDifficultyLevels([]);
    setTopics([]);

  } catch (error) {
    console.error(error);
    alert(error.message || "❌ Error saving Naplan writing homework exam.");
  } finally {
    setLoading(false);
  }
};

  const handleReset = async () => {
  const confirmed = window.confirm(
    "Are you sure you want to reset all writing questions?"
  );

  if (!confirmed) {
    return;
  }

  try {
    setLoading(true);

    const params = new URLSearchParams({
      center_code: centerCode,
      class_name: "Naplan",
    });

    const response = await fetch(
      `${API_BASE}/api/admin/reset-writing-questions?${params.toString()}`,
      {
        method: "PUT",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to reset questions"
      );
    }

    alert(
      `${data.deleted_count} question(s) reset successfully.`
    );

  } catch (error) {
    console.error(error);

    alert(
      error.message || "Failed to reset questions."
    );
  } finally {
    setLoading(false);
  }
};
  const fetchTopics = async (selectedDifficulty) => {
  try {
    const className = "Naplan";

    const url =
      `${API_BASE}/writing/topics?class_name=${encodeURIComponent(className)}` +
      `&class_year=${encodeURIComponent(classYear)}` +
      `&difficulty=${encodeURIComponent(selectedDifficulty)}`;

    console.log(url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to load topics");
    }

    const data = await response.json();

    setTopics(data);
  } catch (error) {
    console.error(error);
  }
};

  const fetchDifficultyLevels = async (selectedYear) => {
  console.log("fetchDifficultyLevels called");
  console.log("Year:", selectedYear);

  try {
    const className = "Naplan";

    const url = `${API_BASE}/writing/difficulty-levels?class_name=${encodeURIComponent(className)}&class_year=${encodeURIComponent(selectedYear)}`;

    console.log("Request URL:", url);

    const response = await fetch(url);

    console.log("Response Status:", response.status);

    if (!response.ok) {
      throw new Error("Failed to load difficulty levels");
    }

    const data = await response.json();
    console.log("Difficulty Levels:", data);

    setDifficultyLevels(data);
  } catch (error) {
    console.error(error);
  }
};
  return (
    <div className="quiz-setup-container">

      {/* Class */}
      <div className="form-group">
        <label>Class:</label>
        <input
          type="text"
          value="Naplan"
          readOnly
          className="form-control"
        />
      </div>

      {/* Class Year */}
      <div className="form-group">
        <label>Class Year:</label>
        <select
          className="form-control"
          value={classYear}
          onChange={(e) => {
            const year = e.target.value;

            console.log("Selected year:", year);

            setClassYear(year);
            fetchDifficultyLevels(year);
          }}
        >
          <option value="">Select Year</option>
          <option value="3">Year 3</option>
          <option value="5">Year 5</option>
          <option value="7">Year 7</option>
          <option value="9">Year 9</option>
        </select>
      </div>

      {/* Subject */}
      <div className="form-group">
        <label>Subject:</label>
        <input
          type="text"
          value="Writing"
          readOnly
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label>Difficulty Level:</label>

        <select
          className="form-control"
          value={difficulty}
          onChange={(e) => {
              const value = e.target.value;

              setDifficulty(value);

              fetchTopics(value);
          }}
        >
          <option value="">Select Difficulty</option>

          {difficultyLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>
      {/* Topic */}
      <div className="form-group">
        <label>Topic:</label>
        <select
          className="form-control"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          <option value="">Select Topic</option>

          {topics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Difficulty */}
      {/* Difficulty */}
      

      {/* Buttons */}
      <button
        className="dashboard-button"
        onClick={handleSaveExam}
        style={{ marginBottom: "20px" }}
      >
        Save Writing Exam
      </button>

      <button
        className="dashboard-button"
        onClick={handleSaveHomework}
        style={{
          marginBottom: "20px",
          background: "#635BFF",
        }}
      >
        Save Writing Exam (Homework)
      </button>

      <button
        className="dashboard-button"
        onClick={handleReset}
        style={{
          background: "#E63946",
        }}
      >
        Reset All Questions
      </button>

      <div
        style={{
          marginTop: "20px",
          minHeight: "50px",
          border: "1px solid #ddd",
          borderRadius: "10px",
          background: "#fff",
        }}
      />
    </div>
  );
}