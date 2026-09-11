import React, { useState, useEffect } from "react";
import "./QuizSetup.css";


const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";


export default function QuizSetup_reading({
  userType,
  centerCode
}) {

  console.log(
    "📥 Reading Component Props:",
    {
      userType,
      centerCode
    }
  );
  const [quiz, setQuiz] = useState({
    className: "selective",
    classYear: "", // ✅ NEW
    subject: "reading_comprehension",
    numTopics: 1,
    topics: [],
  });
  const ALLOW_DUPLICATE_TOPICS = ["Comparative Analysis"];
  const MAX_TOPIC_USAGE = {
    "Comparative Analysis": 3
  };



  const FIXED_TOPIC_QUESTION_RULES = {
    "Main Idea and Summary": 6,
    "Gapped Text": 6,
  };
  
  const CHOICE_TOPIC_QUESTION_RULES = {
    "Comparative Analysis": [8, 10],
    "Dropdown Cloze": [4, 5, 6, 7, 8],
    "Extract Matching": [4, 5, 6, 7, 8],
  };


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
  const DIFFICULTY_OPTIONS = ["easy", "medium", "hard"];
  const [difficultyMap, setDifficultyMap] = useState({});
  const getQuestionCount = (topicName) => {
  if (topicName === "Main Idea and Summary") return 6;
  if (topicName === "Gapped Text") return 6;

  if (topicName === "Comparative Analysis") {
    return 8; // later we can make this dynamic (8 or 10)
  }

  return 0;
};
  const buildDifficultyMap_reading = (data) => {
  const map = {};

  data.forEach((row) => {
    if (!map[row.topic]) {
      map[row.topic] = new Set();
    }
    map[row.topic].add(row.difficulty);
  });

  // convert sets → arrays
  Object.keys(map).forEach((key) => {
    map[key] = Array.from(map[key]);
  });

  return map;
};
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
      `${BACKEND_URL}/api/admin/reset-used-reading-questions`,
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
  
  const handleCreateHomework = async () => {
  if (!quiz.classYear) {
    alert("Please select class year.");
    return;
  }

  const payload = {
    class_name: quiz.className.trim(),
    class_year: quiz.classYear,
    subject: quiz.subject,
    center_code: centerCode,
    difficulty: "mixed",
    topics: quiz.topics.map((t) => {
      let numQuestions = t.num_questions;

      // ✅ FIXED TOPICS
      if (FIXED_TOPIC_QUESTION_RULES[t.name] !== undefined) {
        numQuestions = FIXED_TOPIC_QUESTION_RULES[t.name];
      }

      return {
        name: t.name.trim(),
        difficulty: t.difficulty, // ✅ ADD THIS (important for backend)
        num_questions: Number(numQuestions),
      };
    }),
  };

  try {
    setLoading(true);

    const response = await fetch(
      `${BACKEND_URL}/api/admin/create-reading-homework`, // ✅ NEW ENDPOINT
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      alert("Error: " + data.detail);
      return;
    }

    alert(
      `Reading Homework Created!\nID: ${data.id}\nCreated At: ${data.created_at}`
    );
  } catch (err) {
    setLoading(false);
    console.error(err);
    alert("Failed to create homework.");
  }
};
  const handleSearchQuestions_Reading = async () => {
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
      `${BACKEND_URL}/api/admin/search-questions-selective-reading?${params.toString()}`
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
  const handleDeleteSingleQuestion_Reading = async () => {
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
      `${BACKEND_URL}/api/admin/delete-question-selective-reading/${selectedQuestionId}`,
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
  console.log("\n================ DELETE DEBUG START ================");

  // 🔍 Full state snapshot
  console.log("🧠 FULL QUIZ STATE:", quiz);
  console.log("🧠 quiz.classYear:", quiz.classYear);
  console.log("🧠 typeof classYear:", typeof quiz.classYear);

  const year = quiz.classYear?.trim();

  console.log("🧹 Trimmed classYear:", year);

  if (!year) {
    console.log("❌ classYear is EMPTY at click time");
    alert("Please select class year.");
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to delete all reading questions for ${year}?`
  );

  if (!confirmed) {
    console.log("⛔ User cancelled delete");
    return;
  }

  try {
    const params = new URLSearchParams({
      class_year: year,
    });

    const url = `${BACKEND_URL}/api/admin/delete-all-questions-selective-reading?${params.toString()}`;

    // 🔍 Final request inspection
    console.log("🚀 FINAL REQUEST URL:", url);

    const response = await fetch(url, {
      method: "DELETE",
    });

    console.log("📡 RESPONSE STATUS:", response.status);

    const data = await response.json();

    console.log("📦 RESPONSE DATA:", data);

    if (!response.ok) {
      console.log("❌ API returned error:", data);
      throw new Error(data.detail || "Failed to delete questions");
    }

    console.log("✅ DELETE SUCCESS");

    alert(data.message || "All Reading questions deleted.");
  } catch (error) {
    console.error("💥 DELETE ERROR:", error);
    alert("Something went wrong while deleting the questions.");
  }

  console.log("================ DELETE DEBUG END ================\n");
};

  const handleViewQuestionBank = async () => {
  // Ensure class year is selected
  if (!quiz.classYear) {
    alert("Please select class year.");
    return;
  }

  try {
    setLoadingQuestions(true);
    setShowQuestionBank(false);

    const params = new URLSearchParams({
      subject: quiz.subject,
      class_name: quiz.className,
      class_year: quiz.classYear, // ✅ added
      center_code: centerCode,

    });

    const res = await fetch(
      `${BACKEND_URL}/api/reading/question-bank?${params.toString()}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch question bank");
    }

    const data = await res.json();

    setQuestionBank(data.rows || []);
    setShowQuestionBank(true);
  } catch (err) {
    console.error("Error fetching question bank:", err);
    alert("Failed to load question bank");
  } finally {
    setLoadingQuestions(false);
  }
};



  const getUsedTopicNames = (currentIndex) =>
    quiz.topics
      .map((t, i) => (i !== currentIndex ? t.name : null))
      .filter(Boolean);

  // ---------------------------------------
  // HANDLE FORM INPUTS
  // ---------------------------------------
  
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuiz((prev) => ({ ...prev, [name]: value }));
  };

  const generateTopics = () => {
    const num = parseInt(quiz.numTopics) || 1;

    const topicsArray = Array.from({ length: num }, () => ({
      name: "",
      difficulty: "",
      available_difficulties: [],
      num_questions: 0,   // ✅ ADD THIS
      total: 0
    }));

    setQuiz((prev) => ({ ...prev, topics: topicsArray }));
    setTotalQuestions(0);
  };

  


  const handleTopicSelect = async (index, value) => {
  try {
    // Step 1: update topic + reset dependent fields
    setQuiz((prev) => {
      const topics = [...prev.topics];

      const updatedTopic = {
        ...topics[index],
        name: value,
        difficulty: "",
        available_difficulties: [],
        num_questions: 0,
        total:
          value === "Comparative Analysis"
            ? 0
            : getQuestionCount(value), // ✅ FIX: set total immediately for fixed topics
      };

      topics[index] = updatedTopic;

      // ✅ Recalculate total here as well
      const grandTotal = topics.reduce(
        (sum, t) => sum + (t.total || 0),
        0
      );

      setTotalQuestions(grandTotal);

      return { ...prev, topics };
    });

    // Step 2: fetch difficulties from backend
    const params = new URLSearchParams({
      class_year: quiz.classYear,
      topic: value,
    });

    const res = await fetch(
      `${BACKEND_URL}/api/reading/topic-difficulties?${params.toString()}`
    );

    const data = await res.json();

    // Step 3: update available difficulties
    setQuiz((prev) => {
      const topics = [...prev.topics];

      topics[index] = {
        ...topics[index],
        available_difficulties: data || [],
      };

      return { ...prev, topics };
    });

  } catch (error) {
    console.error("Error fetching difficulties:", error);
  }
};

  // ---------------------------------------
  // FETCH TOPICS
  // ---------------------------------------

  useEffect(() => {
  if (!quiz.classYear) {
    setAvailableTopics([]);
    return;
  }

  const fetchReadingTopics = async () => {
    try {
      const params = new URLSearchParams({
        class_year: quiz.classYear,
      });

      const res = await fetch(
        `${BACKEND_URL}/api/reading/topics?${params.toString()}`
      );

      const data = await res.json();

      // ✅ ONLY this
      setAvailableTopics(data);

    } catch (error) {
      console.error(error);
      setAvailableTopics([]);
    }
  };

  fetchReadingTopics();

}, [quiz.classYear]);
  // ---------------------------------------
  // SUBMIT
  // ---------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!quiz.className || !quiz.subject) {
      alert("Please select class, subject, and difficulty.");
      return;
    }

    if (quiz.topics.length === 0) {
      alert("Please generate at least one topic.");
      return;
    }

    // ✅ QUESTION COUNT ENFORCEMENT (RESTORED)
    if (totalQuestions < 29 || totalQuestions > 38) {
      alert(
        `Reading exam must contain between 29 and 38 questions. Currently selected: ${totalQuestions}.`
      );
      return;
    }

    const payload = {
      class_name: quiz.className.trim(),
      class_year: quiz.classYear,   // ✅ ADD THIS LINE
      subject: quiz.subject,
      center_code: centerCode,
      difficulty: "mixed",
      topics: quiz.topics.map((t) => {
        let numQuestions = t.num_questions;

        // ✅ FIXED TOPICS
        if (FIXED_TOPIC_QUESTION_RULES[t.name] !== undefined) {
          numQuestions = FIXED_TOPIC_QUESTION_RULES[t.name];
        }

        return {
          name: t.name.trim(),
          difficulty: t.difficulty, // ✅ ADD THIS (important for backend)
          num_questions: Number(numQuestions),
        };
      }),
    };
    // 🔍 DEBUG HERE
    console.log("=========== FINAL EXAM PAYLOAD ===========");
    console.log(JSON.stringify(payload, null, 2));
    console.log("==========================================");

    try {
      setLoading(true);

      const response = await fetch(
        `${BACKEND_URL}/api/admin/create-reading-config`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        alert("Error: " + data.detail);
        return;
      }

      alert(
        `Reading Exam Created!\nConfig ID: ${data.config_id}\nCreated At: ${data.created_at}`
      );
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert("Failed to create exam. Check console for details.");
    }
  };

  // ---------------------------------------
  // RENDER
  // ---------------------------------------
  return (
    <div className="quiz-setup-container">
      <form onSubmit={handleSubmit}>
        <label>Class:</label>
        <input value="Selective" readOnly />
        <label>Class Year:</label>
        <select
          name="classYear"
          value={quiz.classYear}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Year</option>
          <option value="4">Year 4</option>
          <option value="5">Year 5</option>
          <option value="6">Year 6</option>
        </select>

        <label>Subject:</label>
        <input value="Reading Comprehension" readOnly />

        

        <label>Number of Topics:</label>
        <input
          type="number"
          name="numTopics"
          min="1"
          value={quiz.numTopics}
          onChange={handleInputChange}
        />

        <button type="button" onClick={generateTopics}>
          Generate Topics
        </button>
        {userType !== "SUPER_ADMIN" && (
          <button
            type="button"
            onClick={handleViewQuestionBank}
            disabled={!quiz.classYear}
          >
            View Question Bank
          </button>
        )}
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
                      onClick={handleSearchQuestions_Reading}
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
                        onClick={handleDeleteSingleQuestion_Reading}
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
        <div className="topics-container">
          {quiz.topics.map((topic, index) => (
            <div className="topic" key={index}>

              <h4>Topic {index + 1}</h4>

              <label>Topic Name:</label>
              <select
                value={topic.name}
                onChange={(e) =>
                  handleTopicSelect(index, e.target.value)
                }
                required
              >
                <option value="">Select Topic</option>
                {availableTopics
                .filter((t) => {
                  // ✅ Guard against bad data
                  if (!t || !t.name) return false;

                  const usedNames = getUsedTopicNames(index) || [];

                  // ✅ Normalize for case consistency
                  const currentName = t.name.toLowerCase();
                  const normalizedUsed = usedNames.map(n => n?.toLowerCase());

                  const usageCount = normalizedUsed.filter(name => name === currentName).length;

                  // ✅ Respect max usage if defined
                  if (MAX_TOPIC_USAGE[t.name] !== undefined) {
                    return usageCount < MAX_TOPIC_USAGE[t.name];
                  }

                  // ✅ Default: allow only once
                  return !normalizedUsed.includes(currentName);
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
                    const val = e.target.value;   // ✅ keep as string

                    setQuiz((prev) => {
                      const topics = [...prev.topics];
                      const current = topics[index];   // stable reference

                      topics[index] = {
                        ...current,
                        difficulty: val,   // ✅ ONLY update difficulty
                      };

                      return { ...prev, topics };
                    });
                  }}
                  required
                >
                  <option value="">Select Difficulty</option>

                  {topic.available_difficulties.map((d) => (
                    <option key={d} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </option>
                  ))}
                </select>
                {CHOICE_TOPIC_QUESTION_RULES[topic.name] && (
                  <div>
                    <label>Number of Questions:</label>
                    <select
                      value={topic.num_questions || ""}
                      onChange={(e) => {
                        const val = Number(e.target.value);

                        setQuiz((prev) => {
                          const topics = [...prev.topics];
                          const current = topics[index];   // ✅ capture once

                          topics[index] = {
                            ...current,                   // ✅ use stable reference
                            num_questions: val,
                            total: val,
                          };

                          const grandTotal = topics.reduce(
                            (sum, t) => sum + (t.total || 0),
                            0
                          );

                          setTotalQuestions(grandTotal);

                          return { ...prev, topics };
                        });
                      }}
                    >
                      <option value="">Select</option>
                      {CHOICE_TOPIC_QUESTION_RULES[topic.name].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {!CHOICE_TOPIC_QUESTION_RULES[topic.name] && (
                  <div className="topic-total">
                    Total Questions: {getQuestionCount(topic.name)}
                  </div>
                )}

                {CHOICE_TOPIC_QUESTION_RULES[topic.name] && topic.num_questions && (
                  <div className="topic-total">
                    Total Questions: {topic.num_questions}
                  </div>
                )}

              
              

            </div>
          ))}
        </div>
        {/* QUESTION BANK SUMMARY */}
        {/* ---------------------------- */}
        {showQuestionBank && (
          <div className="question-bank">
            <h3>Question Bank Summary</h3>
        
            {loadingQuestions ? (
              <p>Loading summary...</p>
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

        {userType !== "SUPER_ADMIN" && (
          <>

            <div className="total-section">
              <h3>Total Questions: {totalQuestions}</h3>

              {(totalQuestions < 29 || totalQuestions > 38) && (
                <div className="warning">
                  Total must be between 29 and 38 questions.
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>

              <button
                type="submit"
                disabled={
                  loading ||
                  totalQuestions < 29 ||
                  totalQuestions > 38
                }
              >
                {loading
                  ? "Saving..."
                  : "Create Reading Exam"}
              </button>

              <button
                type="button"
                onClick={handleCreateHomework}
                disabled={
                  loading ||
                  totalQuestions < 29 ||
                  totalQuestions > 38
                }
              >
                {loading
                  ? "Saving..."
                  : "Create Reading Homework"}
              </button>

            </div>

          </>
        )}
      </form>
    </div>
  );
}
