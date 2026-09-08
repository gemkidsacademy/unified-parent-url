import React, { useEffect, useState } from "react";
import "./Leaderboard.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

        

export default function Leaderboard({ loggedInUser, onBack }) {
    const [terms, setTerms] = useState([]);
    const [categories, setCategories] = useState([]);
    const [classYears, setClassYears] = useState([]);
    const [sessions, setSessions] = useState([]);

    const [selectedClassYear, setSelectedClassYear] = useState("");
    const [selectedTerm, setSelectedTerm] = useState("");
    const [selectedSession, setSelectedSession] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [classDays, setClassDays] = useState([]);     
    const [selectedClassDay, setSelectedClassDay] = useState("");
    const [academicYears, setAcademicYears] = useState([]);
    const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
    

    const [leaderboard, setLeaderboard] = useState([]);
    const loadAcademicYears = async () => {
        try {
            const response = await fetch(
                `${API_BASE}/leaderboard/academic-years`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        center_code: loggedInUser.center_code,
                    }),
                }
            );

            const data = await response.json();

            console.log("Academic years:", data);

            setAcademicYears(
                Array.isArray(data.academic_years)
                    ? data.academic_years
                    : []
            );
        } catch (err) {
            console.log("Error loading academic years:", err);
            setAcademicYears([]);
        }
    };

    useEffect(() => {
        
        loadAcademicYears();
        
    }, []);


    const loadTerms = async (calendarYear) => {
    try {
        const response = await fetch(`${API_BASE}/leaderboard/academic-terms`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                center_code: loggedInUser.center_code,
                calendar_year: calendarYear,
            }),
        });

        const data = await response.json();

        console.log("Terms:", data);

        setTerms(Array.isArray(data) ? data : []);
    } catch (err) {
        console.log("Error loading terms:", err);
        setTerms([]);
    }
};

    const loadClassFilters = async (termId) => {
        try {
            const response = await fetch(
                `${API_BASE}/leaderboard/class-filters`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        center_code: loggedInUser.center_code,
                        calendar_year: selectedAcademicYear,
                        term_id: Number(termId),
                    }),
                }
            );

            const data = await response.json();

            console.log("Class Filters:", data);

            setCategories(
                Array.isArray(data.categories)
                    ? data.categories
                    : []
            );

            setClassYears(
                Array.isArray(data.class_years)
                    ? data.class_years
                    : []
            );

            setClassDays(
                Array.isArray(data.class_days)
                    ? data.class_days
                    : []
            );

        } catch (err) {
            console.log("Error loading class filters:", err);

            setCategories([]);
            setClassYears([]);
            setClassDays([]);
        }
    };
    const loadSessions = async (termId) => {
    try {
        const response = await fetch(
            `${API_BASE}/leaderboard/sessions`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    center_code: loggedInUser.center_code,
                    term_id: Number(termId),
                }),
            }
        );

        const data = await response.json();

        console.log("Sessions:", data);

        setSessions(
            Array.isArray(data.sessions)
                ? data.sessions
                : []
        );

    } catch (err) {
        console.log("Error loading sessions:", err);
        setSessions([]);
    }
};

    const handleAcademicYearChange = async (e) => {
    const year = e.target.value;

    setSelectedAcademicYear(year);

    // Reset downstream filters
    setSelectedTerm("");
    setSelectedCategory("");
    setSelectedClassYear("");
    setSelectedClassDay("");
    setSelectedSession("");

    setTerms([]);
    setCategories([]);
    setClassYears([]);
    setClassDays([]);
    setSessions([]);
    setLeaderboard([]);

    if (!year) return;

    await loadTerms(year);
};
    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);

        setSelectedClassYear("");
        setSelectedClassDay("");
        setSelectedSession("");

        
        
        setLeaderboard([]);

        // TODO:
        // loadClassYears(...)
    };
    const handleSessionChange = (e) => {
        setSelectedSession(Number(e.target.value));
        setLeaderboard([]);
    };
    const handleClassDayChange = (e) => {
    setSelectedClassDay(e.target.value);

    setSelectedSession("");

    setLeaderboard([]);
};
    const handleClassYearChange = (e) => {
    setSelectedClassYear(e.target.value);

    setSelectedClassDay("");
    setSelectedSession("");

    setLeaderboard([]);
};

    const handleTermChange = async (e) => {
    const termId = e.target.value;

    setSelectedTerm(termId);

    setSelectedCategory("");
    setSelectedClassYear("");
    setSelectedClassDay("");
    setSelectedSession("");

    setCategories([]);
    setClassYears([]);
    setClassDays([]);
    setSessions([]);
    setLeaderboard([]);

    if (!termId) return;

    await loadClassFilters(termId);
    await loadSessions(termId);
};

    const loadLeaderboard = async () => {
        if (
            !selectedClassYear ||
            !selectedTerm ||
            !selectedCategory ||
            !selectedClassDay
        ) {
            alert("Select class year, term, class and class day.");
            return;
        }

        try {
            const res = await fetch(`${API_BASE}/leaderboard`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    center_code: loggedInUser.center_code,
                    calendar_year: selectedAcademicYear,
                    term_id: Number(selectedTerm),
                    category: selectedCategory,
                    class_year: selectedClassYear,
                    class_day: selectedClassDay,
                    session: selectedSession
                    ? Number(selectedSession)
                    : null,
                }),
            });

            const data = await res.json();

            console.log("Leaderboard status:", res.status);
            console.log("Leaderboard response:", data);

            if (!res.ok) {
                console.log("Leaderboard load failed:", data);
                setLeaderboard([]);
                return;
            }

            setLeaderboard(Array.isArray(data) ? data : []);
        } catch (err) {
            console.log("Error loading leaderboard:", err);
        }
    };

    return (
        <div className="leaderboard">
            <button
                type="button"
                className="leaderboard-back-btn"
                onClick={onBack}
            >
                <span className="back-arrow">←</span>
                <span>Back</span>
            </button>

            <h2>Weekly Leaderboard</h2>

            <div className="filters">
                

                <div>
                    
                    <label>Calendar Year</label>
                   <select
                        value={selectedAcademicYear}
                        onChange={handleAcademicYearChange}
                    >
                        <option value="">Select</option>

                        {academicYears.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                    
                    <label>Academic Term</label>
                    <select
                        value={selectedTerm}
                        onChange={handleTermChange}
                        disabled={!selectedAcademicYear}
                    >
                        <option value="">Select</option>

                        {terms.map((term) => (
                            <option key={term.id} value={term.id}>
                                {term.term_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Class </label>
                    <select
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        disabled={!selectedTerm}
                    >
                        <option value="">Select</option>

                        {categories.map((category) => (
                            <option
                                key={category}
                                value={category}
                            >
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Class Year</label>
                    <select
                        value={selectedClassYear}
                        onChange={handleClassYearChange}
                        disabled={!selectedCategory}
                    >
                        <option value="">Select</option>

                        {Array.isArray(classYears) &&
                            classYears.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                    </select>
                </div>
                <div>
                    <label>Class Day</label>
                    <select
                        value={selectedClassDay}
                        onChange={handleClassDayChange}
                        disabled={!selectedClassYear}
                    >
                        <option value="">Select</option>

                        {Array.isArray(classDays) &&
                            classDays.map((day) => (
                                <option key={day} value={day}>
                                    {day}
                                </option>
                            ))}
                    </select>
                </div>

                <div>
                    <label>Session
                           (All Sessions if not selected)</label>
                    <select
                        value={selectedSession}
                        onChange={handleSessionChange}
                        disabled={!selectedClassDay}
                    >
                        <option value="">Select</option>

                        {sessions.map((session) => (
                            <option
                                key={session.session_number}
                                value={session.session_number}
                            >
                                {session.session_name}
                            </option>
                        ))}
                    </select>
                </div>

                

                <button onClick={loadLeaderboard}>
                    Load Leaderboard
                </button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Student</th>
                        <th>Category</th>
                        <th>Year</th>
                        <th>Day</th>
                        <th>Score</th>
                        <th>Completed</th>
                    </tr>
                </thead>

                <tbody>
                    {leaderboard.length === 0 ? (
                        <tr>
                            <td colSpan="7" style={{ textAlign: "center" }}>
                                No leaderboard data found.
                            </td>
                        </tr>
                    ) : (
                        leaderboard.map((row, index) => (
                            <tr key={row.id}>
                                <td>{index + 1}</td>
                                <td>{row.student_id}</td>
                                <td>{row.category}</td>
                                <td>{row.class_year}</td>
                                <td>{row.class_day}</td>
                                <td>
                                    {row.current_score}/{row.total_questions}
                                </td>
                                <td>
                                    {row.is_completed
                                        ? "Completed"
                                        : "In Progress"}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}