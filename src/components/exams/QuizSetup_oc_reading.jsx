import React, { useState, useEffect } from "react";
import "./QuizSetup.css";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function QuizSetup_oc_reading({
  userType,
  centerCode,
}) {
  const [quiz, setQuiz] = useState({
    className: "oc",
    subject: "reading_comprehension",
    classYear: "",
    numTopics: 1,
    topics: [],
  });

  // ---------------------------------------
  // CONFIG RULES (OC SPECIFIC)
  // ---------------------------------------

  const FIXED_TOPIC_QUESTION_RULES_OC = {
    "Main Idea and Summary": 6,
    "Gapped Text": 6,
  };

  const CHOICE_TOPIC_QUESTION_RULES_OC = {
    "Comparative Analysis": [8, 10],
    "Dropdown Cloze": [4, 5, 6, 7, 8],
  };

  const MAX_TOPIC_USAGE_OC = {
    "Comparative Analysis": 2,
    "Dropdown Cloze": 1,
  };

  // ---------------------------------------
  // STATE
  // ---------------------------------------

  const [availableTopics, setAvailableTopics] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(false);
  const [questionBank, setQuestionBank] = useState([]);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDeleteQuestionSection, setShowDeleteQuestionSection] = useState(false);
  const handleResetUsedQuestions_Reading = async () => {

  const confirmReset = window.confirm(
    "Reset used reading questions?"
  );

  if (!confirmReset) return;

  try {

    const payload = {

      class_name: quiz.className,

      subject: quiz.subject,

      class_year: Number(quiz.classYear),

      center_code: centerCode,
    };

    console.log(
      "📤 RESET PAYLOAD:",
      payload
    );

    const res = await fetch(
      `${BACKEND_URL}/api/admin/reset-used-oc-reading-questions`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      throw new Error("Failed");
    }

    const data = await res.json();

    alert(
      `Reset successful! `
      + `${data.deleted_count} deleted.`
    );

  } catch (err) {

    console.error(err);

    alert("Error resetting.");
  }
};
  const handleSearchQuestions_OC_Reading = async () => {
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
      `${BACKEND_URL}/api/admin/search-questions-oc-reading?${params.toString()}`
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
  const handleDeleteSingleQuestion_OC_Reading = async () => {
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
      `${BACKEND_URL}/api/admin/delete-question-oc-reading/${selectedQuestionId}`,
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
      "Are you sure you want to delete all reading questions?"
    );
  
    if (!confirmed) return;
  
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/delete-all-questions-oc-reading`, {
        method: "DELETE",
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.detail || "Failed to delete questions");
      }
  
      alert(
        `${data.message}\n\n` +
        `Questions Deleted: ${data.questions_deleted}\n` +
        `Usage Rows Deleted: ${data.usage_rows_deleted}`
      );
    } catch (error) {
      console.error("Error deleting questions:", error);
      alert("Something went wrong while deleting the questions.");
    }
  };
  // ---------------------------------------
  // HELPERS
  // ---------------------------------------

  const getUsedTopicNames_oc = (currentIndex) =>
    quiz.topics
      .map((t, i) => (i !== currentIndex ? t.name : null))
      .filter(Boolean);

  // ---------------------------------------
  // INPUT HANDLERS
  // ---------------------------------------

  const handleInputChange_oc = (e) => {
    const { name, value } = e.target;
    setQuiz((prev) => ({ ...prev, [name]: value }));
  };

  const generateTopics_oc = () => {
    const num = parseInt(quiz.numTopics) || 1;

    const topicsArray = Array.from({ length: num }, () => ({
      name: "",
      difficulty: "",
      available_difficulties: [],
      num_questions: 0,
    }));

    setQuiz((prev) => ({ ...prev, topics: topicsArray }));
    setTotalQuestions(0);
  };

  const handleTopicSelect_oc = async (index, value) => {
  try {
    // Step 1: update topic basic state
    setQuiz((prev) => {
      const topics = [...prev.topics];

      topics[index] = {
        ...topics[index],
        name: value,
        difficulty: "",
        available_difficulties: [],
        num_questions:
          FIXED_TOPIC_QUESTION_RULES_OC[value] !== undefined
            ? FIXED_TOPIC_QUESTION_RULES_OC[value]
            : CHOICE_TOPIC_QUESTION_RULES_OC[value]
            ? CHOICE_TOPIC_QUESTION_RULES_OC[value][0]
            : 0,
      };
      const total = topics.reduce(
        (sum, t) => sum + (Number(t.num_questions) || 0),
        0
      );

      setTotalQuestions(total);

      return { ...prev, topics };
    });

    // Step 2: fetch difficulties from backend
    const params = new URLSearchParams({
      class_year: quiz.classYear,
      topic: value,
    });

    const res = await fetch(
      `${BACKEND_URL}/api/reading-oc/topic-difficulties?${params}`
    );

    const data = await res.json();

    // Step 3: update available difficulties
    setQuiz((prev) => {
      const topics = [...prev.topics];

      topics[index] = {
        ...topics[index],
        available_difficulties: data || [],
        num_questions:
          topics[index].num_questions ||
          (
            FIXED_TOPIC_QUESTION_RULES_OC[value] !== undefined
              ? FIXED_TOPIC_QUESTION_RULES_OC[value]
              : 0
          ),
      };

      const total = topics.reduce(
        (sum, t) => sum + (Number(t.num_questions) || 0),
        0
      );

      setTotalQuestions(total);

      return { ...prev, topics };
    });

  } catch (error) {
    console.error("Error fetching difficulties:", error);
  }
};

  const handleTopicTotalChange_oc = (index, value) => {
    const numValue = Number(value) || 0;

    setQuiz((prev) => {
      const topics = [...prev.topics];
      topics[index].num_questions = numValue;

      const total = topics.reduce(
        (sum, t) => sum + (Number(t.num_questions) || 0),
        0
      );

      setTotalQuestions(total);
      return { ...prev, topics };
    });
  };

  // ---------------------------------------
  // FETCH TOPICS
  // ---------------------------------------

  useEffect(() => {
    

    const fetchTopics_oc = async () => {
      try {
        const params = new URLSearchParams({
          class_year: quiz.classYear,
        });

        const res = await fetch(
          `${BACKEND_URL}/api/reading/topics-oc?${params}`
        );

        if (!res.ok) throw new Error("Failed to load topics");

        const data = await res.json();
        setAvailableTopics(data);
      } catch (err) {
        console.error(err);
        setAvailableTopics([]);
      }
    };

    fetchTopics_oc();
  }, [quiz.classYear]);

  // ---------------------------------------
  // VIEW QUESTION BANK
  // ---------------------------------------

  const handleViewQuestionBank_oc = async () => {
  try {
    setLoadingQuestions(true);
    setShowQuestionBank(true);

    const params = new URLSearchParams({
      class_year: quiz.classYear,
      center_code: centerCode,
    });

    const res = await fetch(
      `${BACKEND_URL}/api/reading/question-bank-oc?${params}`
    );

    if (!res.ok) throw new Error("Failed");

    const data = await res.json();
    setQuestionBank(data.rows || []);
    setShowQuestionBank(true);
  } catch (err) {
    console.error(err);
    alert("Failed to load question bank");
  } finally {
    setLoadingQuestions(false);
  }
};
  // ---------------------------------------
  // SUBMIT
  // ---------------------------------------

  const handleSubmit_oc = async (e) => {
    e.preventDefault();
    for (let i = 0; i < quiz.topics.length; i++) {
  const t = quiz.topics[i];

  if (!t.name) {
    alert(`Please select topic for Topic ${i + 1}`);
    return;
  }

  if (!t.difficulty) {
    alert(`Please select difficulty for Topic ${i + 1}`);
    return;
  }

  if (!t.num_questions) {
    alert(`Please select number of questions for Topic ${i + 1}`);
    return;
  }
}

    

    if (quiz.topics.length === 0) {
      alert("Generate topics first.");
      return;
    }

    // OC RANGE (adjust if needed)
    if (totalQuestions < 28 || totalQuestions > 38) {
      alert(
          `OC Reading must be between 28 and 38 questions. Current: ${totalQuestions}`
        );
      return;
    }

    const payload = {
      class_name: "oc",
      class_year: quiz.classYear,
      subject: quiz.subject,
      center_code: centerCode,
      difficulty: "mixed",   // ✅ ADD THIS
      topics: quiz.topics.map((t) => ({
        name: t.name.trim(),
        difficulty: t.difficulty,
        num_questions: Number(t.num_questions),
      })),
    };
    console.log("===== OC CONFIG PAYLOAD =====");
    console.log(JSON.stringify(payload, null, 2));
    console.log("=============================");

    try {
      setLoading(true);

      const res = await fetch(
        `${BACKEND_URL}/api/admin/create-reading-config`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        alert(data.detail);
        return;
      }

      alert(`OC Reading Exam Created! ID: ${data.config_id}`);
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("Error creating exam");
    }
  };

  // ---------------------------------------
  // UI
  // ---------------------------------------

  return (
    <div className="quiz-setup-container">
      <form onSubmit={handleSubmit_oc}>
        <label>Class:</label>
        <input value="OC" readOnly />

        <label>Subject:</label>
        <input value="Reading Comprehension" readOnly />
        <label>Class Year:</label>
        <select
          name="classYear"
          value={quiz.classYear}
          onChange={handleInputChange_oc}
          required
        >
          <option value="">Select</option>
          <option value="3">Year 3</option>
          <option value="4">Year 4</option>
          <option value="6">Year 6</option>
        </select>

        

        <label>Number of Topics:</label>
        <input
          type="number"
          name="numTopics"
          value={quiz.numTopics}
          onChange={handleInputChange_oc}
        />

        <button type="button" onClick={generateTopics_oc}>
          Generate Topics
        </button>

        <button
          type="button"
          onClick={handleViewQuestionBank_oc}
          disabled={!quiz.classYear}
        >
          View Question Bank
        </button>
        {userType !== "SUPER_ADMIN" && (
          <button
            type="button"
            onClick={handleResetUsedQuestions_Reading}
            disabled={!quiz.classYear}
          >
            Reset Used Questions
          </button>
        )}
        {userType === "SUPER_ADMIN" && (
          <button
            type="button"
            onClick={handleDeleteAllQuestions}
            
          >
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
            onClick={handleSearchQuestions_OC_Reading}
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
              onClick={handleDeleteSingleQuestion_OC_Reading}
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

        {/* Topics */}
        <div className="topics-container">
          {quiz.topics.map((topic, index) => (
            <div key={index} className="topic">
              <h4>Topic {index + 1}</h4>

              <select
                value={topic.name}
                onChange={(e) =>
                  handleTopicSelect_oc(index, e.target.value)
                }
              >
                <option value="">Select Topic</option>
                {availableTopics
                  .filter((t) => {
                    const used = getUsedTopicNames_oc(index);
                    const count = used.filter(n => n === t.name).length;

                    if (MAX_TOPIC_USAGE_OC[t.name] !== undefined) {
                      return count < MAX_TOPIC_USAGE_OC[t.name];
                    }

                    return !used.includes(t.name);
                  })
                  .map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name}
                    </option>
                  ))}
              </select>
              <label>Difficulty:</label>
                <select
                  value={topic.difficulty || ""}
                  onChange={(e) => {
                    const val = e.target.value;

                    setQuiz((prev) => {
                      const topics = [...prev.topics];

                      topics[index] = {
                        ...topics[index],
                        difficulty: val,
                      };

                      return { ...prev, topics };
                    });
                  }}
                  required
                  >
                    <option value="">Select Difficulty</option>

                    {topic.available_difficulties.map((difficultyOption) => (
                      <option key={difficultyOption} value={difficultyOption}>
                        {difficultyOption.charAt(0).toUpperCase() + difficultyOption.slice(1)}
                      </option>
                    ))}
                </select>
              {/* Question Input */}
              {CHOICE_TOPIC_QUESTION_RULES_OC[topic.name] ? (
                <select
                  value={topic.num_questions}
                  onChange={(e) =>
                    handleTopicTotalChange_oc(index, e.target.value)
                  }
                >
                  {CHOICE_TOPIC_QUESTION_RULES_OC[topic.name].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="number"
                  value={topic.num_questions}
                  onChange={(e) =>
                    handleTopicTotalChange_oc(index, e.target.value)
                  }
                  disabled={
                    FIXED_TOPIC_QUESTION_RULES_OC[topic.name] !== undefined
                  }
                />
              )}
            </div>
          ))}
        </div>
          {/* QUESTION BANK */}
          {showQuestionBank && (
            <div className="question-bank">
              <h3>Question Bank Summary</h3>
          
              {loadingQuestions ? (
                <p>Loading...</p>
              ) : questionBank.length === 0 ? (
                <p>No questions found.</p>
              ) : (
                <table className="question-bank-table">
                  <thead>
                    <tr>
                      <th>Difficulty</th>
                      <th>Topic</th>
                      <th>Set Size</th>
                      <th>Sets Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questionBank.map((row, idx) => (
                      <tr key={idx}>
                        <td>{row.difficulty}</td>
                        <td>{row.topic}</td>
                        <td>{row.set_size}</td>
                        <td>{row.sets_available}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}  

        <h3>Total Questions: {totalQuestions}</h3>
        {(totalQuestions < 29 || totalQuestions > 38) && (
          <div style={{ color: "red", fontWeight: "bold" }}>
            Total must be between 29 and 38 questions.
          </div>
        )}
      {userType !== "SUPER_ADMIN" && (
        <>
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Create OC Reading Exam"}
          </button>
          <button
          type="button"
          onClick={async () => {
            

            if (!quiz.classYear) {
              alert("Please select class year.");
              return;
            }

            if (quiz.topics.length === 0) {
              alert("Generate topics first.");
              return;
            }

            if (totalQuestions < 29 || totalQuestions > 38) {
              alert(
                `OC Reading must be between 29 and 38 questions. Current: ${totalQuestions}`
              );
              return;
            }

            const payload = {
              class_name: "oc",
              subject: quiz.subject,
              class_year: quiz.classYear,
              center_code: centerCode,
              difficulty: "mixed",   // ✅ REQUIRED
              topics: quiz.topics.map((t) => ({
                name: t.name.trim(),
                difficulty: t.difficulty,
                num_questions: Number(t.num_questions),
              })),
            };

            try {
              setLoading(true);

              const res = await fetch(
                `${BACKEND_URL}/api/admin/create-oc-reading-homework-config`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                }
              );

              const data = await res.json();
              setLoading(false);

              if (!res.ok) {
                alert(data.detail);
                return;
              }

              alert(`OC Reading Homework Created! ID: ${data.config_id}`);
            } catch (err) {
              setLoading(false);
              console.error(err);
              alert("Error creating homework");
            }
          }}
        >
          {loading ? "Saving..." : "Create OC Reading Exam (Homework)"}
        </button>
      </>
)}
      </form>
    </div>
  );
}
