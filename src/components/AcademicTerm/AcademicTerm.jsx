import React, { useState } from "react";
import "./AcademicTerm.css";

import AddTerm from "./AddTerm";
import ManageTerms from "./ManageTerm";

export default function AcademicTerm({ loggedInUser, onBack }) {
  const [view, setView] = useState("home");

  if (view === "add") {
    return (
      <AddTerm
        loggedInUser={loggedInUser}
        onBack={() => setView("home")}
      />
    );
  }

  if (view === "manage") {
    return (
      <ManageTerms
        loggedInUser={loggedInUser}
        onBack={() => setView("home")}
      />
    );
  }

  return (
    <div className="academic-term-home">
      <button
          type="button"
          className="academic-term-back-btn"
          onClick={onBack}
      >
          ← Back
      </button>

      <h2>Academic Terms</h2>

      <p className="page-description">
        Create and manage academic terms used by the Gamified Quiz module.
        Multiple terms can be created for the centre, but only one term is
        treated as the current active term at any time.
      </p>

      <div className="card-grid">
        {/* Add Term */}
        <div
          className="action-card"
          onClick={() => setView("add")}
        >
          <div className="card-icon">➕</div>

          <h3>Add Term</h3>

          <p>
            Create a new academic term by entering the term name,
            start date and end date.
          </p>

          <button className="card-btn">
            Add Term
          </button>
        </div>

        {/* Manage Terms */}
        <div
          className="action-card"
          onClick={() => setView("manage")}
        >
          <div className="card-icon">📅</div>

          <h3>Manage Terms</h3>

          <p>
            View all academic terms, edit their details, delete terms,
            and choose which term should be the current active term.
          </p>

          <button className="card-btn">
            Manage Terms
          </button>
        </div>
      </div>

      
    </div>
  );
}