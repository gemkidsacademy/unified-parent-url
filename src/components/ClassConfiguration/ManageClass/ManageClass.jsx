import React, { useEffect, useState } from "react";
import "./ManageClass.css";
export default function ManageClasses({
    loggedInUser,
    selectedTerm,
    onBack,
}) {
    const server =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // inline edit state
    const [editingClassId, setEditingClassId] = useState(null);
    const [editForm, setEditForm] = useState({
        category: "",
        class_year: "",
        class_day: "",
    });

    // dropdown data for edit mode
    const [categories, setCategories] = useState([]);
    const [classYears, setClassYears] = useState([]);
    const [classDays, setClassDays] = useState([]);

    // ---------------------------------------
    // Load configured classes for selected term
    // ---------------------------------------
    const loadClasses = async () => {
        if (!selectedTerm?.id) {
            setClasses([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const res = await fetch(
                `${server}/class-configuration/list`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        center_code: loggedInUser.center_code,
                        term_id: selectedTerm.id,
                    }),
                }
            );

            const data = await res.json();

            if (res.ok) {
                setClasses(data.classes || []);
            } else {
                setClasses([]);
                alert(data.detail || "Failed to load classes.");
            }
        } catch (err) {
            console.error(err);
            alert("Unable to fetch class configurations.");
            setClasses([]);
        } finally {
            setLoading(false);
        }
    };

    // ---------------------------------------
    // Load dropdown options
    // ---------------------------------------
    const loadCategories = async () => {
        try {
            const res = await fetch(
                `${server}/class-configuration/categories`,
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

            const data = await res.json();

            if (res.ok) {
                setCategories(data.categories || []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadClassYears = async (selectedCategory) => {
        if (!selectedCategory) {
            setClassYears([]);
            return;
        }

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
            } else {
                setClassYears([]);
            }
        } catch (err) {
            console.error(err);
            setClassYears([]);
        }
    };

    const loadClassDays = async (selectedCategory, selectedYear) => {
        if (!selectedCategory || !selectedYear) {
            setClassDays([]);
            return;
        }

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
            } else {
                setClassDays([]);
            }
        } catch (err) {
            console.error(err);
            setClassDays([]);
        }
    };

    useEffect(() => {
        if (loggedInUser && selectedTerm) {
            loadClasses();
            loadCategories();
        } else {
            setClasses([]);
            setLoading(false);
        }
    }, [loggedInUser, selectedTerm]);

    // ---------------------------------------
    // Search filter
    // ---------------------------------------
    const filteredClasses = classes.filter((item) =>
        `${item.category} ${item.year} ${item.day}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    // ---------------------------------------
    // Start inline edit
    // ---------------------------------------
    const startEdit = async (item) => {
        setEditingClassId(item.id);

        setEditForm({
            category: item.category || "",
            class_year: item.class_year || item.year || "",
            class_day: item.class_day || item.day || "",
        });

        await loadClassYears(item.category);
        await loadClassDays(
            item.category,
            item.class_year || item.year || ""
        );
    };

    const cancelEdit = () => {
        setEditingClassId(null);
        setEditForm({
            category: "",
            class_year: "",
            class_day: "",
        });
        setClassYears([]);
        setClassDays([]);
    };

    // ---------------------------------------
    // Update class configuration
    // ---------------------------------------
    const handleUpdate = async (classId) => {
        if (!selectedTerm?.id) {
            alert("Please select an academic term first.");
            return;
        }

        if (!editForm.category || !editForm.class_year || !editForm.class_day) {
            alert("Please complete all fields before saving.");
            return;
        }

        try {
            const res = await fetch(
                `${server}/class-configuration/${classId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        term_id: selectedTerm.id,
                        term_name: selectedTerm.term_name,
                        category: editForm.category,
                        class_year: editForm.class_year,
                        class_day: editForm.class_day,
                    }),
                }
            );

            const data = await res.json();

            if (res.ok) {
                alert(data.message || "Class configuration updated successfully.");
                setEditingClassId(null);
                loadClasses();
            } else {
                alert(data.detail || "Failed to update class configuration.");
            }
        } catch (err) {
            console.error(err);
            alert("Unable to connect to the server.");
        }
    };

    // ---------------------------------------
    // Delete class configuration
    // ---------------------------------------
    const handleDelete = async (classId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this class configuration?"
        );

        if (!confirmed) return;

        try {
            const res = await fetch(
                `${server}/class-configuration/${classId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await res.json();

            if (res.ok) {
                alert(data.message || "Class configuration deleted successfully.");
                loadClasses();
            } else {
                alert(data.detail || "Failed to delete class configuration.");
            }
        } catch (err) {
            console.error(err);
            alert("Unable to connect to the server.");
        }
    };

    return (
        <div className="manage-classes">
            <h2>Manage Classes</h2>

            <p className="description">
                View all configured classes for the selected academic term,
                edit them inline, or delete them when no longer needed.
            </p>

            <div className="button-row top-actions">
                <button className="back-btn" onClick={onBack}>
                    Back
                </button>
            </div>

            {selectedTerm ? (
                <p className="description">
                    <strong>Academic Term:</strong> {selectedTerm.term_name}
                </p>
            ) : (
                <p className="description" style={{ color: "#b45309" }}>
                    Please select an academic term first.
                </p>
            )}

            {!selectedTerm ? (
                <div className="empty-state">
                    Select an academic term to view configured classes.
                </div>
            ) : loading ? (
                <p>Loading class configurations...</p>
            ) : (
                <>
                    <div className="toolbar">
                        <input
                            type="text"
                            placeholder="Search classes..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {filteredClasses.length === 0 ? (
                        <div className="empty-state">
                            No classes found for this term.
                        </div>
                    ) : (
                        <div className="table-wrapper">
                            <table className="classes-table">
                                <thead>
                                    <tr>
                                        <th>Category</th>
                                        <th>Class Year</th>
                                        <th>Class Day</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredClasses.map((item) => {
                                        const isEditing = editingClassId === item.id;

                                        return (
                                            <tr key={item.id}>
                                                <td>
                                                    {isEditing ? (
                                                        <select
                                                            value={editForm.category}
                                                            onChange={async (e) => {
                                                                const value = e.target.value;

                                                                setEditForm({
                                                                    ...editForm,
                                                                    category: value,
                                                                    class_year: "",
                                                                    class_day: "",
                                                                });

                                                                setClassYears([]);
                                                                setClassDays([]);

                                                                await loadClassYears(value);
                                                            }}
                                                        >
                                                            <option value="">Select Category</option>
                                                            {categories.map((cat) => (
                                                                <option key={cat} value={cat}>
                                                                    {cat}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        item.category
                                                    )}
                                                </td>

                                                <td>
                                                    {isEditing ? (
                                                        <select
                                                            value={editForm.class_year}
                                                            disabled={!editForm.category}
                                                            onChange={async (e) => {
                                                                const value = e.target.value;

                                                                setEditForm({
                                                                    ...editForm,
                                                                    class_year: value,
                                                                    class_day: "",
                                                                });

                                                                setClassDays([]);
                                                                await loadClassDays(
                                                                    editForm.category,
                                                                    value
                                                                );
                                                            }}
                                                        >
                                                            <option value="">Select Class Year</option>
                                                            {classYears.map((year) => (
                                                                <option key={year} value={year}>
                                                                    {year}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        item.class_year || item.year
                                                    )}
                                                </td>

                                                <td>
                                                    {isEditing ? (
                                                        <select
                                                            value={editForm.class_day}
                                                            disabled={!editForm.class_year}
                                                            onChange={(e) =>
                                                                setEditForm({
                                                                    ...editForm,
                                                                    class_day: e.target.value,
                                                                })
                                                            }
                                                        >
                                                            <option value="">Select Day</option>
                                                            {classDays.map((day) => (
                                                                <option key={day} value={day}>
                                                                    {day}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        item.class_day || item.day
                                                    )}
                                                </td>

                                                <td>
                                                    <div className="action-buttons">
                                                        {isEditing ? (
                                                            <>
                                                                <button
                                                                    className="save-btn"
                                                                    onClick={() => handleUpdate(item.id)}
                                                                >
                                                                    Save
                                                                </button>

                                                                <button
                                                                    className="cancel-btn"
                                                                    onClick={cancelEdit}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    className="edit-btn"
                                                                    onClick={() => startEdit(item)}
                                                                >
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    className="delete-btn"
                                                                    onClick={() => handleDelete(item.id)}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            
        </div>
    );
}