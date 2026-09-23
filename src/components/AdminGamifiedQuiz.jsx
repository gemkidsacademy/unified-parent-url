import React, { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import AcademicTerm from "./AcademicTerm/AcademicTerm";
import ClassConfiguration from "./ClassConfiguration/ClassConfiguration";
import SessionTopicsImport from "./SessionTopicsImport/SessionTopicsImport";
import ActivityTypes from "./ActivityTypes/ActivityTypes";
import QuizScheduler from "./QuizScheduler/QuizScheduler";
import SchedulerRuns from "./SchedulerRuns/SchedulerRuns";
import GenerateGamifiedQuizzes from "./GenerateGamifiedQuizzes/GenerateGamifiedQuizzes";
import Leaderboard from "./Leaderboard/Leaderboard";
import GuestCredentials from "./GuestCredentials/GuestCredentials";
import { API_BASE_URL } from "../config/api";



export default function AdminGamifiedQuiz({ interviewAdmin }) {
    const [activeSection, setActiveSection] = useState(null);
    const [latestQuiz, setLatestQuiz] = useState(null);
    const [latestQuizLoading, setLatestQuizLoading] = useState(false);
    const [latestQuizError, setLatestQuizError] = useState("");
    const [isEditingQuiz, setIsEditingQuiz] = useState(false);
    const [editableQuiz, setEditableQuiz] = useState(null);
    const [manageQuizCategory, setManageQuizCategory] = useState("");
    const [manageQuizClassYear, setManageQuizClassYear] = useState("");
    const [manageQuizClassDay, setManageQuizClassDay] = useState("");
    const [manageQuizLoading, setManageQuizLoading] = useState(false);
    const [manageQuizError, setManageQuizError] = useState("");
    const [manageQuizCategories, setManageQuizCategories] = useState([]);
    const [manageQuizClassYears, setManageQuizClassYears] = useState([]);
    const [manageQuizClassDays, setManageQuizClassDays] = useState([]);

    useEffect(() => {
        if (activeSection !== "manageQuiz") {
            return;
        }

        const loadManageQuizCategories = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/admin/gamified/categories`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data?.detail || "Failed to load categories.");
                }

                setManageQuizCategories(data.categories);
            } catch (error) {
                setManageQuizError(error.message || "Failed to load categories.");
            }
        };

        loadManageQuizCategories();
    }, [activeSection]);

    const loadManageQuizClassYears = async (category) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/gamified/class-years`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ category }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.detail || "Failed to load class years.");
            }

            setManageQuizClassYears(data.class_years);
        } catch (error) {
            setManageQuizError(error.message || "Failed to load class years.");
        }
    };

    const loadManageQuizClassDays = async (category, classYear) => {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/gamified/class-days`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    category,
                    class_year: classYear,
                }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.detail || "Failed to load class days.");
            }

            setManageQuizClassDays(data.class_days);
        } catch (error) {
            setManageQuizError(error.message || "Failed to load class days.");
        }
    };

    const handleLoadManageQuiz = async () => {
        if (
            !manageQuizCategory ||
            !manageQuizClassYear ||
            !manageQuizClassDay
        ) {
            setManageQuizError(
                "Please select Category, Class Year, and Class Day."
            );
            return;
        }

        setManageQuizLoading(true);
        setManageQuizError("");
        setLatestQuiz(null);

        try {
            const response = await fetch(
                `${API_BASE_URL}/gamified-quiz/manage?center_code=${encodeURIComponent(
                    interviewAdmin.center_code
                )}&category=${encodeURIComponent(
                    manageQuizCategory
                )}&class_year=${encodeURIComponent(
                    manageQuizClassYear
                )}&class_day=${encodeURIComponent(
                    manageQuizClassDay
                )}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.detail || "No generated quiz found for the selected filters."
                );
            }

            setLatestQuiz(data);
            setEditableQuiz(data.quiz_json);
            setIsEditingQuiz(false);
        } catch (error) {
            setLatestQuiz(null);
            setEditableQuiz(null);
            setManageQuizError(
                error.message || "Failed to load the generated quiz."
            );
        } finally {
            setManageQuizLoading(false);
        }
    };

    const handleSaveQuiz = async () => {
        setLatestQuizError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/gamified-quiz/${latestQuiz.id}?center_code=${encodeURIComponent(latestQuiz.center_code)}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(editableQuiz),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.detail || "Failed to save quiz changes."
                );
            }

            setLatestQuiz((previousQuiz) => ({
                ...previousQuiz,
                quiz_json: data.quiz_json,
            }));

            setEditableQuiz(data.quiz_json);
            setIsEditingQuiz(false);
        } catch (error) {
            setLatestQuizError(
                error.message || "Failed to save quiz changes."
            );
        }
    };

    const updateEditableQuizField = (field, value) => {
        setEditableQuiz((currentQuiz) => ({
            ...currentQuiz,
            [field]: value,
        }));
    };

    const updateEditableQuestionField = (questionIndex, field, value) => {
        setEditableQuiz((currentQuiz) => ({
            ...currentQuiz,
            questions: currentQuiz.questions.map((question, index) =>
                index === questionIndex
                    ? { ...question, [field]: value }
                    : question
            ),
        }));
    };

    const updateEditableQuestionOption = (
        questionIndex,
        optionIndex,
        value
    ) => {
        setEditableQuiz((previousQuiz) => {
            const questions = [...previousQuiz.questions];
            const question = { ...questions[questionIndex] };
            const options = [...question.options];

            const previousOption = options[optionIndex];

            options[optionIndex] = value;
            question.options = options;

            if (question.answer === previousOption) {
                question.answer = value;
            }

            questions[questionIndex] = question;

            return {
                ...previousQuiz,
                questions,
            };
        });
    };

    if (activeSection === "academicTerm") {
        return (
            <AcademicTerm
                loggedInUser={interviewAdmin}
                onBack={() => setActiveSection(null)}
            />
        );
    }
    if (activeSection === "sessionTopics") {
    return (
        <SessionTopicsImport
        loggedInUser={interviewAdmin}
        onBack={() => setActiveSection(null)}
        />
    );
    }
    if (activeSection === "activityTypes") {
        return (
            <ActivityTypes
                loggedInUser={interviewAdmin}
                onBack={() => setActiveSection(null)}
            />
        );
    }
    if (activeSection === "quizScheduler") {
        return (
            <QuizScheduler
                loggedInUser={interviewAdmin}
                onBack={() => setActiveSection(null)}
            />
        );
    }
    if (activeSection === "schedulerRuns") {
        return (
            <SchedulerRuns
                loggedInUser={interviewAdmin}
                onBack={() => setActiveSection(null)}
            />
        );
    }
    if (activeSection === "generateGamifiedQuizzes") {
        return (
            <GenerateGamifiedQuizzes
                loggedInUser={interviewAdmin}
                onBack={() => setActiveSection(null)}
            />
        );
    }
    if (activeSection === "leaderboard") {
        return (
            <Leaderboard
                loggedInUser={interviewAdmin}
                onBack={() => setActiveSection(null)}
            />
        );
    }
    if (activeSection === "guestCredentials") {
        return (
            <GuestCredentials
                loggedInUser={interviewAdmin}
                onBack={() => setActiveSection(null)}
            />
        );
    }
    if (activeSection === "classConfiguration") {
        return (
            <ClassConfiguration
                loggedInUser={interviewAdmin}
                onBack={() => setActiveSection(null)}
            />
        );
    }

    if (activeSection === "manageQuiz") {
        return (
            <section>
                <button type="button" onClick={() => setActiveSection(null)}>
                    ← Back to Gamified Quiz
                </button>

                <article className="gamified-dashboard-card">
                    <div className="gamified-dashboard-content">
                        <h2>Manage Quiz</h2>
                        <div className="quiz-edit-form">
                            <div className="quiz-edit-field">
                                <label className="quiz-edit-label" htmlFor="manage-quiz-category">
                                    Category
                                </label>
                                <select
                                    id="manage-quiz-category"
                                    className="quiz-edit-select"
                                    value={manageQuizCategory}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        setManageQuizCategory(value);
                                        setManageQuizClassYear("");
                                        setManageQuizClassDay("");
                                        setManageQuizClassYears([]);
                                        setManageQuizClassDays([]);
                                        setManageQuizError("");
                                        loadManageQuizClassYears(value);
                                    }}
                                >
                                    <option value="">Select Category</option>
                                    {manageQuizCategories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="quiz-edit-field">
                                <label className="quiz-edit-label" htmlFor="manage-quiz-class-year">
                                    Class Year
                                </label>
                                <select
                                    id="manage-quiz-class-year"
                                    className="quiz-edit-select"
                                    value={manageQuizClassYear}
                                    onChange={(event) => {
                                        const value = event.target.value;
                                        setManageQuizClassYear(value);
                                        setManageQuizClassDay("");
                                        setManageQuizClassDays([]);
                                        setManageQuizError("");
                                        loadManageQuizClassDays(manageQuizCategory, value);
                                    }}
                                >
                                    <option value="">Select Class Year</option>
                                    {manageQuizClassYears.map((classYear) => (
                                        <option key={classYear} value={classYear}>
                                            {classYear}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="quiz-edit-field">
                                <label className="quiz-edit-label" htmlFor="manage-quiz-class-day">
                                    Class Day
                                </label>
                                <select
                                    id="manage-quiz-class-day"
                                    className="quiz-edit-select"
                                    value={manageQuizClassDay}
                                    onChange={(event) => {
                                        setManageQuizClassDay(event.target.value);
                                        setManageQuizError("");
                                    }}
                                >
                                    <option value="">Select Class Day</option>
                                    {manageQuizClassDays.map((classDay) => (
                                        <option key={classDay} value={classDay}>
                                            {classDay}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button type="button" onClick={handleLoadManageQuiz}>
                                Load Quiz
                            </button>
                        </div>
                    </div>
                </article>

                {manageQuizLoading && <p>Loading...</p>}
                {!manageQuizLoading && manageQuizError && <p>{manageQuizError}</p>}
                {!latestQuizLoading && latestQuizError && <p>{latestQuizError}</p>}
                {!manageQuizLoading && !manageQuizError && !latestQuizError && latestQuiz && (
                    <>
                        {!isEditingQuiz && (
                            <button type="button" onClick={() => setIsEditingQuiz(true)}>
                                Edit Quiz
                            </button>
                        )}

                        {isEditingQuiz && editableQuiz ? (
                            <>
                                <article className="gamified-dashboard-card">
                                    <div className="gamified-dashboard-content">
                                        <div className="quiz-edit-form">
                                            <div className="quiz-edit-field">
                                                <label className="quiz-edit-label" htmlFor="quiz-title">
                                                    Quiz Title
                                                </label>
                                                <input
                                                    id="quiz-title"
                                                    className="quiz-edit-input"
                                                    type="text"
                                                    value={editableQuiz.quiz_title}
                                                    onChange={(event) =>
                                                        updateEditableQuizField("quiz_title", event.target.value)
                                                    }
                                                />
                                            </div>

                                            <div className="quiz-edit-field">
                                                <label className="quiz-edit-label" htmlFor="quiz-instructions">
                                                    Instructions
                                                </label>
                                                <textarea
                                                    id="quiz-instructions"
                                                    className="quiz-edit-textarea quiz-edit-instructions"
                                                    value={editableQuiz.instructions}
                                                    onChange={(event) =>
                                                        updateEditableQuizField("instructions", event.target.value)
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <p><strong>Term:</strong> {latestQuiz.term_name}</p>
                                        <p><strong>Category:</strong> {latestQuiz.category}</p>
                                        <p><strong>Class Year:</strong> {latestQuiz.class_year}</p>
                                        <p><strong>Class Day:</strong> {latestQuiz.class_day}</p>
                                        <p><strong>Session:</strong> {latestQuiz.session}</p>
                                        <p><strong>Activity Type:</strong> {latestQuiz.activity_type}</p>
                                        <p><strong>Topic:</strong> {latestQuiz.topic}</p>
                                        <p><strong>Generated At:</strong> {latestQuiz.generated_at}</p>
                                    </div>
                                </article>

                                <div className="admin-overview-grid">
                                    {editableQuiz.questions.map((question, questionIndex) => (
                                        <article
                                            className="gamified-dashboard-card"
                                            key={`editable-question-${questionIndex}`}
                                        >
                                            <div className="gamified-dashboard-content">
                                                <h2>Question {questionIndex + 1}</h2>

                                                <div className="quiz-edit-form">
                                                    <div className="quiz-edit-field">
                                                        <label
                                                            className="quiz-edit-label"
                                                            htmlFor={`question-category-${questionIndex}`}
                                                        >
                                                            Category
                                                        </label>
                                                        <input
                                                            id={`question-category-${questionIndex}`}
                                                            className="quiz-edit-input"
                                                            type="text"
                                                            value={question.category}
                                                            onChange={(event) =>
                                                                updateEditableQuestionField(
                                                                    questionIndex,
                                                                    "category",
                                                                    event.target.value
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    <div className="quiz-edit-field">
                                                        <label
                                                            className="quiz-edit-label"
                                                            htmlFor={`question-prompt-${questionIndex}`}
                                                        >
                                                            Prompt
                                                        </label>
                                                        <textarea
                                                            id={`question-prompt-${questionIndex}`}
                                                            className="quiz-edit-textarea quiz-edit-prompt"
                                                            value={question.prompt}
                                                            onChange={(event) =>
                                                                updateEditableQuestionField(
                                                                    questionIndex,
                                                                    "prompt",
                                                                    event.target.value
                                                                )
                                                            }
                                                        />
                                                    </div>

                                                    {question.options.map((option, optionIndex) => (
                                                        <div
                                                            className="quiz-edit-field"
                                                            key={`editable-option-${optionIndex}`}
                                                        >
                                                            <label
                                                                className="quiz-edit-label"
                                                                htmlFor={`question-option-${questionIndex}-${optionIndex}`}
                                                            >
                                                                Option {String.fromCharCode(65 + optionIndex)}
                                                            </label>
                                                            <input
                                                                id={`question-option-${questionIndex}-${optionIndex}`}
                                                                className="quiz-edit-input"
                                                                type="text"
                                                                value={option}
                                                                onChange={(event) =>
                                                                    updateEditableQuestionOption(
                                                                        questionIndex,
                                                                        optionIndex,
                                                                        event.target.value
                                                                    )
                                                                }
                                                            />
                                                        </div>
                                                    ))}

                                                    <div className="quiz-edit-field">
                                                        <label
                                                            className="quiz-edit-label"
                                                            htmlFor={`question-answer-${questionIndex}`}
                                                        >
                                                            Correct Answer
                                                        </label>
                                                        <select
                                                            id={`question-answer-${questionIndex}`}
                                                            className="quiz-edit-select"
                                                        value={question.answer}
                                                            onChange={(event) =>
                                                                updateEditableQuestionField(
                                                                    questionIndex,
                                                                    "answer",
                                                                    event.target.value
                                                                )
                                                            }
                                                        >
                                                            {question.options.map((option, optionIndex) => (
                                                                <option
                                                                    key={`answer-option-${questionIndex}-${optionIndex}`}
                                                                    value={option}
                                                                >
                                                                    {option}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>

                                <div className="quiz-edit-actions">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditableQuiz(latestQuiz.quiz_json);
                                            setIsEditingQuiz(false);
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button type="button" onClick={handleSaveQuiz}>
                                        Save Changes
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <article className="gamified-dashboard-card">
                                    <div className="gamified-dashboard-content">
                                        <h2>{latestQuiz.quiz_json.quiz_title}</h2>
                                        <p>
                                            <strong>Instructions:</strong>{" "}
                                            {latestQuiz.quiz_json.instructions}
                                        </p>
                                        <p><strong>Term:</strong> {latestQuiz.term_name}</p>
                                        <p><strong>Category:</strong> {latestQuiz.category}</p>
                                        <p><strong>Class Year:</strong> {latestQuiz.class_year}</p>
                                        <p><strong>Class Day:</strong> {latestQuiz.class_day}</p>
                                        <p><strong>Session:</strong> {latestQuiz.session}</p>
                                        <p><strong>Activity Type:</strong> {latestQuiz.activity_type}</p>
                                        <p><strong>Topic:</strong> {latestQuiz.topic}</p>
                                        <p><strong>Generated At:</strong> {latestQuiz.generated_at}</p>
                                    </div>
                                </article>

                                <div className="admin-overview-grid">
                                    {latestQuiz.quiz_json.questions.map((question, questionIndex) => (
                                        <article
                                            className="gamified-dashboard-card"
                                            key={`${question.prompt}-${questionIndex}`}
                                        >
                                            <div className="gamified-dashboard-content">
                                                <h2>Question {questionIndex + 1}</h2>
                                                <p><strong>{question.category}</strong></p>
                                                <p>{question.prompt}</p>

                                                {question.options.map((option, optionIndex) => (
                                                    <p key={`${option}-${optionIndex}`}>
                                                        {option}
                                                    </p>
                                                ))}

                                                <p>
                                                    <strong>Correct Answer:</strong> {question.answer}
                                                </p>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </section>
        );
    }

    if (activeSection === "dashboard") {
        return (
            <Dashboard
                loggedInUser={interviewAdmin}
                onBack={() => setActiveSection(null)}
            />
        );
    }

    return (
        <section className="admin-overview-grid">
            <article
                className="gamified-dashboard-card"
                onClick={() => setActiveSection("dashboard")}
            >
                <div className="gamified-dashboard-icon">
                    <svg
                        width="42"
                        height="42"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect
                            x="3"
                            y="3"
                            width="7"
                            height="7"
                            rx="1.5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        />
                        <rect
                            x="14"
                            y="3"
                            width="7"
                            height="7"
                            rx="1.5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        />
                        <rect
                            x="3"
                            y="14"
                            width="7"
                            height="7"
                            rx="1.5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        />
                        <rect
                            x="14"
                            y="14"
                            width="7"
                            height="7"
                            rx="1.5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        />
                    </svg>
                </div>

                <div className="gamified-dashboard-content">
                    <h2>Dashboard</h2>
                    <p>
                        View your Gamified Quiz configuration and scheduler status.
                    </p>
                </div>

                <div className="gamified-dashboard-arrow">
                    →
                </div>
            </article>
            <article
                className="gamified-dashboard-card"
                onClick={() => setActiveSection("academicTerm")}
            >
                <div className="gamified-dashboard-icon">
                    <svg
                        width="42"
                        height="42"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect
                            x="3"
                            y="4"
                            width="18"
                            height="16"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        />
                        <path
                            d="M7 2V6"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M17 2V6"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M3 9H21"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        />
                        <path
                            d="M7 13H9"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M11 13H13"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M15 13H17"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <div className="gamified-dashboard-content">
                    <h2>Academic Term</h2>
                    <p>
                        Manage academic terms for the Gamified Quiz system.
                    </p>
                </div>

                <div className="gamified-dashboard-arrow">
                    →
                </div>
            </article>
            <article
                className="gamified-dashboard-card"
                onClick={() => setActiveSection("classConfiguration")}
            >
                <div className="gamified-dashboard-icon">
                    <svg
                        width="42"
                        height="42"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M4 5C4 3.89543 4.89543 3 6 3H18C19.1046 3 20 3.89543 20 5V19C20 20.1046 19.1046 21 18 21H6C4.89543 21 4 20.1046 4 19V5Z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        />
                        <path
                            d="M8 7H16"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M8 11H16"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M8 15H13"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <div className="gamified-dashboard-content">
                    <h2>Class Configuration</h2>
                    <p>
                        Configure and manage classes for the Gamified Quiz system.
                    </p>
                </div>

                <div className="gamified-dashboard-arrow">
                    →
                </div>
            </article>
            <article
                className="gamified-dashboard-card"
                onClick={() => setActiveSection("sessionTopics")}
            >
                <div className="gamified-dashboard-icon">
                    <svg
                        width="42"
                        height="42"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M4 6H20"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M4 12H20"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M4 18H14"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <div className="gamified-dashboard-content">
                    <h2>Session Topics</h2>
                    <p>
                        Import and manage session topics for the Gamified Quiz system.
                    </p>
                </div>

                <div className="gamified-dashboard-arrow">
                    →
                </div>
            </article>
            <article
                className="gamified-dashboard-card"
                onClick={() => setActiveSection("activityTypes")}
            >
                <div className="gamified-dashboard-icon">
                    <svg
                        width="42"
                        height="42"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M4 6H20"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M4 12H20"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M4 18H14"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <div className="gamified-dashboard-content">
                    <h2>Activity Type</h2>
                    <p>
                        Manage activity types for the Gamified Quiz system.
                    </p>
                </div>

                <div className="gamified-dashboard-arrow">
                    →
                </div>
            </article>
            <article
                className="gamified-dashboard-card"
                onClick={() => setActiveSection("quizScheduler")}
            >
                <div className="gamified-dashboard-icon">
                    <svg
                        width="42"
                        height="42"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M4 6H20"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M4 12H20"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M4 18H14"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <div className="gamified-dashboard-content">
                    <h2>Scheduler</h2>
                    <p>
                        Configure and run the Gamified Quiz scheduler.
                    </p>
                </div>

                <div className="gamified-dashboard-arrow">
                    →
                </div>
            </article>
            <article
                className="gamified-dashboard-card"
                onClick={() => setActiveSection("schedulerRuns")}
            >
                <div className="gamified-dashboard-icon">
                    <svg
                        width="42"
                        height="42"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M4 6H20"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M4 12H20"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M4 18H14"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <div className="gamified-dashboard-content">
                    <h2>Scheduler Runs</h2>
                    <p>
                        View and manage Gamified Quiz scheduler runs.
                    </p>
                </div>

                <div className="gamified-dashboard-arrow">
                    →
                </div>
            </article>
            <article
                className="gamified-dashboard-card"
                onClick={() => setActiveSection("generateGamifiedQuizzes")}
            >
                <div className="gamified-dashboard-icon">
                    <svg
                        width="42"
                        height="42"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M4 6H20"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M4 12H20"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M4 18H14"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <div className="gamified-dashboard-content">
                    <h2>Generate Quizzes</h2>
                    <p>
                        Generate gamified quizzes for students using the configured session topics and activity types.
                    </p>
                </div>

                <div className="gamified-dashboard-arrow">
                    →
                </div>
            </article>
            <article
                className="gamified-dashboard-card"
                onClick={() => setActiveSection("leaderboard")}
            >
                <div className="gamified-dashboard-icon">
                    <svg
                        width="42"
                        height="42"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M4 6H20"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M4 12H20"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M4 18H14"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <div className="gamified-dashboard-content">
                    <h2>Leaderboard</h2>
                    <p>
                        View student quiz performance and leaderboard results.
                    </p>
                </div>

                <div className="gamified-dashboard-arrow">
                    →
                </div>
            </article>

            <article
                className="gamified-dashboard-card"
                onClick={() => {
                    setActiveSection("manageQuiz");
                    setLatestQuiz(null);
                    setEditableQuiz(null);
                    setManageQuizError("");
                    setLatestQuizError("");
                    setIsEditingQuiz(false);
                }}
            >
                <div className="gamified-dashboard-icon">
                    <svg
                        width="42"
                        height="42"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect
                            x="4"
                            y="4"
                            width="16"
                            height="16"
                            rx="2"
                            stroke="currentColor"
                            strokeWidth="1.8"
                        />
                        <path
                            d="M8 9H16"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M8 13H16"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                        <path
                            d="M8 17H13"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                        />
                    </svg>
                </div>

                <div className="gamified-dashboard-content">
                    <h2>Manage Quiz</h2>
                    <p>
                        Manage generated quizzes and quiz content.
                    </p>
                </div>

                <div className="gamified-dashboard-arrow">
                    →
                </div>
            </article>
        </section>
    );
}