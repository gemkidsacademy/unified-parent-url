import React, { useEffect, useState } from "react";
import "./GuestCredentials.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
        

export default function GuestCredentials({ loggedInUser, onBack }) {
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadGuests();
    }, []);

    const loadGuests = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await fetch(`${API_BASE}/guest/users`);

            if (!res.ok) {
                throw new Error("Failed to load guest users");
            }

            const data = await res.json();

            setGuests(data);

        } catch (err) {
            console.error("Error loading guest users:", err);
            setError("Unable to load guest users.");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (value) => {
        if (!value) return "-";

        return new Date(value).toLocaleString("en-AU", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };
    const downloadCSV = () => {
    if (guests.length === 0) return;

    const headers = [
        "ID",
        "Full Name",
        "Contact",
        "Method",
        "Category",
        "Class Year",
        "Registered",
        "Last Login",
        "Status",
    ];

    const rows = guests.map((guest) => [
        guest.id,
        guest.full_name,
        guest.contact,
        guest.contact_method,
        guest.category,
        guest.class_year,
        formatDate(guest.registered_at),
        formatDate(guest.last_login),
        guest.is_active ? "Active" : "Inactive",
    ]);

    const escapeCSV = (value) => {
        if (value === null || value === undefined) return "";

        const stringValue = String(value);

        return `"${stringValue.replace(/"/g, '""')}"`;
    };

    const csvContent = [
        headers.map(escapeCSV).join(","),
        ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
        type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `guest-credentials-${new Date()
        .toISOString()
        .split("T")[0]}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};


    return (
        <div className="guest-credentials">
            <button
                type="button"
                className="guest-credentials-back-btn"
                onClick={onBack}
            >
                <span className="back-arrow">←</span>
                <span>Back</span>
            </button>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                }}
            >
                <div>
                    <h2 style={{ margin: 0 }}>Guest Credentials</h2>

                    <p style={{ marginTop: "6px" }}>
                        View registered guest users and their account information.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={downloadCSV}
                    disabled={loading || guests.length === 0}
                    style={{
                        padding: "10px 16px",
                        border: "none",
                        borderRadius: "6px",
                        background: "#4285d4",
                        color: "#fff",
                        cursor:
                            loading || guests.length === 0
                                ? "not-allowed"
                                : "pointer",
                        opacity:
                            loading || guests.length === 0
                                ? 0.6
                                : 1,
                        fontWeight: "500",
                    }}
                >
                    Download CSV
                </button>
            </div>

            {loading && (
                <p>Loading guest users...</p>
            )}

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            {!loading && !error && guests.length === 0 && (
                <p>No guest users found.</p>
            )}

            {!loading && !error && guests.length > 0 && (
                <div style={{ overflowX: "auto" }}>

                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            marginTop: "20px",
                        }}
                    >

                        <thead>
                            <tr>
                                <th style={thStyle}>ID</th>
                                <th style={thStyle}>Full Name</th>
                                <th style={thStyle}>Contact</th>
                                <th style={thStyle}>Method</th>
                                <th style={thStyle}>Category</th>
                                <th style={thStyle}>Class Year</th>
                                <th style={thStyle}>Registered</th>
                                <th style={thStyle}>Last Login</th>
                                <th style={thStyle}>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {guests.map((guest) => (
                                <tr key={guest.id}>

                                    <td style={tdStyle}>
                                        {guest.id}
                                    </td>

                                    <td style={tdStyle}>
                                        {guest.full_name}
                                    </td>

                                    <td style={tdStyle}>
                                        {guest.contact}
                                    </td>

                                    <td style={tdStyle}>
                                        {guest.contact_method}
                                    </td>

                                    <td style={tdStyle}>
                                        {guest.category}
                                    </td>

                                    <td style={tdStyle}>
                                        {guest.class_year}
                                    </td>

                                    <td style={tdStyle}>
                                        {formatDate(guest.registered_at)}
                                    </td>

                                    <td style={tdStyle}>
                                        {formatDate(guest.last_login)}
                                    </td>

                                    <td style={tdStyle}>
                                        {guest.is_active
                                            ? "Active"
                                            : "Inactive"}
                                    </td>

                                </tr>
                            ))}
                        </tbody>

                    </table>

                </div>
            )}

        </div>
    );
}


const thStyle = {
    padding: "12px",
    borderBottom: "2px solid #ddd",
    textAlign: "left",
    background: "#f5f7fa",
    fontWeight: "600",
};

const tdStyle = {
    padding: "12px",
    borderBottom: "1px solid #eee",
};