import React, { useState } from "react";
import "./ExamUserManagement.css";

import AddStudentForm from "./AddStudentForm";
import BulkUserUpload from "./BulkUserUpload";
import DeleteUserExamAttempt from "./DeleteUserExamAttempt";
import DeleteUserModal from "./DeleteUserModal";
import EditUserForm from "./EditUserForm";
import ViewUserModal from "./ViewUserModal";

const ExamUserManagement = ({ centerCode, onBack }) => {
  const [userMode, setUserMode] = useState("menu");

  if (userMode === "add-user-bulk") {
    return (
      <BulkUserUpload
        centerCode={centerCode}
        onClose={() => setUserMode("menu")}
      />
    );
  }

  if (userMode === "add") {
    return (
      <AddStudentForm
        centerCode={centerCode}
        onClose={() => setUserMode("menu")}
      />
    );
  }

  if (userMode === "edit") {
    return (
      <EditUserForm
        centerCode={centerCode}
        onClose={() => setUserMode("menu")}
      />
    );
  }

  if (userMode === "view") {
    return (
      <ViewUserModal
        centerCode={centerCode}
        onClose={() => setUserMode("menu")}
      />
    );
  }

  if (userMode === "delete") {
    return (
      <DeleteUserModal
        centerCode={centerCode}
        onClose={() => setUserMode("menu")}
      />
    );
  }

  if (userMode === "delete-exam-attempt") {
    return (
      <DeleteUserExamAttempt
        centerCode={centerCode}
        onClose={() => setUserMode("menu")}
      />
    );
  }

  return (
  <div className="exam-user-management-page">
    <button
      type="button"
      className="exam-user-management-back-button"
      onClick={onBack}
    >
      ← Back to Exams
    </button>

    <div className="exam-user-management-header">
      <h1>Exam Module User Management</h1>
      <p>Manage users and exam accounts.</p>
    </div>

    <div className="exam-user-management-grid">
      {/* Add User Bulk */}
      <article
        className="exam-user-management-card"
        onClick={() => setUserMode("add-user-bulk")}
        role="button"
        tabIndex="0"
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setUserMode("add-user-bulk");
          }
        }}
      >
        <div className="exam-user-management-icon">⇧</div>
        <h2>Add User Bulk</h2>
        <p>Upload multiple exam users at once.</p>
        <span className="exam-user-management-action">
          Add Users in Bulk →
        </span>
      </article>

      {/* Add User */}
      <article
        className="exam-user-management-card"
        onClick={() => setUserMode("add")}
        role="button"
        tabIndex="0"
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setUserMode("add");
          }
        }}
      >
        <div className="exam-user-management-icon">+</div>
        <h2>Add User</h2>
        <p>Create a new exam module user.</p>
        <span className="exam-user-management-action">
          Add User →
        </span>
      </article>

      {/* Edit User */}
      <article
        className="exam-user-management-card"
        onClick={() => setUserMode("edit")}
        role="button"
        tabIndex="0"
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setUserMode("edit");
          }
        }}
      >
        <div className="exam-user-management-icon">✎</div>
        <h2>Edit User</h2>
        <p>Modify existing exam user information.</p>
        <span className="exam-user-management-action">
          Edit User →
        </span>
      </article>

      {/* View Users */}
      <article
        className="exam-user-management-card"
        onClick={() => setUserMode("view")}
        role="button"
        tabIndex="0"
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setUserMode("view");
          }
        }}
      >
        <div className="exam-user-management-icon">☰</div>
        <h2>View Users</h2>
        <p>Browse existing exam module users.</p>
        <span className="exam-user-management-action">
          View Users →
        </span>
      </article>

      {/* Delete User */}
      <article
        className="exam-user-management-card"
        onClick={() => setUserMode("delete")}
        role="button"
        tabIndex="0"
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setUserMode("delete");
          }
        }}
      >
        <div className="exam-user-management-icon">−</div>
        <h2>Delete User</h2>
        <p>Remove an existing exam module user.</p>
        <span className="exam-user-management-action delete-action">
          Delete User →
        </span>
      </article>

      {/* Delete User Exam Attempt */}
      <article
        className="exam-user-management-card"
        onClick={() => setUserMode("delete-exam-attempt")}
        role="button"
        tabIndex="0"
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setUserMode("delete-exam-attempt");
          }
        }}
      >
        <div className="exam-user-management-icon">⌫</div>
        <h2>Delete User Exam Attempt</h2>
        <p>Remove an exam attempt from a user.</p>
        <span className="exam-user-management-action delete-action">
          Delete Exam Attempt →
        </span>
      </article>
    </div>
  </div>
);
};

export default ExamUserManagement;