import React, { useState, useEffect } from "react";
import "./QuizSetup.css";


const BACKEND_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";


export default function QuizSetup_naplan_reading({ 
  examType,
  userType,
  centerCode
}) {
  const [availableTopics, setAvailableTopics] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [questionBank, setQuestionBank] = useState([]);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [qbLoading, setQbLoading] = useState(false);
  const [availability, setAvailability] = useState({});
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDeleteQuestionSection, setShowDeleteQuestionSection] = useState(false);

  const getAllowedRange = (year) => {
    const yearNum = Number(year);

    if (yearNum >= 2 && yearNum <= 9) {
      return { min: 35, max: 45 };
    }

    return null;
  };

  const [quiz, setQuiz] = useState({
    className: "naplan",
    subject: "reading",
    year: "",
    numTopics: 1,
    topics: [],
  });

  const allowedRange = getAllowedRange(quiz.year);
  const isTotalValid =
    allowedRange &&
    totalQuestions >= allowedRange.min &&
    totalQuestions <= allowedRange.max;


  useEffect(() => {
  if (!quiz.year) return;

  const fetchAvailability = async () => {
    try {
      const params = new URLSearchParams({
        class_year: quiz.year,
        center_code: centerCode,
      });
      const res = await fetch(
        `${BACKEND_URL}/api/reading-availability?${params.toString()}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch availability");
      }

      const data = await res.json();

      console.log("📊 Availability:", data); // debug
      setAvailability(data);

    } catch (err) {
      console.error("Availability error:", err);
      setAvailability({});
    }
  };

  fetchAvailability();
}, [quiz.year]);
  /* ============================
     Sync subject on mount
  ============================ */
  useEffect(() => {
    setQuiz((prev) => ({
      ...prev,
      subject: "reading",
      topics: [],
    }));
    setAvailableTopics([]);
    setTotalQuestions(0);
    setShowQuestionBank(false);
  }, []);

  /* ============================
     Input handlers
  ============================ */
  const handleResetQuestions = async () => {
  if (!quiz.year) {
    alert("Please select a year first.");
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to reset used questions?"
  );

  if (!confirmed) return;

  try {
    const params = new URLSearchParams({
      year: quiz.year,
      center_code: centerCode,
      
    });

    const response = await fetch(
      `${BACKEND_URL}/api/admin/reuse-used-questions-naplan-reading?${params.toString()}`,
      {
        method: "PUT",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail ||
        "Failed to reset used questions."
      );
    }

    alert(
      `${data.deleted_count} question(s) reset successfully.`
    );

  } catch (error) {
    console.error(
      "Reset questions error:",
      error
    );

    alert(
      error.message ||
      "Something went wrong while resetting questions."
    );
  }
};
  const handleSearchQuestions_NAPLAN_Reading = async () => {
  if (!searchText.trim()) {
    alert("Please enter search text.");
    return;
  }

  if (!quiz.year) {
    alert("Please select year.");
    return;
  }

  try {
    setSearchLoading(true);

    const params = new URLSearchParams({
      query: searchText,
      class_year: quiz.year,
    });

    const res = await fetch(
      `${BACKEND_URL}/api/admin/search-questions-naplan-reading?${params.toString()}`
    );

    if (!res.ok) {
      throw new Error("Failed to search questions");
    }

    const data = await res.json();

    setSearchResults(data);

  } catch (err) {
    console.error(err);
    alert("Error searching questions.");
  } finally {
    setSearchLoading(false);
  }
};
  const handleDeleteSingleQuestion_NAPLAN_Reading = async () => {
  if (!selectedQuestionId) {
    alert("Please select a question.");
    return;
  }

  const confirmDelete = window.confirm(
    `Delete question ID ${selectedQuestionId}?`
  );

  if (!confirmDelete) return;

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/admin/delete-question-naplan-reading/${selectedQuestionId}`,
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
  const handleDeleteAllQuestions = async () => {
  const confirmed = window.confirm(
    "Are you sure you want to delete ALL Reading questions?"
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/admin/delete-all-questions-naplan-reading`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to delete Reading questions");
    }

    alert(data.message || "All Reading questions deleted successfully.");
  } catch (error) {
    console.error("Error deleting Reading questions:", error);
    alert("Something went wrong while deleting the questions.");
  }
};
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuiz((prev) => ({ ...prev, [name]: value }));
  };

  /* ============================
     Generate Topics
  ============================ */
  const generateTopics = () => {
    const num = parseInt(quiz.numTopics) || 1;

    const topicsArray = Array.from({ length: num }, () => ({
      name: "",
      total: 0,
      difficulty: {
        easy: { enabled: false, ai: 0, db: 0 },
        medium: { enabled: false, ai: 0, db: 0 },
        hard: { enabled: false, ai: 0, db: 0 },
      },
    }));

    setQuiz((prev) => ({ ...prev, topics: topicsArray }));
    setTotalQuestions(0);
  };

  /* ============================
     Topic handlers
  ============================ */
  const handleTopicNameChange = (index, value) => {
    setQuiz((prev) => {
      const topics = [...prev.topics];
      topics[index].name = value;
      return { ...prev, topics };
    });
  };

  const handleDifficultyToggle = (topicIndex, level) => {
  setQuiz((prev) => {
    const topics = [...prev.topics];

    const topic = { ...topics[topicIndex] };

    const difficulty = {
      ...topic.difficulty,
      [level]: {
        ...topic.difficulty[level],
        enabled: !topic.difficulty[level].enabled,
      },
    };

    topic.difficulty = difficulty;
    topics[topicIndex] = topic;

    // 🔥 recompute totals (same as before)
    const topicTotal = Object.values(difficulty).reduce((sum, d) => {
      if (!d.enabled) return sum;
      return sum + (d.ai || 0) + (d.db || 0);
    }, 0);

    topic.total = topicTotal;

    const globalTotal = topics.reduce(
      (sum, t) => sum + (t.total || 0),
      0
    );

    setTotalQuestions(globalTotal);

    return { ...prev, topics };
  });
};
  const handleDifficultyChange = (topicIndex, level, field, value) => {
  setQuiz((prev) => {
    const topics = [...prev.topics];
    const num = Number(value) || 0;

    topics[topicIndex].difficulty[level][field] = num;

    // 🔥 recompute topic total
    const topicTotal = Object.values(
      topics[topicIndex].difficulty
    ).reduce((sum, d) => {
      if (!d.enabled) return sum;
      return sum + (d.ai || 0) + (d.db || 0);
    }, 0);

    topics[topicIndex].total = topicTotal;

    // 🔥 recompute global total
    const globalTotal = topics.reduce(
      (sum, t) => sum + (t.total || 0),
      0
    );

    const range = getAllowedRange(prev.year);

    if (range && globalTotal > range.max) {
      alert(`Total cannot exceed ${range.max}`);
      return prev;
    }

    setTotalQuestions(globalTotal);
    return { ...prev, topics };
  });
};

  /* ============================
     View Question Bank
  ============================ */
  const handleViewQuestionBank = async () => {

  if (!quiz.year) {
    alert("Please select year first.");
    return;
  }

  try {

    setQbLoading(true);
    setShowQuestionBank(false);

    const normalizedCenterCode =
      centerCode?.trim()?.toUpperCase();

    const params = new URLSearchParams({
      subject: "reading",
      year: quiz.year,
      center_code: normalizedCenterCode,
    });

    const res = await fetch(
      `${BACKEND_URL}/api/admin/question-bank-reading/naplan?${params.toString()}`
    );

    if (!res.ok) {
      throw new Error(
        "Failed to load question bank"
      );
    }

    const data = await res.json();

    setQuestionBank(data);
    setShowQuestionBank(true);

  } catch (err) {

    console.error(
      "Question bank fetch error:",
      err
    );

    alert(
      "Failed to fetch question bank."
    );

  } finally {

    setQbLoading(false);

  }
};
  /* ============================
     Generate Exam
  ============================ */
  const handleGenerateExam = async () => {
    if (!isTotalValid) {
      alert("Total questions do not meet NAPLAN requirements.");
      return;
    }

    if (!quiz.topics.length) {
      alert("Please generate and select topics first.");
      return;
    }

    const payload = {
      class_name: quiz.className,
      subject: "reading",
      year: Number(quiz.year),
      center_code: centerCode,
      difficulty: "mixed",
      num_topics: quiz.topics.length,
      topics: quiz.topics.map((t) => ({
        name: t.name,
        total: t.total,
        difficulty: {
          easy: {
            ai: t.difficulty.easy.ai,
            db: t.difficulty.easy.db,
          },
          medium: {
            ai: t.difficulty.medium.ai,
            db: t.difficulty.medium.db,
          },
          hard: {
            ai: t.difficulty.hard.ai,
            db: t.difficulty.hard.db,
          },
        },
      })),
      total_questions: totalQuestions,
    };

    console.log("📤 NAPLAN READING QUIZ PAYLOAD:", payload);

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/quizzes-naplan-reading`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to create quiz");
      }

      await res.json();
      alert("NAPLAN Reading exam created successfully!");
    } catch (err) {
      console.error("❌ ERROR CREATING QUIZ:", err);
      alert("Failed to create exam. Check console for details.");
    }
  };
const handleGenerateExamHomeWork = async () => {
  if (!isTotalValid) {
    alert("Total questions do not meet NAPLAN requirements.");
    return;
  }

  if (!quiz.topics.length) {
    alert("Please generate and select topics first.");
    return;
  }

  const payload = {
    class_name: quiz.className,
    subject: "reading",
    year: Number(quiz.year),
    difficulty: "mixed",
    center_code: centerCode,
    num_topics: quiz.topics.length,
    topics: quiz.topics.map((t) => ({
      name: t.name,
      total: t.total,
      difficulty: {
        easy: {
          ai: t.difficulty.easy.ai,
          db: t.difficulty.easy.db,
        },
        medium: {
          ai: t.difficulty.medium.ai,
          db: t.difficulty.medium.db,
        },
        hard: {
          ai: t.difficulty.hard.ai,
          db: t.difficulty.hard.db,
        },
      },
    })),
    total_questions: totalQuestions,
  };

  console.log(
    "📤 NAPLAN READING HOMEWORK PAYLOAD:",
    payload
  );

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/quizzes-naplan-reading-homework`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const errText = await res.text();

      throw new Error(
        errText ||
        "Failed to create homework quiz"
      );
    }

    await res.json();

    alert(
      "NAPLAN Reading homework exam created successfully!"
    );

  } catch (err) {
    console.error(
      "❌ ERROR CREATING HOMEWORK QUIZ:",
      err
    );

    alert(
      "Failed to create homework exam. Check console for details."
    );
  }
};
  /* ============================
     Fetch available topics
  ============================ */
  useEffect(() => {
    if (!quiz.year ) {
      setAvailableTopics([]);
      return;
    }

    const fetchTopics = async () => {
      try {
        const params = new URLSearchParams({
          subject: "reading",
          year: quiz.year,
          
        });

        const res = await fetch(
          `${BACKEND_URL}/topics-naplan-reading?${params.toString()}`
        );

        if (!res.ok) throw new Error("Failed to fetch topics");

        const data = await res.json();
        setAvailableTopics(data);
      } catch (err) {
        console.error(err);
        setAvailableTopics([]);
      }
    };

    fetchTopics();
  }, [quiz.year]);
  /* ============================
   Selected Topics
============================ */
const selectedTopicNames = quiz.topics
  .map((t) => t.name)
  .filter((name) => name !== "");

  /* ============================
     Render
  ============================ */
  return (
    <div className="quiz-setup-container">
      <h2 style={{ marginBottom: "20px" }}>
        NAPLAN – READING
      </h2>

      <label style={{ display: "block", marginBottom: "8px" }}>
        Class:
      </label>
      <input
        value="NAPLAN"
        readOnly
        style={{ marginBottom: "16px" }}
      />

      <label style={{ display: "block", marginBottom: "8px" }}>
        Subject:
      </label>
      <input
        value="READING"
        readOnly
        style={{ marginBottom: "16px" }}
      />

      <label style={{ display: "block", marginBottom: "8px" }}>
        Year:
      </label>
      <select
        name="year"
        value={quiz.year}
        onChange={handleInputChange}
        style={{ marginBottom: "16px" }}
      >
        <option value="">Select Year</option>
        <option value="2">Year 2</option>
        <option value="3">Year 3</option>
        <option value="4">Year 4</option>
        <option value="5">Year 5</option>
        <option value="6">Year 6</option>
        <option value="7">Year 7</option>
        <option value="8">Year 8</option>
        <option value="9">Year 9</option>
      </select>

      <label style={{ display: "block", marginBottom: "8px" }}>
        Number of Topics:
      </label>
      <input
        type="number"
        name="numTopics"
        min="1"
        value={quiz.numTopics}
        onChange={handleInputChange}
      />

      <button
        type="button"
        onClick={generateTopics}
        disabled={!quiz.year}
      >
        Generate Topics
      </button>

      {/* ============================
         Topics
      ============================ */}
      <div className="topics-container">
        {quiz.topics.map((topic, index) => (
          <div className="topic" key={index}>
            <h4>Topic {index + 1}</h4>

            <label>Topic Name:</label>
            <select
              value={topic.name}
              onChange={(e) =>
                handleTopicNameChange(index, e.target.value)
              }
            >
              <option value="">Select topic</option>
              {availableTopics
                .filter(
                  (topicName) =>
                    !selectedTopicNames.includes(topicName) ||
                    topicName === topic.name
                )
                .map((topicName) => (
                  <option key={topicName} value={topicName}>
                    {topicName}
                  </option>
                ))}            </select>

            {["easy", "medium", "hard"].map((level) => (
              <div key={level} style={{ marginTop: "10px" }}>

                <label>
                  <input
                    type="checkbox"
                    checked={topic.difficulty[level].enabled}
                    onChange={() =>
                      handleDifficultyToggle(index, level)
                    }
                  />
                  {level.toUpperCase()}
                </label>

                {topic.difficulty[level].enabled && (
                  <div style={{ marginLeft: "20px", marginTop: "5px" }}>

                    {/* HEADERS */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "12px",
                      marginBottom: "5px"
                    }}>
                      <span>Questions Generated by AI</span>
                      <span>
                        Questions from Database{" "}
                        <span style={{ color: "blue" }}>
                          (Available in DB: {
                            availability[topic.name?.toLowerCase()]?.[level] || 0
                          })
                        </span>
                      </span>
                    </div>

                    {/* INPUTS */}
                    <div style={{ display: "flex", gap: "10px" }}>
                      <input
                        type="number"
                        min="0"
                        value={topic.difficulty[level].ai}
                        onChange={(e) =>
                          handleDifficultyChange(index, level, "ai", e.target.value)
                        }
                        style={{ flex: 1 }}
                      />

                      <input
                        type="number"
                        min="0"
                        value={topic.difficulty[level].db}
                        onChange={(e) =>
                          handleDifficultyChange(index, level, "db", e.target.value)
                        }
                        style={{ flex: 1 }}
                      />
                    </div>

                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="total-section">
        <h3>Total Questions: {totalQuestions}</h3>

        {allowedRange && (
          <p
            style={{
              color: isTotalValid ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            Allowed range for Year {quiz.year}:{" "}
            {allowedRange.min} to {allowedRange.max}
          </p>
        )}
      </div>

      {/* ============================
         Actions
      ============================ */}
      <div style={{ marginTop: "15px" }}>
        {userType !== "SUPER_ADMIN" && (
          <>
            <button
              type="button"
              onClick={handleViewQuestionBank}
              disabled={!quiz.year}
            >
              View Question Bank
            </button>

            <button
              type="button"
              onClick={handleResetQuestions}
              disabled={!quiz.year}
            >
              Reset used Questions
            </button>
          </>
        )}
        {userType !== "CENTER_ADMIN" && (
          <button
            type="button"
            onClick={handleDeleteAllQuestions}
          >
            Delete All Questions
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
          setShowDeleteQuestionSection((prev) => !prev)
        }
      >
        <h2 style={{ margin: 0 }}>
          Delete Single Question
        </h2>

        <span style={{ fontSize: "20px" }}>
          {showDeleteQuestionSection ? "−" : "+"}
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
            onClick={handleSearchQuestions_NAPLAN_Reading}
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
              onClick={handleDeleteSingleQuestion_NAPLAN_Reading}
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
        {userType !== "SUPER_ADMIN" && (
        <>
          <button
            type="button"
            onClick={handleGenerateExam}
            disabled={!quiz.topics.length || !isTotalValid}
            style={{
              backgroundColor: isTotalValid
                ? "#0d6efd"
                : "#ccc",

              cursor: isTotalValid
                ? "pointer"
                : "not-allowed",
            }}
          >
            Create Exam
          </button>

          <button
            type="button"
            onClick={handleGenerateExamHomeWork}
            disabled={!quiz.topics.length || !isTotalValid}
            style={{
              backgroundColor: isTotalValid
                ? "#0d6efd"
                : "#ccc",

              cursor: isTotalValid
                ? "pointer"
                : "not-allowed",
            }}
          >
            Create Exam (Homework)
          </button>
        </>
      )}
      </div>

      {showQuestionBank && (
        <div className="question-bank" style={{ marginTop: "20px" }}>
          <h3>Question Bank Summary</h3>

          {qbLoading ? (
            <p>Loading...</p>
          ) : questionBank.length === 0 ? (
            <p>No questions found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Difficulty</th>
                  <th>Topic</th>
                  <th>Total Questions</th>
                </tr>
              </thead>
              <tbody>
                {questionBank.map((row, idx) => (
                  <tr key={`${row.difficulty}-${row.topic}-${idx}`}>
                    <td>{row.difficulty}</td>
                    <td>{row.topic}</td>
                    <td>{row.total_questions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
