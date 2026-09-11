import React, { useState, useEffect } from "react";
import "./QuizSetup.css";


const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";


/* ============================
   Setup OC Thinking Skills
============================ */

export default function QuizSetupOCThinkingSkills({
  userType,
  centerCode,
}) {
  console.log(
    "[QuizSetupOCThinkingSkills] Accessed by userType:",
    userType
  );
  const [availableTopics, setAvailableTopics] = useState([]);
  const MAX_QUESTIONS = 30;
  const [questionBank, setQuestionBank] = useState([]);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [qbLoading, setQbLoading] = useState(false);
  const [availableCounts, setAvailableCounts] = useState({});
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDeleteQuestionSection, setShowDeleteQuestionSection] = useState(false);

  const [totalQuestions, setTotalQuestions] = useState(0);
  const fetchQuestionCounts = async (topicName) => {
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

  const [quiz, setQuiz] = useState({
    className: "oc",
    classYear: "", // ✅ NEW
    subject: "thinking_skills",
    difficulty: "mixed",
    numTopics: 1,
    topics: [],
  });

  /* ============================
     HELPERS
  ============================ */
  const handleResetUsedQuestions = async () => {

  const confirmReset = window.confirm(
    "Are you sure you want to reset used questions for this class, subject, and year?"
  );

  if (!confirmReset) return;

  try {

    const res = await fetch(
      `${BACKEND_URL}/api/admin/reset-used-questions`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({

          class_name: quiz.className,

          subject: quiz.subject,

          class_year: quiz.classYear,

          center_code: centerCode,

        }),
      }
    );

    if (!res.ok) {

      const err = await res.json();

      throw new Error(
        err.detail ||
        "Failed to reset used questions"
      );
    }

    const data = await res.json();

    console.log(
      "Reset success:",
      data
    );

    alert(
      `Reset successful! ${data.deleted_count} question usages removed.`
    );

  } catch (err) {

    console.error(err);

    alert(
      "Error resetting used questions."
    );
  }
};
  const handleSearchQuestions_OC_TS = async () => {
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
      `${BACKEND_URL}/api/admin/search-questions-oc-ts?${params.toString()}`
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
  const handleDeleteSingleQuestion_OC_TS = async () => {
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
      `${BACKEND_URL}/api/admin/delete-question-oc-ts/${selectedQuestionId}`,
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
  const handleCreateHomeworkExam = async () => {
    if (!quiz.classYear) {
      alert("Please select class year.");
      return;
    }

    

    if (quiz.topics.length === 0) {
      alert("Generate topics first.");
      return;
    }

    if (totalQuestions !== MAX_QUESTIONS) {
      alert(`Total must be exactly ${MAX_QUESTIONS}.`);
      return;
    }

    const payload = {
      class_name: quiz.className,
      class_year: quiz.classYear,
      subject: quiz.subject,
      center_code: centerCode,
      difficulty: "mixed",
      num_topics: quiz.topics.length,
      topics: quiz.topics.map((t) => ({
        name: t.name.trim(),
        easy: t.easy,
        medium: t.medium,
        hard: t.hard,
        total: t.total
      })),
    };

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/quizzes/oc-thinking-skills-homework`, // ✅ NEW ENDPOINT
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to save homework exam");

      alert("Homework Exam created successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving homework exam.");
    }
  };

  const getUsedTopicNames = (currentIndex) => {
    return quiz.topics
      .map((t, i) => (i !== currentIndex ? t.name : null))
      .filter(Boolean);
  };

  /* ============================
     HANDLERS
  ============================ */

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuiz((prev) => ({ ...prev, [name]: value }));
  };

  const generateTopics = () => {
    const num = parseInt(quiz.numTopics) || 1;

    const topicsArray = Array.from({ length: num }, () => ({
      name: "",
      easy: { enabled: false, ai: 0, db: 0 },
      medium: { enabled: false, ai: 0, db: 0 },
      hard: { enabled: false, ai: 0, db: 0 },
      total: 0,
    }));;

    setQuiz((prev) => ({ ...prev, topics: topicsArray }));
    setTotalQuestions(0);
  };

  const toggleDifficulty = (index, level) => {
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
  const handleDifficultyChange = (index, level, field, value) => {
  setQuiz((prev) => {
    const topics = [...prev.topics];
    const num = Number(value) || 0;

    const topic = topics[index];

    topics[index] = {
      ...topic,
      [level]: {
        ...topic[level],
        [field]: num
      }
    };

    const t = topics[index];

    t.total =
      t.easy.ai + t.easy.db +
      t.medium.ai + t.medium.db +
      t.hard.ai + t.hard.db;

    const grandTotal = topics.reduce(
      (sum, item) => sum + item.total,
      0
    );

    setTotalQuestions(grandTotal);

    return { ...prev, topics };
  });
};

  const handleTopicNameChange = (index, value) => {
    setQuiz((prev) => {
      const topics = [...prev.topics];
      topics[index].name = value;

      // fetch counts when topic selected
      if (value) {
        fetchQuestionCounts(value);
      }
      return { ...prev, topics };
    });
  };

  /* ============================
     QUESTION BANK
  ============================ */

  const handleViewQuestionBank = async () => {
  if (!quiz.classYear || quiz.classYear.toString().trim() === "") {
    alert("Please select class year first.");
    return;
  }

  try {
    setQbLoading(true);

    console.log("🚨 DEBUG PARAMS:");
    console.log("class_name:", quiz.className);
    console.log("class_year:", quiz.classYear);
    console.log("subject:", quiz.subject);

    const params = new URLSearchParams({
      class_name: quiz.className?.trim() || "",
      class_year: quiz.classYear?.toString().trim() || "",
      subject: quiz.subject?.trim() || "",
      center_code: centerCode || "",
    });

    const url = `${BACKEND_URL}/api/admin/question-bank-oc-thinking-skills?${params.toString()}`;

    console.log("🌐 FINAL URL:", url);

    const res = await fetch(url);

    if (!res.ok) {
      const errText = await res.text();
      console.error("❌ API ERROR RESPONSE:", errText);
      throw new Error("Failed to load question bank");
    }

    const data = await res.json();

    console.log("📚 Question Bank Response:", data);

    setQuestionBank(data);
    setShowQuestionBank(true);
  } catch (err) {
    console.error("❌ Question bank fetch error:", err);
    alert("Failed to fetch question bank data.");
  } finally {
    setQbLoading(false);
  }
};
  const handleDeletePreviousQuestions = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete all previous OC Thinking Skills questions?"
    );

    if (!confirmDelete) return;

    fetch(
      `${BACKEND_URL}/api/admin/delete-previous-questions-OC-TS`,
      { method: "DELETE" }
    )
      .then((res) => res.json())
      .then((data) => {

        console.log("DELETE RESPONSE:", data);

        alert(
          `${data.message}\n\nDeleted ${data.deleted_count} questions.`
        );

      })
      .catch((err) => {
        console.error(err);
        alert("Error deleting questions.");
      });
  };

  /* ============================
     FETCH TOPICS
  ============================ */

  useEffect(() => {
  console.log("TOPIC useEffect triggered");
  console.log("className:", quiz.className);
  console.log("classYear:", quiz.classYear);
  console.log("subject:", quiz.subject);
  console.log("difficulty:", quiz.difficulty);

  if (
    !quiz.className ||
    !quiz.classYear ||
    !quiz.subject 
    
  ) {
    console.log("Blocked: missing required values");
    setAvailableTopics([]);
    return;
  }

  const fetchTopics = async () => {
    try {
      const params = new URLSearchParams({
        class_name: quiz.className,
        class_year: quiz.classYear,
        subject: quiz.subject,
        
      });

      const url = `${BACKEND_URL}/api/topics?${params.toString()}`;

      console.log("Calling:", url);

      const res = await fetch(url);

      console.log("Status:", res.status);

      const data = await res.json();

      console.log("Topics:", data);

      setAvailableTopics(data);
    } catch (error) {
      console.error(error);
      setAvailableTopics([]);
    }
  };

  fetchTopics();
}, [
  quiz.className,
  quiz.classYear,
  quiz.subject,
  
]);

  /* ============================
     SUBMIT
  ============================ */

  const handleSubmit = async (e) => {
    e.preventDefault();

    

    if (quiz.topics.length === 0) {
      alert("Generate topics first.");
      return;
    }

    if (totalQuestions !== MAX_QUESTIONS) {
     alert(`Total must be exactly ${MAX_QUESTIONS}.`);
     return;
   }
    

    const payload = {
      class_name: quiz.className,
      class_year: quiz.classYear,   // ✅ ADD HERE
      subject: quiz.subject,
      center_code: centerCode,
      difficulty: "mixed",
      num_topics: quiz.topics.length,
      topics: quiz.topics.map((t) => ({
        name: t.name.trim(),
        easy: t.easy,
        medium: t.medium,
        hard: t.hard,
        total: t.total
      })),
    };

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/quizzes/oc-thinking-skills`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to save quiz");

      alert("OC Thinking Skills Quiz created!");
    } catch (err) {
      console.error(err);
      alert("Error saving quiz.");
    }
  };

  /* ============================
     UI
  ============================ */

  return (
    <div className="quiz-setup-container">
      <form onSubmit={handleSubmit}>
        <label>Class:</label>
        <input type="text" value="OC" readOnly />
        <label>Class Year:</label>
        <select
          name="classYear"
          value={quiz.classYear}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Year</option>
          <option value="3">Year 3</option>
          <option value="4">Year 4</option>
          
        </select>

        <label>Subject:</label>
        <input type="text" value="Thinking Skills" readOnly />

        

        <label>Number of Topics:</label>
        <input
          type="number"
          name="numTopics"
          min="1"
          value={quiz.numTopics}
          onChange={handleInputChange}
        />

        <div className="button-row">

        {userType !== "SUPER_ADMIN" && (
          <>
            <button
              type="button"
              onClick={generateTopics}
            >
              Generate Topics
            </button>

            <button
              type="button"
              onClick={handleViewQuestionBank}
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

      </div>

        {userType === "SUPER_ADMIN" && (
          <div style={{ marginTop: "20px" }}>
            <button
              type="button"
              onClick={handleDeletePreviousQuestions}
            >
              Delete All Questions
            </button>
          </div>
        )}
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
                    onClick={handleSearchQuestions_OC_TS}
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
                      onClick={handleDeleteSingleQuestion_OC_TS}
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

        {/* Question Bank */}
        {showQuestionBank && (
          <div className="question-bank">
            <h3>OC Thinking Skills Question Bank</h3>

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

        {/* Topics */}
        <div className="topics-container">
          {quiz.topics.map((topic, index) => (
            <div key={index} className="topic">
              <h4>Topic {index + 1}</h4>

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
                      !getUsedTopicNames(index).includes(t.name)
                  )
                  .map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name}
                    </option>
                  ))}
              </select>

              {/* EASY */}
              <div className="difficulty-block">
                <label>
                  <input
                    type="checkbox"
                    checked={topic.easy.enabled}
                    onChange={() => toggleDifficulty(index, "easy")}
                  />
                  Easy
                </label>

                {topic.easy.enabled && (
                  <div className="grid-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="AI"
                      value={topic.easy.ai}
                      onChange={(e) =>
                        handleDifficultyChange(index, "easy", "ai", e.target.value)
                      }
                    />

                    <div>
                      <label>
                        DB
                        <div style={{ color: "blue", fontSize: "12px" }}>
                          Available: {availableCounts[topic.name]?.easy ?? "-"}
                        </div>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={topic.easy.db}
                        onChange={(e) =>
                          handleDifficultyChange(index, "easy", "db", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* MEDIUM */}
              <div className="difficulty-block">
                <label>
                  <input
                    type="checkbox"
                    checked={topic.medium.enabled}
                    onChange={() => toggleDifficulty(index, "medium")}
                  />
                  Medium
                </label>

                {topic.medium.enabled && (
                  <div className="grid-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="AI"
                      value={topic.medium.ai}
                      onChange={(e) =>
                        handleDifficultyChange(index, "medium", "ai", e.target.value)
                      }
                    />
                    <div>
                      <label>
                        DB
                        <div style={{ color: "blue", fontSize: "12px" }}>
                          Available: {availableCounts[topic.name]?.medium ?? "-"}
                        </div>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={topic.medium.db}
                        onChange={(e) =>
                          handleDifficultyChange(index, "medium", "db", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* HARD */}
              <div className="difficulty-block">
                <label>
                  <input
                    type="checkbox"
                    checked={topic.hard.enabled}
                    onChange={() => toggleDifficulty(index, "hard")}
                  />
                  Hard
                </label>

                {topic.hard.enabled && (
                  <div className="grid-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="AI"
                      value={topic.hard.ai}
                      onChange={(e) =>
                        handleDifficultyChange(index, "hard", "ai", e.target.value)
                      }
                    />

                   <div>
                    <label>
                      DB
                      <div style={{ color: "blue", fontSize: "12px" }}>
                        Available: {availableCounts[topic.name]?.hard ?? "-"}
                      </div>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={topic.hard.db}
                      onChange={(e) =>
                        handleDifficultyChange(index, "hard", "db", e.target.value)
                      }
                    />
                  </div>
                  </div>
                )}
              </div>

              {/* TOPIC TOTAL */}
              <div style={{ marginTop: "8px", fontWeight: "bold" }}>
                Topic Total: {topic.total}
              </div>
            </div>
          ))}
        </div>

        <h3>
           Total: {totalQuestions} / {MAX_QUESTIONS}
         </h3>

        {userType !== "SUPER_ADMIN" && (
          <div className="button-row final-actions">

            <button
              type="submit"
              disabled={totalQuestions > MAX_QUESTIONS}
            >
              Create Exam
            </button>

            <button
              type="button"
              onClick={handleCreateHomeworkExam}
              disabled={totalQuestions > MAX_QUESTIONS}
            >
              Create Exam (Homework)
            </button>

          </div>
        )}
      </form>
    </div>
  );
}
