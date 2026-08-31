import { useState } from "react";
import ParentNotificationModal from "./ParentNotificationModal";
import {
  getStoredNotifications,
  saveStoredNotifications,
} from "../utils/notificationStorage";
import "./AdminNotificationManagement.css";

const DISPLAY_MODES = [
  { value: "text", label: "Text only" },
  { value: "image", label: "Image only" },
  { value: "text-image", label: "Text + Image" },
];

const IMAGE_OPTIONS = [
  "/images/Image_Notification.png",
  "/images/imageTextNotificationimage.png",
];

const FILTERS = ["All", "Active", "Upcoming", "Expired", "Inactive"];

const createEmptyNotification = () => ({
  id: "",
  title: "",
  text: "",
  image: null,
  displayMode: "text",
  startDate: "",
  endDate: "",
  active: true,
});

const toLocalDate = (dateValue) => {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const getNotificationStatus = (notification) => {
  if (!notification.active) return "Inactive";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startDate = toLocalDate(notification.startDate);
  const endDate = toLocalDate(notification.endDate);

  if (today < startDate) return "Upcoming";
  if (today > endDate) return "Expired";
  return "Active";
};

function AdminNotificationManagement() {
  const [notifications, setNotifications] = useState(getStoredNotifications);
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingNotification, setEditingNotification] = useState(null);
  const [previewNotification, setPreviewNotification] = useState(null);

  const updateNotifications = (nextNotifications) => {
    setNotifications(nextNotifications);
    saveStoredNotifications(nextNotifications);
  };

  const openCreateForm = () => {
    setEditingNotification(createEmptyNotification());
  };

  const openEditForm = (notification) => {
    setEditingNotification({ ...notification });
  };

  const updateField = (field, value) => {
    setEditingNotification((notification) => ({
      ...notification,
      [field]: value,
    }));
  };

  const saveNotification = (event) => {
    event.preventDefault();

    const notificationToSave = {
      ...editingNotification,
      id:
        editingNotification.id ||
        `gem-ai-notification-${Date.now()}`,
      image:
        editingNotification.displayMode === "text"
          ? null
          : editingNotification.image,
    };
    const existingIndex = notifications.findIndex(
      (notification) => notification.id === notificationToSave.id
    );
    const nextNotifications = [...notifications];

    if (existingIndex >= 0) {
      nextNotifications[existingIndex] = notificationToSave;
    } else {
      nextNotifications.push(notificationToSave);
    }

    updateNotifications(nextNotifications);
    setEditingNotification(null);
  };

  const toggleNotification = (notificationId) => {
    updateNotifications(
      notifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, active: !notification.active }
          : notification
      )
    );
  };

  const visibleNotifications = notifications.filter(
    (notification) =>
      statusFilter === "All" ||
      getNotificationStatus(notification) === statusFilter
  );
  const showTextFields =
    editingNotification?.displayMode === "text" ||
    editingNotification?.displayMode === "text-image";
  const showImageField =
    editingNotification?.displayMode === "image" ||
    editingNotification?.displayMode === "text-image";

  return (
    <div className="notification-admin-page">
      <header className="notification-admin-header">
        <div className="notification-admin-header-inner">
          <img
            src="https://gemkidsacademy.com.au/wp-content/uploads/2024/10/cropped-logo-4-1.png"
            alt="Gem Kids Academy"
          />
          <div>
            <span>Admin workspace</span>
            <h1>Gem AI Notifications</h1>
            <p>Create and manage notifications displayed to parents and students when they log in.</p>
          </div>
        </div>
      </header>

      <main className="notification-admin-main">
        <div className="notification-admin-toolbar">
          <button
            type="button"
            className="notification-back-button"
            onClick={() => {
              window.location.href = "/admin";
            }}
          >
            Back to Admin Dashboard
          </button>
          <button
            type="button"
            className="notification-primary-button"
            onClick={openCreateForm}
          >
            + Create Notification
          </button>
        </div>

        <section className="notification-management-section">
          <div className="notification-management-heading">
            <div>
              <h2>Notifications</h2>
              <p>Manage current, scheduled, and historical parent notifications.</p>
            </div>
            <label>
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                {FILTERS.map((filter) => (
                  <option key={filter} value={filter}>{filter}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="notification-table-wrap">
            <table className="notification-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Display mode</th>
                  <th>Start date</th>
                  <th>End date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleNotifications.map((notification) => {
                  const status = getNotificationStatus(notification);
                  const modeLabel = DISPLAY_MODES.find(
                    (mode) => mode.value === notification.displayMode
                  )?.label;

                  return (
                    <tr key={notification.id}>
                      <td>{notification.title || "Image notification"}</td>
                      <td>{modeLabel}</td>
                      <td>{notification.startDate}</td>
                      <td>{notification.endDate}</td>
                      <td>
                        <span className={`notification-status ${status.toLowerCase()}`}>
                          {status}
                        </span>
                      </td>
                      <td>
                        <div className="notification-actions">
                          <button type="button" onClick={() => openEditForm(notification)}>
                            Edit
                          </button>
                          <button type="button" onClick={() => toggleNotification(notification.id)}>
                            {notification.active ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {visibleNotifications.length === 0 && (
                  <tr>
                    <td colSpan="6" className="notification-empty-state">
                      No notifications match this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {editingNotification && (
        <div className="notification-form-overlay">
          <section className="notification-form-modal" role="dialog" aria-modal="true" aria-labelledby="notification-form-title">
            <div className="notification-form-header">
              <div>
                <span>Notification editor</span>
                <h2 id="notification-form-title">
                  {editingNotification.id ? "Edit Notification" : "Create Notification"}
                </h2>
              </div>
              <button type="button" aria-label="Close" onClick={() => setEditingNotification(null)}>
                ×
              </button>
            </div>

            <form onSubmit={saveNotification}>
              <label>
                <span>Display mode</span>
                <select
                  value={editingNotification.displayMode}
                  onChange={(event) => updateField("displayMode", event.target.value)}
                >
                  {DISPLAY_MODES.map((mode) => (
                    <option key={mode.value} value={mode.value}>{mode.label}</option>
                  ))}
                </select>
              </label>

              {showTextFields && (
                <>
                  <label>
                    <span>Notification title</span>
                    <input
                      type="text"
                      value={editingNotification.title}
                      onChange={(event) => updateField("title", event.target.value)}
                      required
                    />
                  </label>
                  <label>
                    <span>Notification text</span>
                    <textarea
                      value={editingNotification.text}
                      onChange={(event) => updateField("text", event.target.value)}
                      rows="4"
                      required
                    />
                  </label>
                </>
              )}

              {showImageField && (
                <fieldset className="notification-image-options">
                  <legend>Banner image</legend>
                  {IMAGE_OPTIONS.map((imagePath) => (
                    <label key={imagePath} className={editingNotification.image === imagePath ? "selected" : ""}>
                      <input
                        type="radio"
                        name="notification-image"
                        value={imagePath}
                        checked={editingNotification.image === imagePath}
                        onChange={(event) => updateField("image", event.target.value)}
                        required
                      />
                      <img src={imagePath} alt="Notification option" />
                      <span>{imagePath.split("/").pop()}</span>
                    </label>
                  ))}
                </fieldset>
              )}

              <div className="notification-date-grid">
                <label>
                  <span>Start date</span>
                  <input
                    type="date"
                    value={editingNotification.startDate}
                    onChange={(event) => updateField("startDate", event.target.value)}
                    required
                  />
                </label>
                <label>
                  <span>End date</span>
                  <input
                    type="date"
                    min={editingNotification.startDate}
                    value={editingNotification.endDate}
                    onChange={(event) => updateField("endDate", event.target.value)}
                    required
                  />
                </label>
              </div>

              <label className="notification-active-control">
                <input
                  type="checkbox"
                  checked={editingNotification.active}
                  onChange={(event) => updateField("active", event.target.checked)}
                />
                <span>Active</span>
              </label>

              <div className="notification-form-actions">
                <button type="button" onClick={() => setPreviewNotification(editingNotification)}>
                  Preview
                </button>
                <button type="submit" className="notification-primary-button">
                  Save Notification
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {previewNotification && (
        <ParentNotificationModal
          notification={previewNotification}
          onAcknowledge={() => setPreviewNotification(null)}
        />
      )}
    </div>
  );
}

export default AdminNotificationManagement;