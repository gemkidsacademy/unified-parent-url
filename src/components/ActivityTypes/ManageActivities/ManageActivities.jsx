import React, { useState, useEffect } from "react";
import "./ManageActivities.css";

export default function ManageActivities({
    loggedInUser,
    selectedTerm,
    onBack,
}) {
    const server =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

    const [search, setSearch] = useState("");
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    // ---------------------------------------
    // Inline edit state
    // ---------------------------------------
    const [editingActivityId, setEditingActivityId] = useState(null);
    const [editForm, setEditForm] = useState({
        activity_name: "",
        is_enabled: true,
    });

    // ---------------------------------------
    // Load activities for selected term
    // ---------------------------------------
    const loadActivities = async () => {
        if (!selectedTerm?.id) {
            setActivities([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const res = await fetch(
                `${server}/activity-types/list`,
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
                setActivities(data.activities || []);
            } else {
                setActivities([]);
                alert(data.detail || "Unable to load activity types.");
            }
        } catch (err) {
            console.error(err);
            setActivities([]);
            alert("Unable to connect to the server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (loggedInUser && selectedTerm) {
            loadActivities();
        } else {
            setActivities([]);
            setLoading(false);
        }
    }, [loggedInUser, selectedTerm]);

    // ---------------------------------------
    // Start inline edit
    // ---------------------------------------
    const startEdit = (activity) => {
        setEditingActivityId(activity.id);
        setEditForm({
            activity_name: activity.activity_name || "",
            is_enabled: activity.is_enabled ?? true,
        });
    };

    // ---------------------------------------
    // Cancel inline edit
    // ---------------------------------------
    const cancelEdit = () => {
        setEditingActivityId(null);
        setEditForm({
            activity_name: "",
            is_enabled: true,
        });
    };

    // ---------------------------------------
    // Save inline edit
    // ---------------------------------------
    const handleUpdate = async (activityId) => {
    if (!editForm.activity_name.trim()) {
        alert("Please enter an activity name.");
        return;
    }

    try {
        const res = await fetch(
            `${server}/activity-types/${activityId}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    center_code: loggedInUser.center_code,
                    term_id: selectedTerm.id,
                    term_name: selectedTerm.term_name,
                    activity_name: editForm.activity_name.trim(),
                    is_enabled: editForm.is_enabled,
                }),
            }
        );

        const data = await res.json();

        if (res.ok) {
            alert(data.message || "Activity updated successfully.");
            setEditingActivityId(null);
            loadActivities();
        } else {
            alert(data.detail || "Unable to update activity.");
        }
    } catch (err) {
        console.error(err);
        alert("Unable to connect to the server.");
    }
};
    // ---------------------------------------
    // Toggle enabled / disabled from table
    // ---------------------------------------
    const toggleStatus = async (activity) => {
        try {
            const res = await fetch(
                `${server}/activity-types/${activity.id}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        is_enabled: !activity.is_enabled,
                    }),
                }
            );

            const data = await res.json();

            if (res.ok) {
                loadActivities();
            } else {
                alert(data.detail || "Unable to update activity status.");
            }
        } catch (err) {
            console.error(err);
            alert("Unable to connect to the server.");
        }
    };

    // ---------------------------------------
    // Delete activity
    // ---------------------------------------
    const deleteActivity = async (id) => {
        if (!window.confirm("Delete this activity?")) {
            return;
        }

        try {
            const res = await fetch(
                `${server}/activity-types/${id}`,
                {
                    method: "DELETE",
                }
            );

            const data = await res.json();

            if (res.ok) {
                alert(data.message || "Activity deleted successfully.");
                loadActivities();
            } else {
                alert(data.detail || "Unable to delete activity.");
            }
        } catch (err) {
            console.error(err);
            alert("Unable to connect to the server.");
        }
    };

    // ---------------------------------------
    // Search filter
    // ---------------------------------------
    const filteredActivities = activities.filter((activity) =>
        activity.activity_name
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div className="manage-activities">
            <h2>Manage Activity Types</h2>

            <p className="description">
                View, search, edit, enable, disable and delete activity
                types configured for the selected academic term.
            </p>

            {selectedTerm ? (
                <p className="description">
                    <strong>Academic Term:</strong> {selectedTerm.term_name}
                </p>
            ) : (
                <p className="description" style={{ color: "#b45309" }}>
                    Please select an academic term first.
                </p>
            )}

            <div className="toolbar">
                <input
                    type="text"
                    placeholder="Search activity..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    disabled={!selectedTerm}
                />

                <button
                    className="back-btn"
                    onClick={onBack}
                >
                    Back
                </button>
            </div>

            {!selectedTerm ? (
                <div className="empty-state">
                    Select an academic term to view activity types.
                </div>
            ) : loading ? (
                <p>Loading activity types...</p>
            ) : filteredActivities.length === 0 ? (
                <div className="empty-state">
                    No activity types found for this term.
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="activities-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Activity Type</th>
                                <th>Available</th>
                                <th>Last Updated</th>
                                <th>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredActivities.map((activity) => {
                                const isEditing =
                                    editingActivityId === activity.id;

                                return (
                                    <tr key={activity.id}>
                                        <td>{activity.id}</td>

                                        <td>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editForm.activity_name}
                                                    onChange={(e) =>
                                                        setEditForm({
                                                            ...editForm,
                                                            activity_name:
                                                                e.target.value,
                                                        })
                                                    }
                                                />
                                            ) : (
                                                activity.activity_name
                                            )}
                                        </td>

                                        <td>
                                            {isEditing ? (
                                                <label className="checkbox-label">
                                                    <input
                                                        type="checkbox"
                                                        checked={editForm.is_enabled}
                                                        onChange={(e) =>
                                                            setEditForm({
                                                                ...editForm,
                                                                is_enabled:
                                                                    e.target.checked,
                                                            })
                                                        }
                                                    />
                                                    {editForm.is_enabled
                                                        ? " Enabled"
                                                        : " Disabled"}
                                                </label>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className={
                                                        activity.is_enabled
                                                            ? "status-enabled"
                                                            : "status-disabled"
                                                    }
                                                    onClick={() =>
                                                        toggleStatus(activity)
                                                    }
                                                >
                                                    {activity.is_enabled
                                                        ? "Enabled"
                                                        : "Disabled"}
                                                </button>
                                            )}
                                        </td>

                                        <td>
                                            {activity.updated_at
                                                ? new Date(activity.updated_at).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric",
                                                })
                                                : "-"}
                                            </td>

                                        <td>
                                            <div className="action-buttons">
                                                {isEditing ? (
                                                    <>
                                                        <button
                                                            className="save-btn"
                                                            onClick={() =>
                                                                handleUpdate(
                                                                    activity.id
                                                                )
                                                            }
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
                                                            onClick={() =>
                                                                startEdit(activity)
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            className="delete-btn"
                                                            onClick={() =>
                                                                deleteActivity(
                                                                    activity.id
                                                                )
                                                            }
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

            <div className="assumption-box">
                <h3>Implementation Assumption (Please Confirm)</h3>

                <ul>
                    <li>
                        Activity types are configured separately for each
                        academic term.
                    </li>

                    <li>
                        Only enabled activity types for the selected term
                        are eligible for quiz generation.
                    </li>

                    <li>
                        Editing or deleting an activity only affects the
                        selected academic term.
                    </li>

                    <li>
                        The scheduler should later read activity types from
                        the active term when generating gamified quizzes.
                    </li>
                </ul>
            </div>
        </div>
    );
}