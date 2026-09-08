import React, { useState, useEffect } from "react";
import "./ConfigureScheduler.css";

export default function ConfigureScheduler({
    loggedInUser,
    onBack,
}) {

    const server =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    const [isSavingConfiguration, setIsSavingConfiguration] = useState(false);
    const [isRunningScheduler, setIsRunningScheduler] = useState(false);
    const [runTime, setRunTime] = useState("18:00");
    const [enabled, setEnabled] = useState(true);

    
    const [runDate, setRunDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    const [selectedDay, setSelectedDay] = useState("");

    const [days, setDays] = useState({
        monday: true,
        tuesday: true,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
    });
    useEffect(() => {

    if (!runDate) return;

        const day = new Date(runDate).toLocaleDateString(
            "en-AU",
            {
                weekday: "long",
                timeZone: "Australia/Sydney",
            }
        );

        setSelectedDay(day);

    }, [runDate]);

    useEffect(() => {

        if (loggedInUser) {
            loadConfiguration();
        }

    }, [loggedInUser]);

    const loadConfiguration = async () => {

        try {

            const res = await fetch(
                `${server}/scheduler/configuration/load`,
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

            if (res.ok && data.configuration) {

                setEnabled(data.configuration.scheduler_enabled);

                setRunTime(data.configuration.run_time);

                setDays({

                    monday: data.configuration.monday,

                    tuesday: data.configuration.tuesday,

                    wednesday: data.configuration.wednesday,

                    thursday: data.configuration.thursday,

                    friday: data.configuration.friday,

                    saturday: data.configuration.saturday,

                    sunday: data.configuration.sunday,

                });

            }

        } catch (err) {

            console.error(err);

        }

    };

    const handleRunNow = async () => {
    if (isRunningScheduler) return;

    setIsRunningScheduler(true);

    try {
        const res = await fetch(
            `${server}/scheduler/run`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    center_code: loggedInUser.center_code,
                    run_date: runDate,
                }),
            }
        );

        const data = await res.json();

        if (res.ok) {
            alert(data.message);
        } else {
            alert(data.detail);
        }

    } catch (err) {
        console.error(err);
        alert("Unable to connect to the server.");
    } finally {
        setIsRunningScheduler(false);
    }
};

    const toggleDay = (day) => {

        setDays({

            ...days,

            [day]: !days[day],

        });

    };

    const handleSave = async () => {
    if (isSavingConfiguration) return;

    setIsSavingConfiguration(true);

    try {
        const res = await fetch(
            `${server}/scheduler/configuration`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    center_code: loggedInUser.center_code,
                    scheduler_enabled: enabled,
                    run_time: runTime,
                    timezone: "Australia/Sydney",
                    monday: days.monday,
                    tuesday: days.tuesday,
                    wednesday: days.wednesday,
                    thursday: days.thursday,
                    friday: days.friday,
                    saturday: days.saturday,
                    sunday: days.sunday,
                }),
            }
        );

        const data = await res.json();

        if (res.ok) {
            alert(data.message);
        } else {
            alert(data.detail);
        }

    } catch (err) {
        console.error(err);
        alert("Unable to connect to the server.");
    } finally {
        setIsSavingConfiguration(false);
    }
};

    return (

        <div className="configure-scheduler">

            <h2>Configure Scheduler</h2>

            <p className="description">

                Configure when the scheduler automatically generates
                gamified quizzes for students.

            </p>

            <div className="form-group">

                <label>

                    Scheduler Status

                </label>

                <label className="checkbox-label">

                    <input

                        type="checkbox"

                        checked={enabled}

                        onChange={(e) =>
                            setEnabled(e.target.checked)
                        }

                    />

                    Enable Scheduler

                </label>

            </div>

            <div className="form-group">

                <label>
                Run Time
                </label>

                <input
                    type="time"
                    value={runTime}
                    onChange={(e) => setRunTime(e.target.value)}
                />

            </div>

            <div className="form-group">

                <label>

                    Scheduler Time Zone

                </label>

                <div className="readonly-box">

                    Australia / Sydney (AEST / AEDT)

                </div>

            </div>

            <div className="form-group days">

                <label>

                    Run On Days

                </label>

                <div className="day-list">

                    {Object.keys(days).map((day) => (

                        <label
                            key={day}
                            className="day-item"
                        >

                            <input

                                type="checkbox"

                                checked={days[day]}

                                onChange={() =>
                                    toggleDay(day)
                                }

                            />

                            {day.charAt(0).toUpperCase() +
                                day.slice(1)}

                        </label>

                    ))}

                </div>

            </div>
            <div
                style={{
                    marginTop: "30px",
                    padding: "20px",
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #dee2e6",
                    borderRadius: "8px",
                }}
            >

                <h3>Manual Scheduler Run</h3>

                <p>

                    Select the date you want the scheduler to process.

                </p>

                <div className="form-group">

                    <label>

                        Run Date

                    </label>

                    <input
                        type="date"
                        value={runDate}
                        onChange={(e) => setRunDate(e.target.value)}
                    />

                </div>

                <div className="form-group">

                    <label>

                        Weekday

                    </label>

                    <div className="readonly-box">

                        {selectedDay}

                    </div>

                </div>

            </div>

            <div className="button-row">

                <button
                    className={`save-btn ${isSavingConfiguration ? "disabled" : ""}`}
                    onClick={handleSave}
                    disabled={isSavingConfiguration}
                >
                    {isSavingConfiguration ? "Saving..." : "Save Configuration"}
                </button>

                <button
                    className={`run-btn ${isRunningScheduler ? "disabled" : ""}`}
                    onClick={handleRunNow}
                    disabled={isRunningScheduler}
                >
                    {isRunningScheduler ? "Running Scheduler..." : "▶ Run Scheduler Now"}
                </button>

                

            </div>

            

        </div>

    );

}