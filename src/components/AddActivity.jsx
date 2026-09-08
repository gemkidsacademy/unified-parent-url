import React, { useState } from "react";
import "./AddActivity.css";

export default function AddActivity() {
  const [instructions, setInstructions] = useState("");
  const [prompt, setPrompt] = useState("");
  const [scoreLogic, setScoreLogic] = useState("");
  const [className, setClassName] = useState("");
  const [classDay, setClassDay] = useState("");
  const [weekNumber, setWeekNumber] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert prompt to JSON array
    const questionsJson = [
      {
        prompt: prompt || "Default prompt if empty"
      }
    ];

    const payload = {
      instructions,
      questions: questionsJson,
      score_logic: scoreLogic,
      class_name: className,
      class_day: classDay,
      week_number: weekNumber
    };

    try {
      const response = await fetch(
        "https://web-production-481a5.up.railway.app/add-activity",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      setMessage("Activity added successfully!");
      // Reset form fields
      setInstructions("");
      setPrompt(
        "You are a helpful quiz generator. Use the following topics to create a student quiz: {topics}. Include instructions, questions with options, and correct answers in JSON format."
      );
      setScoreLogic("");
      setClassName("");
      setClassDay("");
      setWeekNumber("");
    } catch (err) {
      console.error(err);
      setMessage("Failed to add activity.");
    }
  };

  return (
    <div className="add-activity-form">
      <h3>Add New Activity (not functional only add bulk activity is functional)</h3>
      <form onSubmit={handleSubmit}>
        <label>
          Instructions:
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Enter Topic"
            required
          />
        </label>

        <label>
          Quiz Prompt:
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Adhere strictly: Create a gamified activity for students in Year 1.The activity format should be Mini Path û choice answer.The topic taught is Science."
            required
          />
          
        </label>

        <label>
          Score Logic:
          <input
            type="text"
            value={scoreLogic}
            onChange={(e) => setScoreLogic(e.target.value)}
            placeholder="Enter activity type(adhere strictly e.g:Mini Path – choice answer "
          />
        </label>

        <label>
          Class Name:
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            placeholder="Enter class name"
            required
          />
        </label>

        <label>
          Class Day:
          <input
            type="text"
            value={classDay}
            onChange={(e) => setClassDay(e.target.value)}
            placeholder="Enter class day"
          />
        </label>

        <label>
          Week Number:
          <input
            type="number"
            value={weekNumber}
            onChange={(e) => setWeekNumber(e.target.value)}
            placeholder="Enter the week number"
          />
        </label>

        <button type="submit">Add Activity</button>
      </form>

      {message && <p className="form-message">{message}</p>}
    </div>
  );
}
