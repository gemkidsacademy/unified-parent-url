
  import React, { useState, useEffect } from "react";

  import "./QuizSetup.css";

  
  const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"; 
    /* ============================
      this is helping setup Thinking skills
    ============================ */


  export default function QuizSetup({
    userType,
    centerCode
  }) {
     console.log(
      "[QuizSetup] Accessed by userType:",
      userType
    );
    const [availableTopics, setAvailableTopics] = useState([]);
    const [availableCounts, setAvailableCounts] = useState({});
    const [questionBank, setQuestionBank] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedQuestionId, setSelectedQuestionId] = useState("");
    const [searchLoading, setSearchLoading] = useState(false);
    const [showQuestionBank, setShowQuestionBank] = useState(false);
    const [showDeleteQuestionSection, setShowDeleteQuestionSection] = useState(false);
    const [qbLoading, setQbLoading] = useState(false);
    const validateQuizBeforeSubmit = () => {
    if (!quiz.className || !quiz.subject) {
      alert("Please select class and subject.");
      return false;
    }

    if (quiz.topics.length === 0) {
      alert("Please generate at least one topic.");
      return false;;
    }

    for (const topic of quiz.topics) {
      const hasDifficulty =
        topic.easy.enabled ||
        topic.medium.enabled ||
        topic.hard.enabled;

      if (!hasDifficulty) {
        alert(
          `Please select at least one difficulty for topic: ${topic.name || "Unnamed Topic"}`
        );
        return;
      }
    }

    if (totalQuestions > 40) {
      alert("Total questions cannot exceed 40.");
      return false;
    }

    return true;
  };
  const handleSearchQuestions = async () => {
  if (!searchText.trim()) {
    alert("Please enter search text.");
    return;
  }

  try {
    setSearchLoading(true);

    const params = new URLSearchParams({
      query: searchText,
      class_year: quiz.classYear,
    });

    const res = await fetch(
      `${BACKEND_URL}/api/admin/search-questions-selective-ts?${params.toString()}`
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


const handleDeleteSingleQuestion = async () => {
  if (!selectedQuestionId) {
    alert("Please select a question.");
    return;
  }

  const confirmDelete = window.confirm(
    `Are you sure you want to delete question ID ${selectedQuestionId}?`
  );

  if (!confirmDelete) return;

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/admin/delete-question-selective-ts/${selectedQuestionId}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Failed to delete question");
    }

    const data = await res.json();

    alert(data.message);

    // remove deleted question from UI
    setSearchResults((prev) =>
      prev.filter((q) => q.id !== Number(selectedQuestionId))
    );

    setSelectedQuestionId("");

  } catch (err) {
    console.error(err);
    alert("Error deleting question.");
  }
};
  const fetchQuestionCounts = async (
  topicName
) => {

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

    if (!res.ok) {

      throw new Error(
        "Failed to fetch question counts"
      );
    }

    const data = await res.json();

    setAvailableCounts((prev) => ({

      ...prev,

      [topicName]: data

    }));

  } catch (err) {

    console.error(err);
  }
};
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
    const handleTopicNameChange = (index, value) => {
    setQuiz((prev) => {
      const topics = [...prev.topics];
      topics[index].name = value;
      return { ...prev, topics };
    });

    // Fetch all difficulty counts in one call
    if (value) {
      fetchQuestionCounts(value);
    }
  };
    const getUsedTopicNames = (currentIndex) => {
    return quiz.topics
      .map((t, i) => (i !== currentIndex ? t.name : null))
      .filter(Boolean);
  };


    

    const [totalQuestions, setTotalQuestions] = useState(0);
    const [quiz, setQuiz] = useState({
        className: "selective",
        subject: "thinking_skills",
        classYear: 5, 
        difficulty: "",
        numTopics: 1,
        topics: [],
      });

    const handleInputChange = (e) => {
    const { name, value } = e.target;

    setQuiz((prev) => ({
      ...prev,
      [name]: name === "classYear" ? Number(value) : value
    }));
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
      // 🔥 Fetch count when enabled
      if (newEnabled && currentTopic.name) {
        fetchQuestionCounts(currentTopic.name);
      }

      return {
        ...prev,
        topics
      };
    });
  };
    const handleDifficultyChange = (
    index,
    level,
    field,
    value
  ) => {
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

    const generateTopics = () => {
      const num = parseInt(quiz.numTopics) || 1;

      const topicsArray = Array.from({ length: num }, () => ({
        name: "",
        easy: { enabled: false, ai: 0, db: 0 },
        medium: { enabled: false, ai: 0, db: 0 },
        hard: { enabled: false, ai: 0, db: 0 },
        total: 0
      }));


      setQuiz((prev) => ({ ...prev, topics: topicsArray }));
      setTotalQuestions(0);
    };

      
    const handleViewQuestionBank = async () => {

  try {

    setQbLoading(true);

    const params = new URLSearchParams({
      class_year: quiz.classYear,
      center_code: centerCode,
    });

    const res = await fetch(
      `${BACKEND_URL}/api/admin/question-bank-thinking-skills?${params.toString()}`
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

    console.error(err);

    alert(
      "Failed to fetch question bank data."
    );

  } finally {

    setQbLoading(false);
  }
};


    const handleDeletePreviousQuestions = async () => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete all previous questions?"
  );

  if (!confirmDelete) return;

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/admin/delete-previous-questions-TS`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.detail || "Failed to delete questions"
      );
    }

    alert(
      `✅ Previous questions deleted successfully.\n\n` +
      `Questions Deleted: ${data.questions_deleted}`
    );

  } catch (err) {
    console.error(err);

    alert(
      err.message ||
      "Error deleting questions."
    );
  }
};
    

    

    useEffect(() => {
    // Do not fetch until difficulty is selected
    if (!quiz.className || !quiz.subject) {
      setAvailableTopics([]);
      return;
    }

    const fetchTopics = async () => {
      try {
        const params = new URLSearchParams({
          class_name: quiz.className,
          subject: quiz.subject,
          class_year: quiz.classYear,  
          
        });

        const res = await fetch(
          `${BACKEND_URL}/api/topics?${params.toString()}`
          
        );

        if (!res.ok) {
          throw new Error("Failed to load topics");
        }

        const data = await res.json();
        setAvailableTopics(data);
      } catch (err) {
        console.error("Failed to fetch topics", err);
        setAvailableTopics([]);
      }
    };

    fetchTopics();
  }, [quiz.className, quiz.subject, quiz.classYear]);

      
    const handleSubmit = async (e) => {
      e.preventDefault();

      if(!quiz.className || !quiz.subject) {
        alert("Please select class and subject.");
        return;
      }

      if (quiz.topics.length === 0) {
        alert("Please generate at least one topic.");
        return false;;
      }

      for (const topic of quiz.topics) {
        const hasDifficulty =
          topic.easy.enabled ||
          topic.medium.enabled ||
          topic.hard.enabled;

        if (!hasDifficulty) {
          alert(
            `Please select at least one difficulty for topic: ${topic.name || "Unnamed Topic"}`
          );
          return;
        }
      }

      if (totalQuestions > 40) {
        alert("Total questions cannot exceed 40.");
        return;
      }

      const payload = {
        class_name: quiz.className.trim(),
        subject: quiz.subject.trim(),
        class_year: Number(quiz.classYear),
        center_code: centerCode,
        num_topics: quiz.topics.length,
        topics: quiz.topics.map((t) => ({
          name: t.name.trim(),
          easy: {
            enabled: t.easy.enabled,
            ai: Number(t.easy.ai),            // ✅ fix 2
            db: Number(t.easy.db)
          },
          medium: {
            enabled: t.medium.enabled,
            ai: Number(t.medium.ai),
            db: Number(t.medium.db)
          },
          hard: {
            enabled: t.hard.enabled,
            ai: Number(t.hard.ai),
            db: Number(t.hard.db)
          },
          total: Number(t.total)              // ✅ fix 3
        })),
      };

      try {
        const res = await fetch(
          `${BACKEND_URL}/api/quizzes`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!res.ok) {
          const err = await res.json();
          console.error("Backend returned:", err);
          throw new Error("Failed to save quiz setup");
        }

        const data = await res.json();
        console.log("Quiz saved:", data);
        alert("Quiz setup saved successfully!");
      } catch (error) {
        console.error(error);
        alert("Error saving quiz setup. Please try again.");
      }
    };

    return (
    <div className="quiz-setup-container">
      <div className="quiz-card">
        <h1 className="page-title">Thinking Skills Exam Setup</h1>

        <form onSubmit={handleSubmit}>
    <div className="section-card">
      <h2>Exam Information</h2>

      <div className="grid-2">
        <div>
          <label>Class</label>
          <input
            type="text"
            value="Selective"
            readOnly
          />
        </div>

        <div>
          <label>Subject</label>
          <input
            type="text"
            value="Thinking Skills"
            readOnly
          />
        </div>

        <div>
          <label>Class Year</label>
          <select
            name="classYear"
            value={quiz.classYear}
            onChange={handleInputChange}
            required
          >
            <option value={4}>Year 4</option>
            <option value={5}>Year 5</option>
            <option value={6}>Year 6</option>
          </select>
        </div>
      </div>
    </div>

          

          <div className="section-card">

            <h2>Topic Controls</h2>

            <label>Number of Topics</label>

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

          </div>
          {userType === "SUPER_ADMIN" && (
          <div className="section-card">

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
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

            <div className="grid-2">
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
                  onClick={handleSearchQuestions}
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
                        ID {q.id} | {q.topic} | {q.preview?.slice(0, 80)}
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
                    onClick={handleDeleteSingleQuestion}
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
        </>
        )}
    </div>
  )}
  
        {showQuestionBank && (
              <div className="question-bank">
                <h3>Question Bank (Thinking Skills)</h3>
            
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


          <div className="topics-container">
            {quiz.topics.map((topic, index) => (
              <div className="topic-card" key={index}>
                <h4>Topic {index + 1}</h4>

                <label>Topic Name</label>
                <select
                  value={topic.name}
                  onChange={(e) =>
                    handleTopicNameChange(index, e.target.value)
                  }
                  required
                >
                  <option value="">Select a topic</option>

                  {availableTopics
                    .filter(
                      (t) =>
                        !getUsedTopicNames(index).includes(t.name)
                    )
                    .map((t) => (
                      <option
                        key={t.id || t.name}
                        value={t.name}
                      >
                        {t.name}
                      </option>
                    ))}
                </select>

                <div className="difficulty-block">
                  <label>
                    <input
                      type="checkbox"
                      checked={topic.easy.enabled}
                      onChange={() =>
                        toggleDifficulty(index, "easy")
                      }
                    />
                    Easy
                  </label>

                  {topic.easy.enabled && (
                    <div className="grid-2">
                      <div>
                        <label>Questions Generated by AI</label>
                        <input
                          type="number"
                          min="0"
                          value={topic.easy.ai}
                          onChange={(e) =>
                            handleDifficultyChange(
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
                          Questions from Database
                          <div style={{ color: "blue", fontSize: "13px" }}>
                            Available in DB: {availableCounts[topic.name]?.easy ?? "-"}
                          </div>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={topic.easy.db}
                          onChange={(e) =>
                            handleDifficultyChange(
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

                <div className="difficulty-block">
                  <label>
                    <input
                      type="checkbox"
                      checked={topic.medium.enabled}
                      onChange={() =>
                        toggleDifficulty(index, "medium")
                      }
                    />
                    Medium
                  </label>

                  {topic.medium.enabled && (
                    <div className="grid-2">
                      <div>
                        <label>Questions Generated by AI</label>
                        <input
                          type="number"
                          min="0"
                          value={topic.medium.ai}
                          onChange={(e) =>
                            handleDifficultyChange(
                              index,
                              "medium",
                              "ai",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>

                      <div>
                        <label>
                          Questions from Database
                          <div style={{ color: "blue", fontSize: "13px" }}>
                            Available in DB: {availableCounts[topic.name]?.medium ?? "-"}
                          </div>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={topic.medium.db}
                          onChange={(e) =>
                            handleDifficultyChange(
                              index,
                              "medium",
                              "db",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="difficulty-block">
                  <label>
                    <input
                      type="checkbox"
                      checked={topic.hard.enabled}
                      onChange={() =>
                        toggleDifficulty(index, "hard")
                      }
                    />
                    Hard
                  </label>

                  {topic.hard.enabled && (
                    <div className="grid-2">
                      <div>
                        <label>Questions Generated by AI</label>
                        <input
                          type="number"
                          min="0"
                          value={topic.hard.ai}
                          onChange={(e) =>
                            handleDifficultyChange(
                              index,
                              "hard",
                              "ai",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>

                      <div>
                        <label>
                          Questions from Database
                          <div style={{ color: "blue", fontSize: "13px" }}>
                            Available in DB: {availableCounts[topic.name]?.hard ?? "-"}
                          </div>
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={topic.hard.db}
                          onChange={(e) =>
                            handleDifficultyChange(
                              index,
                              "hard",
                              "db",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="topic-total">
                  Total Questions: {topic.total}
                </div>
              </div>
            ))}
          </div>

          <div className="summary-box">
            <div>Total Questions: {totalQuestions} / 40</div>

            {totalQuestions > 0 && totalQuestions <= 40 && (
              <div className="ready-text">
                ✔ Ready to Create Exam
              </div>
            )}

            {totalQuestions > 40 && (
              <div className="warning">
                Total cannot exceed 40!
              </div>
            )}
          </div>

          {userType !== "SUPER_ADMIN" && (
            <div className="button-row final-actions">

              <button
                type="submit"
                disabled={totalQuestions > 40}
              >
                Create Exam
              </button>

              <button
                type="button"
                className="homework-btn"
                disabled={totalQuestions > 40}
                onClick={async () => {

                  if (!validateQuizBeforeSubmit()) {
                    return false;
                  }

                  const payload = {
                    class_name: quiz.className.trim(),
                    subject: quiz.subject.trim(),
                    class_year: Number(quiz.classYear),
                    center_code: centerCode,
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
                      `${BACKEND_URL}/api/quizzes-homework`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json"
                        },
                        body: JSON.stringify(payload),
                      }
                    );

                    if (!res.ok) {

                      const err = await res.json();

                      console.error(
                        "Backend returned:",
                        err
                      );

                      throw new Error(
                        "Failed to save homework"
                      );
                    }

                    const data = await res.json();

                    console.log(
                      "Homework saved:",
                      data
                    );

                    alert(
                      "Homework created successfully!"
                    );

                  } catch (error) {

                    console.error(error);

                    alert(
                      "Error creating homework."
                    );
                  }
                }}
              >
                Create Exam (Homework)
              </button>

            </div>
          )}
            </form>
      </div>
    </div>
  );
  }

