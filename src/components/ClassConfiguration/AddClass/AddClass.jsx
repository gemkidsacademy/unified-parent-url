import React, { useState, useEffect } from "react";
import "./AddClass.css";

export default function AddClass({
    loggedInUser,
    editingClass,
    selectedTerm,
    onBack,
}) {
    const server =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    

    const [classYear, setClassYear] = useState(
        editingClass?.class_year || editingClass?.year || ""
    );

    const [classDay, setClassDay] = useState(
        editingClass?.class_day || editingClass?.day || ""
    );

    const [category, setCategory] = useState(
        editingClass?.category || ""
    );

    const [categories, setCategories] = useState([]);
    const [classYears, setClassYears] = useState([]);
    const [classDays, setClassDays] = useState([]);

    const loadCategories = async () => {
        try {
            const res = await fetch(
                `${server}/classes/${loggedInUser.center_code}`
            );

            if (!res.ok) {
                throw new Error("Failed to load classes");
            }

            const data = await res.json();

            // Backend returns:
            // [
            //   { id:1, class_name:"Selective" },
            //   { id:2, class_name:"NAPLAN" }
            // ]

            setCategories(
                data.map((item) => item.class_name)
            );

        } catch (err) {
            console.error(err);
        }
    };

    const loadClassYears = async (selectedCategory) => {
        try {
            const res = await fetch(
                `${server}/class-configuration/class-years`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        center_code: loggedInUser.center_code,
                        category: selectedCategory,
                    }),
                }
            );

            const data = await res.json();

            if (res.ok) {
                setClassYears(data.class_years || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadClassDays = async (selectedCategory, selectedYear) => {
        try {
            const res = await fetch(
                `${server}/class-configuration/class-days`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        center_code: loggedInUser.center_code,
                        category: selectedCategory,
                        class_year: selectedYear,
                    }),
                }
            );

            const data = await res.json();

            if (res.ok) {
                setClassDays(data.class_days || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const initializeForm = async () => {
            await loadCategories();

            if (editingClass) {
                const existingYear =
                    editingClass.class_year || editingClass.year || "";

                await loadClassYears(editingClass.category);

                if (existingYear) {
                    await loadClassDays(
                        editingClass.category,
                        existingYear
                    );
                }
            }
        };

        if (loggedInUser) {
            initializeForm();
        }
    }, [loggedInUser, editingClass, selectedTerm]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedTerm || !selectedTerm.id) {
            alert("Please select an academic term first.");
            return;
        }

        if (!category) {
            alert("Please select a category.");
            return;
        }

        if (!classYear) {
            alert("Please select a class year.");
            return;
        }

        if (!classDay) {
            alert("Please select a class day.");
            return;
        }

        try {
            const url = editingClass
                ? `${server}/class-configuration/${editingClass.id}`
                : `${server}/class-configuration`;

            const method = editingClass ? "PUT" : "POST";

            const payload = {
                center_code: loggedInUser.center_code,
                term_id: selectedTerm.id,
                term_name: selectedTerm.term_name,
                category: category,
                class_year: classYear,
                class_day: classDay,
            };

            const res = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.message);

                setCategory("");
                setClassYear("");
                setClassDay("");
                setClassYears([]);
                setClassDays([]);

                await loadCategories();

                if (onBack) {
                    onBack();
                }
            } else {
                alert(data.detail || "Unable to save class.");
            }
        } catch (err) {
            console.error(err);
            alert("Unable to connect to the server.");
        }
    };

    return (
        <div className="add-class">
            <h2>
                {editingClass ? "Edit Class" : "Add Class"}
            </h2>

            <p className="description">
                Create a new teaching class that will later be used by the
                scheduler to generate gamified quizzes.
            </p>

            {selectedTerm ? (
                <p className="description">
                    <strong>Academic Term:</strong> {selectedTerm.term_name}
                </p>
            ) : (
                <p className="description" style={{ color: "#b45309" }}>
                    Please select an academic term before adding a class.
                </p>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Class</label>

                    <select
                        value={category}
                        onChange={(e) => {
                            const value = e.target.value;

                            setCategory(value);
                            setClassYear("");
                            setClassDay("");
                            setClassYears([]);
                            setClassDays([]);

                            if (value) {
                                loadClassYears(value);
                            }
                        }}
                    >
                        <option value="">Select Category</option>

                        {categories.map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Class Year</label>

                    <select
                        value={classYear}
                        disabled={!category}
                        onChange={(e) => {
                            const value = e.target.value;

                            setClassYear(value);
                            setClassDay("");
                            setClassDays([]);

                            if (value) {
                                loadClassDays(category, value);
                            }
                        }}
                    >
                        <option value="">Select Class Year</option>

                        {classYears.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Class Day</label>

                    <select
                        value={classDay}
                        disabled={!classYear}
                        onChange={(e) => setClassDay(e.target.value)}
                    >
                        <option value="">Select Day</option>

                        {classDays.map((day) => (
                            <option key={day} value={day}>
                                {day}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="button-row">
                    <button
                        type="submit"
                        className="save-btn"
                        disabled={!selectedTerm}
                    >
                        {editingClass ? "Edit Class" : "Save Class"}
                    </button>

                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={onBack}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}