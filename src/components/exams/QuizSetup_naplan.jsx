import React, { useState, useEffect } from "react";
import "./QuizSetup.css";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function QuizSetup_naplan({
  examType,
  userType,
  centerCode
}) {
  const [availableTopics, setAvailableTopics] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [availableYears] = useState([2,3,4,5,6,7,8,9]);
  const [isGeneratingHomework, setIsGeneratingHomework] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDeleteQuestionSection, setShowDeleteQuestionSection] = useState(false);

  const [questionBank, setQuestionBank] = useState([]);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [qbLoading, setQbLoading] = useState(false);
  const handleSearchQuestions_NAPLAN = async () => {
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
        subject: quiz.subject,
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
  const handleDeleteSingleQuestion_NAPLAN = async () => {
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

  const getAllowedRange = (year) => {
    const yearNum = Number(year);

    if (yearNum >= 2 && yearNum <= 9) {
      return { min: 1, max: 45 };
    }

    return null;
  };

  

  const [quiz, setQuiz] = useState({
    className: "naplan",
    subject: examType.replace("naplan_", ""),
    year: "",
    difficulty: "mixed", 
    numTopics: 1,
    topics: [],
  });
  const allowedRange = getAllowedRange(quiz.year);
  const isTotalValid =
    allowedRange &&
    totalQuestions >= allowedRange.min &&
    totalQuestions <= allowedRange.max;

  
  /* ============================
     Sync subject with examType
  ============================ */
  useEffect(() => {
    setQuiz((prev) => ({
      ...prev,
      subject: examType.replace("naplan_", ""),
      topics: [],
    }));
    setAvailableTopics([]);
    setTotalQuestions(0);
    setShowQuestionBank(false);
  }, [examType]);
  /* ============================
   Fetch available years
============================ */
//useEffect(() => {
  //const fetchYears = async () => {
   // try {
     // const res = await fetch(
     //   `${BACKEND_URL}/api/naplan-years`
      //);

      //if (!res.ok) throw new Error("Failed to fetch years");

      //const data = await res.json();
      //setAvailableYears(data);
    //} catch (err) {
      //console.error("❌ Failed to load years:", err);
      //setAvailableYears([]);
   // }
  //};

  //fetchYears();
//}, []);
  /* ============================
     Input handlers
  ============================ */
  const handleReuseUsedQuestions = async () => {
  const confirmed = window.confirm(
    "Are you sure you want to make all used questions available again?"
  );

  if (!confirmed) return;

  if (!quiz.year || !quiz.difficulty) {
    alert("Please select Year and Difficulty first.");
    return;
  }

  try {
    const params = new URLSearchParams({
      year: quiz.year,
      center_code: centerCode,
      
    });

    const response = await fetch(
      `${BACKEND_URL}/api/admin/reuse-used-questions-naplan-numeracy?${params.toString()}`,
      {
        method: "PUT",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to reuse used questions"
      );
    }

    alert(
      `${data.deleted_count} used question(s) were reset successfully.`
    );

  } catch (error) {
    console.error("Error reusing used questions:", error);

    alert(
      "Something went wrong while resetting used questions."
    );
  }
};
  const handleDifficultyInputChange = (
  topicIndex,
  level,
  field,
  value
) => {
  setQuiz(prev => {
    const topics = [...prev.topics];
    const num = Number(value) || 0;

    // update value
    topics[topicIndex].difficulty[level][field] = num;

    // 🔥 calculate topic total
    const t = topics[topicIndex].difficulty;

    const topicTotal =
      (t.easy.enabled ? t.easy.ai + t.easy.db : 0) +
      (t.medium.enabled ? t.medium.ai + t.medium.db : 0) +
      (t.hard.enabled ? t.hard.ai + t.hard.db : 0);

    topics[topicIndex].total = topicTotal;

    // 🔥 calculate global total
    const globalTotal = topics.reduce(
      (sum, topic) => sum + (topic.total || 0),
      0
    );

    setTotalQuestions(globalTotal);

    return { ...prev, topics };
  });
};
  const handleDeleteAllQuestions = async () => {
  const confirmed = window.confirm(
    "Are you sure you want to delete all questions?"
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/admin/delete-all-questions-naplan-numeracy`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();
    console.log("DELETE RESPONSE:", data);

    if (!response.ok) {
      throw new Error(data.detail || "Failed to delete questions");
    }

    alert(
      `${data.message}

    Questions deleted: ${data.deleted_count}
    Usage rows deleted: ${data.usage_rows_deleted}`
    );
  } catch (error) {
    console.error("Error deleting questions:", error);
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
      easy: { enabled: false, ai: 0, db: 0, available: 0 },
      medium: { enabled: false, ai: 0, db: 0, available: 0 },
      hard: { enabled: false, ai: 0, db: 0, available: 0 }
    }
  }));

  setQuiz((prev) => {
    const updated = { ...prev, topics: topicsArray };
    console.log("✅ GENERATED TOPICS:", updated.topics); // 👈 ADD THIS
    return updated;
  });

  setTotalQuestions(0);
};

  /* ============================
     Topic handlers
  ============================ */
  const handleDifficultyToggle = (topicIndex, level) => {
  setQuiz(prev => {
    const topics = prev.topics.map((t, i) => {
      if (i !== topicIndex) return t;

      return {
        ...t,
        difficulty: {
          ...t.difficulty,
          [level]: {
            ...t.difficulty[level],
            enabled: !t.difficulty[level].enabled
          }
        }
      };
    });

    return { ...prev, topics };
  });
};;
  const handleTopicNameChange = async (index, value) => {
  // Step 1: update topic name
  setQuiz(prev => {
    const topics = [...prev.topics];
    topics[index].name = value;
    return { ...prev, topics };
  });

  // Step 2: call backend
  if (!value) return;

  try {
    const params = new URLSearchParams({
      subject: quiz.subject,
      year: quiz.year,
      topic: value
    });

    const res = await fetch(
      `${BACKEND_URL}/api/topic-question-counts?${params.toString()}`
    );

    if (!res.ok) throw new Error("Failed to fetch counts");

    const data = await res.json();

    // Step 3: update available counts
    setQuiz(prev => {
      const topics = [...prev.topics];

      topics[index].difficulty.easy.available = data.easy || 0;
      topics[index].difficulty.medium.available = data.medium || 0;
      topics[index].difficulty.hard.available = data.hard || 0;

      return { ...prev, topics };
    });

  } catch (err) {
    console.error("Failed to fetch topic counts:", err);
  }
};

  const handleTopicChange = (index, field, value) => {
  setQuiz((prev) => {
    const topics = [...prev.topics];
    const num = Number(value) || 0;

    topics[index][field] = num;
    topics[index].total =
      Number(topics[index].ai || 0) +
      Number(topics[index].db || 0);

    const globalTotal = topics.reduce(
      (sum, t) => sum + (t.total || 0),
      0
    );

    const range = getAllowedRange(prev.year);

    if (range && globalTotal > range.max) {
      alert(
        `Total questions cannot exceed ${range.max} for Year ${prev.year}`
      );
      return prev; // block the update
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

        const res = await fetch(
          `${BACKEND_URL}/api/admin/question-bank/naplan` +
          `?subject=${quiz.subject}` +
          `&year=${quiz.year}` +
          `&center_code=${centerCode}`
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
  const handleGenerateHomeworkExam = async () => {
  if (isGeneratingHomework) return;

  try {
    setIsGeneratingHomework(true);

    if (!isTotalValid) {
      alert("Total questions do not meet NAPLAN requirements.");
      return;
    }

    if (!quiz.topics || quiz.topics.length === 0) {
      alert("Please generate and select topics first.");
      return;
    }

    const payload = {
      class_name: quiz.className,
      subject: quiz.subject,
      year: Number(quiz.year),
      difficulty: quiz.difficulty,
      center_code: centerCode,
      total_questions: totalQuestions,
      num_topics: quiz.topics.length,

      topics: quiz.topics.map(t => ({
        name: t.name,
        total: t.total,
        difficulty: {
          easy: {
            ai: t.difficulty.easy.ai,
            db: t.difficulty.easy.db
          },
          medium: {
            ai: t.difficulty.medium.ai,
            db: t.difficulty.medium.db
          },
          hard: {
            ai: t.difficulty.hard.ai,
            db: t.difficulty.hard.db
          }
        }
      })),
    };

    const response = await fetch(
      `${BACKEND_URL}/api/quizzes-naplan-homework`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Failed to generate homework exam");
    }

    const data = await response.json();

    alert("Homework exam created successfully!");
    console.log(data);

  } catch (error) {
    console.error(error);
    alert(error.message);

  } finally {
    setIsGeneratingHomework(false);
  }
};

  const handleGenerateExam = async () => {
  try {
    // -----------------------------
    // 1️⃣ Frontend validation
    // -----------------------------
    if (!isTotalValid) {
      alert("Total questions do not meet NAPLAN requirements.");
      return;
    }

    if (!quiz.topics || quiz.topics.length === 0) {
      alert("Please generate and select topics first.");
      return;
    }

    // -----------------------------
    // 2️⃣ Build payload (explicit + safe)
    // -----------------------------
    const payload = {
      class_name: quiz.className,      // "naplan"
      subject: quiz.subject,           // "numeracy"
      year: Number(quiz.year),         // 3 or 5
      center_code: centerCode,
      difficulty: quiz.difficulty,     // easy | medium | hard
      total_questions: totalQuestions,
      num_topics: quiz.topics.length,

      topics: quiz.topics.map(t => ({
        name: t.name,
        total: t.total,
        difficulty: {
          easy: {
            ai: t.difficulty.easy.ai,
            db: t.difficulty.easy.db
          },
          medium: {
            ai: t.difficulty.medium.ai,
            db: t.difficulty.medium.db
          },
          hard: {
            ai: t.difficulty.hard.ai,
            db: t.difficulty.hard.db
          }
        }
      })),
    };

    console.log("📤 NAPLAN QUIZ PAYLOAD");
    console.table(payload.topics);
    console.log(payload);

    // -----------------------------
    // 3️⃣ Fetch with strong error visibility
    // -----------------------------
    const response = await fetch(
      `${BACKEND_URL}/api/quizzes-naplan-numeracy`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    // -----------------------------
    // 4️⃣ Backend responded but failed
    // -----------------------------
    if (!response.ok) {
      const text = await response.text();
      console.error("🚨 BACKEND ERROR RESPONSE:", text);

      throw new Error(
        `Backend error (${response.status}): ${text || "Unknown error"}`
      );
    }

    // -----------------------------
    // 5️⃣ Success
    // -----------------------------
    const data = await response.json();
    console.log("✅ QUIZ CREATED:", data);

    alert("NAPLAN exam created successfully!");
  } catch (error) {
    // -----------------------------
    // 6️⃣ Network / CORS / server down
    // -----------------------------
    console.error("❌ QUIZ CREATION FAILED:", error);

    if (error.message === "Failed to fetch") {
      alert(
        "Network error: API unreachable. Check Railway deployment, CORS, or server logs."
      );
    } else {
      alert(error.message);
    }
  }
};


  /* ============================
     Fetch available topics
  ============================ */
  useEffect(() => {
    if (!quiz.subject || !quiz.year || !quiz.difficulty) {
      setAvailableTopics([]);
      return;
    }

    const fetchTopics = async () => {
      try {
        const params = new URLSearchParams({
          subject: quiz.subject,
          year: quiz.year,
          difficulty: quiz.difficulty,
        });
        
        const res = await fetch(
          `${BACKEND_URL}/api/topics-naplan?${params.toString()}`
        );

        if (!res.ok) throw new Error("Failed to fetch topics");

        const data = await res.json();
        console.log("TOPICS FROM API:", data);
        setAvailableTopics(data);
      } catch (err) {
        console.error(err);
        setAvailableTopics([]);
      }
    };

    fetchTopics();
  }, [quiz.subject, quiz.year, quiz.difficulty]);
  /* ============================
   Selected Topics (ADD HERE)
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
        NAPLAN – {quiz.subject.replace("_", " ").toUpperCase()}
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
        value={quiz.subject.replace("_", " ").toUpperCase()}
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

        {availableYears.map((y, index) => {
          const yearValue = typeof y === "object" ? y.year : y;

          return (
            <option key={index} value={yearValue}>
              Year {yearValue}
            </option>
          );
        })}
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
        disabled={!quiz.year || !quiz.difficulty}
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

            {/* Topic Name */}
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
                  (t) =>
                    !selectedTopicNames.includes(t.name) ||
                    t.name === topic.name
                )
                .map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
            </select>

            

            {/* EASY */}
            
            <div style={{ marginLeft: "20px", marginTop: "10px" }}>
              <div className="difficulty-block">
                <div className="difficulty-header">
                  <label>
                    <input
                      type="checkbox"
                      checked={topic.difficulty.easy.enabled}
                      onChange={() =>
                        handleDifficultyToggle(index, "easy")
                      }
                    />
                    Easy
                  </label>
                </div>

                {topic.difficulty.easy.enabled && (
                  <div className="difficulty-grid">
                    <div>
                      <label>Questions Generated by AI</label>
                      <input
                        type="number"
                        min="0"
                        value={topic.difficulty.easy.ai}
                        onChange={(e) =>
                          handleDifficultyInputChange(
                            index,
                            "easy",
                            "ai",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label>
                        Questions from Database{" "}
                        <span style={{ color: "blue", fontSize: "12px" }}>
                          Available in DB: {topic.difficulty.easy.available}
                        </span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={topic.difficulty.easy.db}
                        onChange={(e) =>
                          handleDifficultyInputChange(
                            index,
                            "easy",
                            "db",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            

            {/* MEDIUM */}
            
            <div style={{ marginLeft: "20px", marginTop: "10px" }}>
              <div className="difficulty-block">
                <div className="difficulty-header">
                  <label>
                    <input
                      type="checkbox"
                      checked={topic.difficulty.medium.enabled}
                      onChange={() =>
                        handleDifficultyToggle(index, "medium")
                      }
                    />
                    Medium
                  </label>
                </div>

                {topic.difficulty.medium.enabled && (
                  <div className="difficulty-grid">
                    <div>
                      <label>Questions Generated by AI</label>
                      <input
                        type="number"
                        min="0"
                        value={topic.difficulty.medium.ai}
                        onChange={(e) =>
                          handleDifficultyInputChange(
                            index,
                            "medium",
                            "ai",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label>
                        Questions from Database{" "}
                        <span style={{ color: "blue", fontSize: "12px" }}>
                          Available in DB: {topic.difficulty.medium.available}
                        </span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={topic.difficulty.medium.db}
                        onChange={(e) =>
                          handleDifficultyInputChange(
                            index,
                            "medium",
                            "db",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            

            {/* HARD */}
            <div style={{ marginLeft: "20px", marginTop: "10px" }}>
              <div className="difficulty-block">
                <div className="difficulty-header">
                  <label>
                    <input
                      type="checkbox"
                      checked={topic.difficulty.hard.enabled}
                      onChange={() =>
                        handleDifficultyToggle(index, "hard")
                      }
                    />
                    Hard
                  </label>
                </div>

                {topic.difficulty.hard.enabled && (
                  <div className="difficulty-grid">
                    <div>
                      <label>Questions Generated by AI</label>
                      <input
                        type="number"
                        min="0"
                        value={topic.difficulty.hard.ai}
                        onChange={(e) =>
                          handleDifficultyInputChange(
                            index,
                            "hard",
                            "ai",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label>
                        Questions from Database{" "}
                        <span style={{ color: "blue", fontSize: "12px" }}>
                          Available in DB: {topic.difficulty.hard.available}
                        </span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={topic.difficulty.hard.db}
                        onChange={(e) =>
                          handleDifficultyInputChange(
                            index,
                            "hard",
                            "db",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
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
         Question Bank
      ============================ */}
      <div
        style={{
          marginTop: "15px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
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
            onClick={handleReuseUsedQuestions}
            disabled={!quiz.year || !quiz.difficulty}
            style={{
              backgroundColor:
                !quiz.year || !quiz.difficulty
                  ? "#ccc"
                  : "#0d6efd",

              cursor:
                !quiz.year || !quiz.difficulty
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            Reuse Used Questions
          </button>
        </>
      )}
    {userType === "SUPER_ADMIN" && (
      <>   
        <button
          type="button"
          onClick={handleDeleteAllQuestions}
        >
          Delete All Questions
        </button>
        <div className="section-card">

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
                onClick={handleSearchQuestions_NAPLAN}
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
                  onClick={handleDeleteSingleQuestion_NAPLAN}
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
</>
)}

        {userType !== "SUPER_ADMIN" && (
        <>
          <button
            type="button"
            onClick={handleGenerateExam}
            disabled={
              !quiz.topics.length ||
              !isTotalValid
            }
            style={{
              backgroundColor: isTotalValid ? "#0d6efd" : "#ccc",
              cursor: isTotalValid ? "pointer" : "not-allowed",
            }}
          >
            Create Exam
          </button>

          <button
            type="button"
            onClick={handleGenerateHomeworkExam}
            disabled={
              !quiz.topics.length ||
              !isTotalValid
            }
            style={{
              backgroundColor: isTotalValid ? "#198754" : "#ccc",
              cursor: isTotalValid ? "pointer" : "not-allowed",
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
