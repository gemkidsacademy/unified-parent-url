import React, { useState, useEffect } from "react";
import "./QuizSetup.css";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";


export default function QuizSetup_OC_MathematicalReasoning({
  userType,
  centerCode,
}) {
  const [availableTopics, setAvailableTopics] = useState([]);
  const [questionBank, setQuestionBank] = useState([]);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [qbLoading, setQbLoading] = useState(false);
  const [availableCounts, setAvailableCounts] = useState({});
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDeleteQuestionSection, setShowDeleteQuestionSection] = useState(false);

  const [quiz, setQuiz] = useState({
    className: "oc", // ✅ OC
    subject: "mathematical_reasoning", // ⚠️ keep consistent with backend
    classYear: "",
    numTopics: 1,
    topics: [],
  });
  const handleSearchQuestions_OC_MR = async () => {
  if (!searchText.trim()) {
    alert("Please enter search text.");
    return;
  }

  if (!quiz.classYear) {
    alert("Please select class year.");
    return;
  }

  try {
    setSearchLoading(true);

    const params = new URLSearchParams({
      query: searchText,
      class_year: quiz.classYear,
    });

    const res = await fetch(
      `${BACKEND_URL}/api/admin/search-questions-oc-mr?${params.toString()}`
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
  const handleDeleteSingleQuestion_OC_MR = async () => {
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
      `${BACKEND_URL}/api/admin/delete-question-oc-mr/${selectedQuestionId}`,
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
  const fetchQuestionCounts_OC_MR = async (topicName) => {
  try {
    const params = new URLSearchParams({
      topic: topicName,
      class_year: quiz.classYear,
      class_name: quiz.className,
      subject: quiz.subject,
      center_code: centerCode,
    });

    const res = await fetch(
      `${BACKEND_URL}/api/question-count?${params.toString()}`
    );

    const data = await res.json();

    setAvailableCounts(prev => ({
      ...prev,
      [topicName]: data
    }));

  } catch (err) {
    console.error(err);
  }
};

  const [totalQuestions, setTotalQuestions] = useState(0);
  const toggleDifficulty_OC_MR = (index, level) => {
  setQuiz((prev) => {
    const topics = [...prev.topics];

    const currentTopic = topics[index];
    const currentLevel = currentTopic[level];

    const newEnabled = !currentLevel.enabled;

    topics[index] = {
      ...currentTopic,
      [level]: {
        ...currentLevel,
        enabled: newEnabled,
        ai: newEnabled ? currentLevel.ai : 0,
        db: newEnabled ? currentLevel.db : 0
      }
    };

    return { ...prev, topics };
  });
};

  const getUsedTopicNames_OC_MR = (currentIndex) => {
    return quiz.topics
      .map((t, i) => (i !== currentIndex ? t.name : null))
      .filter(Boolean);
  };

  /* ============================
     HANDLERS
  ============================ */

  const handleDeleteAllQuestions_OC_MR = async () => {
  const confirmed = window.confirm(
    "Delete ALL OC Mathematical Reasoning questions?"
  );

  if (!confirmed) return;

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/admin/delete-all-questions-OC-MR`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await res.json();

    console.log("DELETE RESPONSE:", data);

    if (!res.ok) {
      throw new Error(
        data.error || "Failed"
      );
    }

    if (data.error) {
      alert(data.error);
      return;
    }

    alert(
      `${data.message}\n\nDeleted ${data.deleted_count} questions.`
    );

  } catch (err) {

    console.error(err);

    alert(
      err.message ||
      "Error deleting questions"
    );
  }
};

  const handleViewQuestionBank_OC_MR = async () => {
  try {
    if (!quiz.classYear) {
      alert("Please select class year first");
      return;
    }

    setQbLoading(true);

    const params = new URLSearchParams({
      class_name: quiz.className,
      subject: quiz.subject,
      class_year: quiz.classYear,
      center_code: centerCode,
    });

    const res = await fetch(
      `${BACKEND_URL}/api/admin/question-bank-oc-mathematical-reasoning?${params.toString()}`
    );

    if (!res.ok) throw new Error("Failed");

    const data = await res.json();
    setQuestionBank(data);
    setShowQuestionBank(true);
  } catch (err) {
    console.error(err);
    alert("Failed to fetch question bank");
  } finally {
    setQbLoading(false);
  }
};
const handleResetUsedQuestions = async () => {
  if (!quiz.classYear) {
    alert("Please select class year first");
    return;
  }

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/admin/reset-used-questions-oc-mr`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          class_year: quiz.classYear, // "Year 4"
          center_code: centerCode,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error(err);
      throw new Error(err.detail || "Failed to reset used questions");
    }

    const data = await res.json();

    alert(`✅ ${data.reset_count} questions reset for class ${data.class_year}`);
  } catch (err) {
    console.error(err);
    alert("❌ Error resetting used questions");
  }
};
  const handleInputChange_OC_MR = (e) => {
    const { name, value } = e.target;
    setQuiz((prev) => ({ ...prev, [name]: value }));
  };

  const generateTopics_OC_MR = () => {
    const num = parseInt(quiz.numTopics) || 1;

    const topicsArray = Array.from({ length: num }, () => ({
      name: "",
      easy: { enabled: false, ai: 0, db: 0 },
      medium: { enabled: false, ai: 0, db: 0 },
      hard: { enabled: false, ai: 0, db: 0 },
      total: 0,
    }));

    setQuiz((prev) => ({ ...prev, topics: topicsArray }));
    setTotalQuestions(0);
  };

  const handleDifficultyChange_OC_MR = (index, difficulty, field, value) => {
  setQuiz((prev) => {
    const topics = [...prev.topics];
    const numValue = Number(value) || 0;

    topics[index][difficulty][field] =
      field === "enabled" ? value : numValue;

    // recalc topic total
    const t = topics[index];

    const total =
      (t.easy.enabled ? t.easy.ai + t.easy.db : 0) +
      (t.medium.enabled ? t.medium.ai + t.medium.db : 0) +
      (t.hard.enabled ? t.hard.ai + t.hard.db : 0);

    t.total = total;

    // global total
    const globalTotal = topics.reduce((sum, t) => sum + t.total, 0);
    setTotalQuestions(globalTotal);

    return { ...prev, topics };
  });
};

  const handleTopicNameChange_OC_MR = (index, value) => {
    setQuiz((prev) => {
      const topics = [...prev.topics];
      topics[index].name = value;

      if (value) {
        fetchQuestionCounts_OC_MR(value);
      }

      return { ...prev, topics };
    });
  };
  /* ============================
    HELPER: DB COUNT
  ============================ */
  const getDBCount = (topicName, difficulty) => {
    const row = questionBank.find(
      (q) =>
        q.topic === topicName &&
        q.difficulty.toLowerCase() === difficulty
    );
    return row ? row.total_questions : 0;
  };
  /* ============================
     FETCH TOPICS
  ============================ */

  useEffect(() => {
    
    

    const fetchTopics_OC_MR = async () => {
      try {
        if (!quiz.classYear) {
          setAvailableTopics([]);
          return;
        }

        const params = new URLSearchParams({
          class_name: quiz.className,
          subject: quiz.subject,
          class_year: quiz.classYear,   // ✅ added
        });

        console.log("📤 Fetching topics with params:", params.toString());

        const res = await fetch(
          `${BACKEND_URL}/api/topic/oc/math?${params.toString()}`
        );

        if (!res.ok) throw new Error("Failed");

        const data = await res.json();

        console.log("📥 Topics received:", data);

        setAvailableTopics(data);
      } catch (err) {
        console.error(err);
        setAvailableTopics([]);
      }
    };

    fetchTopics_OC_MR();
  }, [quiz.className, quiz.subject, quiz.classYear]);

  /* ============================
     SUBMIT
  ============================ */
  const handleSubmitHomework_OC_MR = async () => {
  

  if (!quiz.classYear) {
    alert("Select class year");
    return;
  }

  if (quiz.topics.length === 0) {
    alert("Generate topics first");
    return;
  }

  if (totalQuestions !== 35) {
    alert("Total must be 35");
    return;
  }

  const payload = {
    class_name: quiz.className,
    subject: quiz.subject,
    class_year: quiz.classYear, // ✅ included
    center_code: centerCode,
    difficulty: "mixed",
    num_topics: quiz.topics.length,
    topics: quiz.topics.map((t) => ({
      name: t.name.trim(),
      easy: t.easy,
      medium: t.medium,
      hard: t.hard,
      total: t.total,
    })),
  };

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/quizzes/oc-mathematical-reasoning-homework`, // ✅ NEW ENDPOINT
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error(err);
      throw new Error("Failed");
    }

    await res.json();
    alert("OC Mathematical Reasoning Homework created!");
  } catch (err) {
    console.error(err);
    alert("Error saving homework");
  }
};
  const handleSubmit_OC_MR = async (e) => {
  e.preventDefault();

  

  if (!quiz.classYear) {
    alert("Select class year");   // ✅ add this validation
    return;
  }

  if (quiz.topics.length === 0) {
    alert("Generate topics first");
    return;
  }

  if (totalQuestions !== 35) {
    alert("Total must be 35");
    return;
  }

  const payload = {
    class_name: quiz.className,
    subject: quiz.subject,
    class_year: quiz.classYear,   // ✅ THIS IS THE FIX
    center_code: centerCode,
    difficulty: "mixed",
    num_topics: quiz.topics.length,
    topics: quiz.topics.map((t) => ({
    name: t.name.trim(),
    easy: t.easy,
    medium: t.medium,
    hard: t.hard,
    total: t.total,
  })),
  };

  console.log("📤 Sending quiz payload:", payload); // ✅ debug

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/quizzes/oc-mathematical-reasoning`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error(err);
      throw new Error("Failed");
    }

    await res.json();
    alert("OC Mathematical Reasoning exam created!");
  } catch (err) {
    console.error(err);
    alert("Error saving exam");
  }
};
  /* ============================
     RENDER
  ============================ */

  return (
    <div className="quiz-setup-container">
      <form onSubmit={handleSubmit_OC_MR}>

        <label>Class:</label>
        <input type="text" value="OC" disabled />

        <label>Subject:</label>
        <input type="text" value="Mathematical Reasoning" disabled />
        <label>Class Year:</label>
        <select
          name="classYear"
          value={quiz.classYear || ""}
          onChange={handleInputChange_OC_MR}
          required
        >
          <option value="">Select Class Year</option>
          <option value="3">Year 3</option>
          <option value="4">Year 4</option>
          
        </select>

        

        <label>Number of Topics:</label>
        <input
          type="number"
          name="numTopics"
          min="1"
          value={quiz.numTopics}
          onChange={handleInputChange_OC_MR}
        />

        <div className="button-row">

          {userType !== "SUPER_ADMIN" && (
            <>
              <button
                type="button"
                onClick={generateTopics_OC_MR}
              >
                Generate Topics
              </button>

              <button
                type="button"
                onClick={handleViewQuestionBank_OC_MR}
              >
                View Question Bank
              </button>

              <button
                type="button"
                onClick={handleResetUsedQuestions}
              >
                Reset Used Questions
              </button>
            </>
          )}

          {userType === "SUPER_ADMIN" && (
            <button
              type="button"
              onClick={handleDeleteAllQuestions_OC_MR}
            >
              Delete All Questions
            </button>
          )}

        </div>
      {userType === "SUPER_ADMIN" && (  
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
                      onClick={handleSearchQuestions_OC_MR}
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
                        onClick={handleDeleteSingleQuestion_OC_MR}
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
        )}     
        {showQuestionBank && (
          <div className="question-bank">
            <h3>OC Mathematical Reasoning Question Bank</h3>

            {qbLoading ? (
              <p>Loading...</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Difficulty</th>
                    <th>Topic</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {questionBank.map((row, idx) => (
                    <tr key={idx}>
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

        <div className="topics-container">
          {quiz.topics.map((topic, index) => (
            <div
              className="topic-card"
              key={index}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "15px",
                marginBottom: "15px",
                backgroundColor: "#fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
              }}
            >
              <h4 style={{ marginBottom: "10px", color: "#333" }}>
                Topic {index + 1}
              </h4>
              <div style={{ marginBottom: "10px" }}>
              <select
                value={topic.name}
                onChange={(e) =>
                  handleTopicNameChange_OC_MR(index, e.target.value)
                }
                required
              >
              
                <option value="">Select topic</option>
                {availableTopics
                  .filter(
                    (t) =>
                      !getUsedTopicNames_OC_MR(index).includes(t.name)
                  )
                  .map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name}
                    </option>
                  ))}
              </select>
              </div>

              {["easy", "medium", "hard"].map((level) => (
                <div key={level} style={{ marginTop: "5px" }}>

                  <label style={{ display: "block" }}>
                    <input
                      type="checkbox"
                      checked={topic[level].enabled}
                      onChange={() => toggleDifficulty_OC_MR(index, level)}
                    />
                    {" "}{level.charAt(0).toUpperCase() + level.slice(1)}
                  </label>

                  {topic[level].enabled && (
                    <div
                      style={{
                        marginTop: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px"
                      }}
                    >

                      {/* AI INPUT */}
                      <input
                        type="number"
                        min="0"
                        value={topic[level].ai}
                        onChange={(e) =>
                          handleDifficultyChange_OC_MR(
                            index,
                            level,
                            "ai",
                            e.target.value
                          )
                        }
                        style={{ width: "200px" }}   // ✅ wider like TS
                      />

                      {/* DB LABEL */}
                      <span style={{ fontSize: "12px" }}>
                        DB <span style={{ color: "blue" }}>
                          Available: {availableCounts[topic.name]?.[level] ?? 0}
                        </span>
                      </span>

                      {/* DB INPUT */}
                      <input
                        type="number"
                        min="0"
                        value={topic[level].db}
                        onChange={(e) =>
                          handleDifficultyChange_OC_MR(
                            index,
                            level,
                            "db",
                            e.target.value
                          )
                        }
                        style={{ width: "200px" }}   // ✅ match width
                      />

                    </div>
                  )}
                </div>
              ))}
              <p
                style={{
                  fontWeight: "bold",
                  marginTop: "12px",
                  paddingTop: "8px",
                  borderTop: "1px solid #eee"
                }}
              >
                Topic Total: {topic.total}
              </p>
            </div>
          ))}
        </div>

        <h3>Total Questions: {totalQuestions} / 35</h3>

        {userType !== "SUPER_ADMIN" && (
          <>
            <button
              type="submit"
              disabled={totalQuestions !== 35}
            >
              Create OC Mathematical Reasoning Exam
            </button>

            <button
              type="button"
              onClick={handleSubmitHomework_OC_MR}
              disabled={totalQuestions !== 35}
              style={{
                marginTop: "10px",
                backgroundColor: "#28a745",
                color: "white"
              }}
            >
              Create OC Mathematical Reasoning (Homework)
            </button>
          </>
        )}
      </form>
    </div>
  );
}
