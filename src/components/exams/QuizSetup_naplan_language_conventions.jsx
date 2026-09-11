import React, { useState, useEffect } from "react";
import "./QuizSetup.css";

const BACKEND_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function QuizSetup_naplan_language_conventions({
  userType,
  centerCode
}) {
  const [availableTopics, setAvailableTopics] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [questionBank, setQuestionBank] = useState([]);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [qbLoading, setQbLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDeleteQuestionSection, setShowDeleteQuestionSection] = useState(false);
  /* ============================
    NAPLAN Rules
  ============================ */
 const getAllowedRange = (year) => {
    const y = Number(year);

    if (y >= 2 && y <= 9) {
      return { min: 1, max: 60 };
    }

    return null;
  };


  const [quiz, setQuiz] = useState({
    className: "naplan",
    subject: "language_conventions",
    year: "",
    numTopics: 1,
    topics: [],
  });

  const allowedRange = getAllowedRange(quiz.year);
  const isTotalValid =
    allowedRange &&
    totalQuestions >= allowedRange.min &&
    totalQuestions <= allowedRange.max;

  /* ============================
    Input Handlers
  ============================ */
  const handleDifficultyToggle = (topicIndex, level) => {
  setQuiz(prev => {
    const topics = [...prev.topics];

    // 🔥 clone deeply (important)
    const topic = { ...topics[topicIndex] };
    const difficulty = { ...topic.difficulty };

    const currentLevel = difficulty[level];

    difficulty[level] = {
      ...currentLevel,
      enabled: !currentLevel.enabled
    };

    topic.difficulty = difficulty;
    topics[topicIndex] = topic;

    return { ...prev, topics };
  });
};

  const handleReusedQuestions = async () => {
    if (!centerCode) {
      alert("Center code missing.");
      return;
      }
  const confirmed = window.confirm(
    "Are you sure you want to reset used questions?"
  );

  if (!confirmed) return;

  if (!quiz.year) {
    alert("Please select Year and Difficulty first.");
    return;
  }

  try {
    const params = new URLSearchParams({
      year: quiz.year,
      difficulty: "mixed",
      center_code: centerCode,
    });

    const response = await fetch(
      `${BACKEND_URL}/api/admin/reuse-used-questions-naplan-language-conventions?${params.toString()}`,
      {
        method: "PUT",
      }
    );

    const data = await response.json();
    console.log( "RESET USED QUESTIONS RESPONSE:", data );

    if (!response.ok) {
      throw new Error(
        data.detail ||
        "Failed to reset used questions."
      );
    }

    alert(
      `${data.deleted_count || 0} question(s) were reset and are now reusable.`
    );

  } catch (error) {
    console.error(
      "Reset used questions error:",
      error
    );

    alert(
      "Something went wrong while resetting used questions."
    );
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
        easy: { enabled: false, ai: 0, db: 0, available: 0 },
        medium: { enabled: false, ai: 0, db: 0, available: 0 },
        hard: { enabled: false, ai: 0, db: 0, available: 0 },
      },
    }));


    setQuiz((prev) => ({ ...prev, topics: topicsArray }));
    setTotalQuestions(0);
  };

  /* ============================
    Topic Handlers
  ============================ */
  const handleTopicNameChange = async (index, value) => {
  setQuiz((prev) => {
    const topics = [...prev.topics];
    topics[index].name = value;
    return { ...prev, topics };
  });

  // 🔥 CALL BACKEND
  if (!value || !quiz.year) return;

  try {
    const params = new URLSearchParams({
      subject: "language_conventions",
      center_code: centerCode,
      year: quiz.year,
      topic: value,
    });

    const res = await fetch(
      `${BACKEND_URL}/api/topic-question-counts-lc?${params.toString()}`
    );

    if (!res.ok) throw new Error("Failed to fetch counts");

    const data = await res.json();

    // 🔥 UPDATE AVAILABLE COUNTS
    setQuiz((prev) => {
      const topics = [...prev.topics];

      const topic = { ...topics[index] };

      topic.difficulty.easy.available = data.easy || 0;
      topic.difficulty.medium.available = data.medium || 0;
      topic.difficulty.hard.available = data.hard || 0;

      topics[index] = topic;

      return { ...prev, topics };
    });

  } catch (err) {
    console.error("Error fetching topic counts:", err);
  }
};

  const handleDifficultyChange = (index, level, field, value) => {
  setQuiz((prev) => {
    const topics = [...prev.topics];
    const num = Number(value) || 0;

    topics[index].difficulty[level][field] = num;

    // ✅ Recalculate topic total
    let topicTotal = 0;

    ["easy", "medium", "hard"].forEach((lvl) => {
      const d = topics[index].difficulty[lvl];
      if (d.enabled) {
        topicTotal += (d.ai || 0) + (d.db || 0);
      }
    });

    topics[index].total = topicTotal;

    // ✅ Global total
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
    Fetch Available Topics
  ============================ */
  useEffect(() => {
    if (!quiz.year) {
      setAvailableTopics([]);
      return;
    }

    const fetchTopics = async () => {
      try {
        const params = new URLSearchParams({
          subject: "language_conventions",
          year: quiz.year,
          
        });

        const res = await fetch(
          `${BACKEND_URL}/api/topics-naplan?${params.toString()}`
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
    View Question Bank
  ============================ */
  const handleSearchQuestions_LC = async () => {
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
      year: quiz.year,
      subject: "Language Conventions",
    });

    const res = await fetch(
      `${BACKEND_URL}/api/admin/search-questions-naplan?${params.toString()}`
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
  const handleDeleteSingleQuestion_LC = async () => {
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
      `${BACKEND_URL}/api/admin/delete-question-naplan/${selectedQuestionId}`,
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
    "Are you sure you want to delete all Language Conventions questions?"
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/admin/delete-all-questions-naplan-lc`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to delete questions");
    }
    console.log(
      "DELETE ALL LC RESPONSE:",
      data
    );
    alert(
      `${data.message}

    Questions Deleted: ${data.questions_deleted || 0}
    Usage Records Deleted: ${data.usage_records_deleted || 0}
    Remaining Questions: ${data.remaining_questions || 0}`
    );
  } catch (error) {
    console.error("Error deleting questions:", error);
    alert("Something went wrong while deleting the questions.");
  }
};
  const handleViewQuestionBank = async () => {
    if (!quiz.year) {
      alert("Please select year first.");
      return;
    }

    try {
      setQbLoading(true);
      setShowQuestionBank(false);
      const params = new URLSearchParams({
        subject: "language_conventions",
        year: quiz.year,
        center_code: centerCode,
      });

      const res = await fetch(
        `${BACKEND_URL}/api/admin/question-bank/naplan?${params.toString()}`
      );

      if (!res.ok) throw new Error("Failed to load question bank");

      const data = await res.json();
      setQuestionBank(data);
      setShowQuestionBank(true);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch question bank.");
    } finally {
      setQbLoading(false);
    }
  };

  /* ============================
    Create Exam
  ============================ */
  const handleGenerateHomeWorkExam = async () => {
    if (!centerCode) {
      alert("Center code missing.");
      return;
    }
  if (!isTotalValid) {
    alert("Total questions do not meet NAPLAN requirements.");
    return;
  }

  if (!quiz.topics.length) {
    alert("Please generate and select topics first.");
    return;
  }

  const payload = {
    class_name: "naplan",
    subject: "Language Conventions",
    center_code: centerCode,
    year: Number(quiz.year),
    difficulty: "mixed",
    num_topics: quiz.topics.length,
    topics: quiz.topics.map((t) => ({
      name: t.name,
      total: t.total,
      difficulty: {
        easy: {
          ai: t.difficulty.easy.enabled ? t.difficulty.easy.ai : 0,
          db: t.difficulty.easy.enabled ? t.difficulty.easy.db : 0,
        },
        medium: {
          ai: t.difficulty.medium.enabled ? t.difficulty.medium.ai : 0,
          db: t.difficulty.medium.enabled ? t.difficulty.medium.db : 0,
        },
        hard: {
          ai: t.difficulty.hard.enabled ? t.difficulty.hard.ai : 0,
          db: t.difficulty.hard.enabled ? t.difficulty.hard.db : 0,
        },
      },
    })),

    total_questions: totalQuestions,
  };

  console.log(
    "📤 LANGUAGE CONVENTIONS HOMEWORK PAYLOAD:",
    payload
  );

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/quizzes-naplan-language-conventions-homework`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to create homework exam");
    }

    await res.json();

    alert(
      "NAPLAN Language Conventions homework exam created successfully!"
    );

  } catch (err) {
    console.error(err);

    alert("Failed to create homework exam.");
  }
};
  const handleGenerateExam = async () => {
    if (!centerCode) {
      alert("Center code missing.");
      return;
    }
    if (!isTotalValid) {
      alert("Total questions do not meet NAPLAN requirements.");
      return;
    }

    if (!quiz.topics.length) {
      alert("Please generate and select topics first.");
      return;
    }

    const payload = {
      class_name: "naplan",
      subject: "Language Conventions",
      center_code: centerCode,
      year: Number(quiz.year),
      difficulty: "mixed",
      num_topics: quiz.topics.length,
      topics: quiz.topics.map((t) => ({
        name: t.name,
        total: t.total,
        difficulty: {
          easy: {
            ai: t.difficulty.easy.enabled ? t.difficulty.easy.ai : 0,
            db: t.difficulty.easy.enabled ? t.difficulty.easy.db : 0,
          },
          medium: {
            ai: t.difficulty.medium.enabled ? t.difficulty.medium.ai : 0,
            db: t.difficulty.medium.enabled ? t.difficulty.medium.db : 0,
          },
          hard: {
            ai: t.difficulty.hard.enabled ? t.difficulty.hard.ai : 0,
            db: t.difficulty.hard.enabled ? t.difficulty.hard.db : 0,
          },
        },
      })),

      total_questions: totalQuestions,
      };
    console.log("📤 LANGUAGE CONVENTIONS PAYLOAD:", payload);

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/quizzes-naplan-language-conventions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to create exam");

      await res.json();
      alert("NAPLAN Language Conventions exam created successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to create exam.");
    }
  };

  /* ============================
    Render
  ============================ */
  return (
    <div className="quiz-setup-container">
      <h2 style={{ marginBottom: "20px" }}>
        NAPLAN – LANGUAGE CONVENTIONS
      </h2>

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
                .filter((t) =>
                  !selectedTopicNames.includes(t.name) || t.name === topic.name
                )
                .map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
            </select>

            {["easy", "medium", "hard"].map((level) => (
              <div key={level} style={{ marginTop: "10px" }}>
                
                {/* TOGGLE */}
                <label>
                  <input
                    type="checkbox"
                    checked={topic.difficulty[level].enabled}
                    onChange={() => handleDifficultyToggle(index, level)}
                  />
                  {level.toUpperCase()}
                </label>

                {/* INPUTS */}
                {topic.difficulty[level].enabled && (
                  <div className="difficulty-grid">
  
                  {/* LEFT: AI */}
                  <div>
                    <label>Questions Generated by AI</label>
                    <input
                      type="number"
                      min="0"
                      value={topic.difficulty[level].ai}
                      onChange={(e) =>
                        handleDifficultyChange(index, level, "ai", e.target.value)
                      }
                    />
                  </div>

                  {/* RIGHT: DB */}
                  <div>
                    <label>
                      Questions from Database{" "}
                      <span style={{ color: "blue" }}>
                        Available in DB: {topic.difficulty[level].available || 0}
                      </span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={topic.difficulty[level].db}
                      onChange={(e) =>
                        handleDifficultyChange(index, level, "db", e.target.value)
                      }
                    />
                  </div>

                </div>
                )}
              </div>
            ))}


          </div>
        ))}
      </div>

      <h3>Total Questions: {totalQuestions}</h3>
      {allowedRange && !isTotalValid && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          For Year {quiz.year}, total questions must be between{" "}
          {allowedRange.min} and {allowedRange.max}.
        </p>
      )}
      
      {allowedRange && isTotalValid && (
        <p style={{ color: "green", fontWeight: "bold" }}>
          Total questions are within the allowed range.
        </p>
      )}
      
      {userType !== "SUPER_ADMIN" && (
        <>
          <button onClick={handleViewQuestionBank}>
            View Question Bank
          </button>

          <button onClick={handleReusedQuestions}>
            Reset used questions
          </button>
        </>
      )}
      {userType === "SUPER_ADMIN" && (
        <button onClick={handleDeleteAllQuestions}>
          Delete All Questions
        </button>
      )}
      <div className="section-card">

    {userType === "SUPER_ADMIN" && (
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
            onClick={handleSearchQuestions_LC}
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
              onClick={handleDeleteSingleQuestion_LC}
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
            onClick={handleGenerateExam}
            disabled={!isTotalValid}
            style={{
              backgroundColor: isTotalValid ? "#0d6efd" : "#ccc",
              cursor: isTotalValid ? "pointer" : "not-allowed",
            }}
          >
            Create Exam
          </button>

          <button
            onClick={handleGenerateHomeWorkExam}
            disabled={!isTotalValid}
            style={{
              backgroundColor: isTotalValid ? "#0d6efd" : "#ccc",
              cursor: isTotalValid ? "pointer" : "not-allowed",
            }}
          >
            Create Exam (homework)
          </button>
        </>
      )}


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
