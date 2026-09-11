import React, { useState, useEffect } from "react";

import "./QuizSetup_writing.css";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
export default function QuizSetup_writing({
  userType,
  centerCode
}) {
  const [form, setForm] = useState({
    className: "selective",
    classYear: "",
    topic: "",
    difficulty: ""
  });
  console.log("userType:", userType);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDeleteQuestionSection, setShowDeleteQuestionSection] = useState(false);
  const [availableTopics, setAvailableTopics] = useState([]);
  const handleResetAllQuestions = async () => {

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
      class_name: form.className,
    });

    const res = await fetch(
      `${BACKEND_URL}/api/admin/reset-writing-questions?${params.toString()}`,
      {
        method: "PUT",
      }
    );

    const data = await res.json();

    if (!res.ok) {

      throw new Error(
        data.detail ||
        "Failed to reset questions"
      );
    }

    alert(
      `${data.deleted_count} question(s) reset successfully.`
    );

  } catch (err) {

    console.error(err);

    alert(
      err.message ||
      "Failed to reset questions."
    );

  } finally {

    setLoading(false);
  }
};
  const handleSearchWritingQuestions = async () => {
  if (!searchText.trim()) {
    alert("Please enter search text.");
    return;
  }

  if (!form.classYear) {
    alert("Please select class year.");
    return;
  }

  try {
    setSearchLoading(true);

    const params = new URLSearchParams({
      query: searchText,
      class_year: form.classYear,
      difficulty: form.difficulty || "",
    });

    const res = await fetch(
      `${BACKEND_URL}/api/admin/search-writing-questions?${params.toString()}`
    );

    if (!res.ok) {
      throw new Error("Failed to search writing questions");
    }

    const data = await res.json();

    setSearchResults(data);

  } catch (err) {
    console.error(err);
    alert("Error searching writing questions.");
  } finally {
    setSearchLoading(false);
  }
};
  const handleDeleteSingleWritingQuestion = async () => {
  if (!selectedQuestionId) {
    alert("Please select a question.");
    return;
  }

  const confirmDelete = window.confirm(
    `Delete writing question ID ${selectedQuestionId}?`
  );

  if (!confirmDelete) return;

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/admin/delete-writing-question/${selectedQuestionId}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to delete question");
    }

    const data = await res.json();

    alert(data.message);

    setSearchResults((prev) =>
      prev.filter((q) => q.id !== Number(selectedQuestionId))
    );

    setSelectedQuestionId("");

  } catch (err) {
    console.error(err);
    alert("Error deleting question.");
  }
};
  const handleDeleteAllWritingHomework = async () => {
  if (!window.confirm("⚠️ Are you sure you want to delete ALL writing homework questions?")) {
    return;
  }

  try {
    setLoading(true);

    const res = await fetch(
      `${BACKEND_URL}/api/admin/delete-writing-homework-questions`,
      {
        method: "DELETE",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Failed to delete questions");
    }

    alert("✅ All writing homework questions deleted successfully!");
  } catch (err) {
    console.error(err);
    alert("❌ Failed to delete questions.");
  } finally {
    setLoading(false);
  }
};
  const handleHomeworkSubmit = async (e) => {
    e.preventDefault();

    if (!form.className || !form.classYear || !form.topic.trim() || !form.difficulty) {
      alert("Please fill in all required fields.");
      return;
    }

    const payload = {
      class_name: form.className,
      class_year: form.classYear,
      subject: "writing",
      topic: form.topic.trim(),
      difficulty: form.difficulty,
      center_code: centerCode
    };

    try {
      setLoading(true);

      const res = await fetch(
        `${BACKEND_URL}/api/quizzes-writing-homework`, // ✅ DIFFERENT ENDPOINT
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to save writing homework exam");
      }

      alert("✅ Writing Homework exam saved!");

    } catch (err) {
      console.error(err);
      alert("❌ Error saving writing homework exam.");
    } finally {
      setLoading(false);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

     if (!form.className || !form.classYear || !form.topic.trim() || !form.difficulty) {
      alert("Please fill in all required fields.");
      return;
    }

    const payload = {
      class_name: form.className,
      class_year: form.classYear,   // ✅ already included
      subject: "writing",
      topic: form.topic.trim(),
      difficulty: form.difficulty,
      center_code: centerCode
    };


    try {
      setLoading(true);

      const res = await fetch(
        `${BACKEND_URL}/api/quizzes-writing`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to save writing exam");
      }

      alert("✅ Writing exam setup saved successfully!");

      setForm({
      className: "selective",
      classYear: "",
      topic: "",
      difficulty: ""
    });
    } catch (err) {
      console.error(err);
      alert("❌ Error saving writing exam setup.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
  // 🚫 Do nothing until BOTH are selected
  if (!form.difficulty || !form.classYear) {
    setAvailableTopics([]);
    return;
  }

  const fetchWritingTopics = async () => {
    try {
      const params = new URLSearchParams({
        difficulty: form.difficulty,
        class_year: form.classYear,
        class_name: form.className
      });

      const res = await fetch(
        `${BACKEND_URL}/api/writing/topics?${params.toString()}`
      );

      if (!res.ok) {
        throw new Error("Failed to load writing topics");
      }

      const data = await res.json();
      setAvailableTopics(data);
    } catch (err) {
      console.error("Failed to fetch writing topics", err);
      setAvailableTopics([]);
    }
  };

  fetchWritingTopics();
}, [form.difficulty, form.classYear]);  // ✅ BOTH dependencies


  return (
    <div className="quiz-setup-container">
      <form onSubmit={handleSubmit}>

        {/* CLASS */}
        <label>Class:</label>
        <input
          type="text"
          value="Selective"
          readOnly
          style={{ backgroundColor: "#f0f0f0" }}
        />
        {/* CLASS YEAR */}
        <label>Class Year:</label>
        <select
          name="classYear"
          value={form.classYear}
          onChange={handleChange}
          required
        >
          <option value="">Select Year</option>
          <option value="Year 4">Year 4</option>
          <option value="Year 5">Year 5</option>
          <option value="Year 6">Year 6</option>
          
        </select>
        {/* SUBJECT (LOCKED) */}
        <label>Subject:</label>
        <input
          type="text"
          value="Writing"
          readOnly
          style={{ backgroundColor: "#f0f0f0" }}
        />

        {/* TOPIC (FULLY EDITABLE) */}
        <label>Topic:</label>
        <select
          name="topic"
          value={form.topic}
          onChange={handleChange}
          required
          disabled={!form.difficulty || !form.classYear}  // ✅
        >
          <option value="">Select Topic</option>
        
          {availableTopics.map((t) => (
            <option key={t.name} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>


        {/* DIFFICULTY */}
        <label>Difficulty Level:</label>
        <select
          name="difficulty"
          value={form.difficulty}
          onChange={handleChange}
          required
        >
          <option value="">Select Difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        {/* SUBMIT */}
        {userType !== "SUPER_ADMIN" && (
          <>
            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : "Save Writing Exam"}
            </button>

            <button
              type="button"
              onClick={handleHomeworkSubmit}
              disabled={loading}
              style={{
                marginTop: "10px",
                backgroundColor: "#6c63ff",
                color: "white"
              }}
            >
              {loading
                ? "Saving..."
                : "Save Writing Exam (Homework)"}
            </button>
          </>
        )}
        {userType !== "SUPER_ADMIN" && (
        <button
          type="button"
          onClick={handleResetAllQuestions}
          disabled={loading}
          style={{
            marginTop: "10px",
            backgroundColor: "#dc3545",
            color: "white"
          }}
        >
          {loading
            ? "Resetting..."
            : "Reset All Questions"}
        </button>
      )}
        {userType !== "CENTER_ADMIN" && (
          <button
            type="button"
            onClick={handleDeleteAllWritingHomework}
            disabled={loading}
            style={{
              marginTop: "10px",
              backgroundColor: "#ff4d4f",
              color: "white"
            }}
          >
            {loading
              ? "Deleting..."
              : "Delete All Writing Questions"}
          </button>
        )}
        <div className="section-card">

        {userType !== "CENTER_ADMIN" && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            marginTop: "20px",
          }}
          onClick={() =>
            setShowDeleteQuestionSection(
              (prev) => !prev
            )
          }
        >
          <h2 style={{ margin: 0 }}>
            Delete Single Question
          </h2>

          <span style={{ fontSize: "20px" }}>
            {showDeleteQuestionSection
              ? "−"
              : "+"}
          </span>
        </div>
      )}

  {showDeleteQuestionSection && (
    <>

      <div className="grid-2" style={{ marginTop: "20px" }}>
        <div>
          <label>Search Question</label>

          <input
            type="text"
            placeholder="Search by topic or question text..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "end",
          }}
        >
          <button
            type="button"
            onClick={handleSearchWritingQuestions}
          >
            Search Questions
          </button>
        </div>
      </div>

      {searchLoading && (
        <p>Searching questions...</p>
      )}

      {searchResults.length > 0 && (
        <>
          <div style={{ marginTop: "20px" }}>
            <label>Select Question</label>

            <select
              value={selectedQuestionId}
              onChange={(e) =>
                setSelectedQuestionId(e.target.value)
              }
            >
              <option value="">
                Select a Question
              </option>

              {searchResults.map((q) => (
                <option key={q.id} value={q.id}>
                  ID {q.id} | {q.preview?.slice(0, 80)}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              marginTop: "20px",
              border: "1px solid #ddd",
              padding: "12px",
              borderRadius: "8px",
              background: "#fafafa",
            }}
          >
            {searchResults
              .filter(
                (q) => q.id === Number(selectedQuestionId)
              )
              .map((q) => (
                <div key={q.id}>
                  <strong>Preview:</strong>

                  <p
                    style={{
                      marginTop: "10px",
                      lineHeight: "1.6",
                    }}
                  >
                    {q.preview}
                  </p>
                </div>
              ))}
          </div>

          <div style={{ marginTop: "20px" }}>
            <button
              type="button"
              onClick={handleDeleteSingleWritingQuestion}
              style={{
                backgroundColor: "#d9534f",
                color: "white",
              }}
            >
              Delete Selected Question
            </button>
          </div>
        </>
      )}

      {!searchLoading &&
        searchText &&
        searchResults.length === 0 && (
          <p style={{ marginTop: "15px" }}>
            No matching questions found.
          </p>
      )}

    </>
  )}
</div>
      </form>
    </div>
  );
}
