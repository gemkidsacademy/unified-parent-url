import { useEffect, useRef, useState } from "react";
import ParentNotificationModal from "./ParentNotificationModal";
import { API_BASE_URL } from "../config/api";
import "./AdminNotificationManagement.css";

const DISPLAY_MODES = [
  { value: "text", label: "Text only" },
  { value: "image", label: "Image only" },
  { value: "text-image", label: "Text + Image" },
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
  const [notifications, setNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [notificationError, setNotificationError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingNotification, setEditingNotification] = useState(null);
  const [previewNotification, setPreviewNotification] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");
  const [notificationImages, setNotificationImages] = useState([]);
  const [isLoadingNotificationImages, setIsLoadingNotificationImages] = useState(false);
  const [notificationImagesError, setNotificationImagesError] = useState("");
  const imageFileInputRef = useRef(null);

  useEffect(() => {
    const loadNotifications = async () => {
      setIsLoadingNotifications(true);
      setNotificationError("");

      try {
        const response = await fetch(`${API_BASE_URL}/notifications`);
        const data = await response.json().catch(() => null);

        if (!response.ok || data?.status !== "success") {
          throw new Error(
            data?.detail || "Unable to load notifications."
          );
        }

        setNotifications(
          Array.isArray(data.notifications)
            ? data.notifications
            : []
        );
      } catch (error) {
        setNotificationError(
          error.message || "Unable to load notifications."
        );
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    loadNotifications();
  }, []);

  const loadNotificationImages = async () => {
    setIsLoadingNotificationImages(true);
    setNotificationImagesError("");

    try {
      const response = await fetch(`${API_BASE_URL}/notifications/images`);
      const data = await response.json().catch(() => null);

      if (!response.ok || data?.status !== "success" || !Array.isArray(data?.images)) {
        throw new Error(data?.detail || "Unable to load notification images.");
      }

      setNotificationImages(data.images);
    } catch (error) {
      setNotificationImagesError(
        error.message || "Unable to load notification images."
      );
    } finally {
      setIsLoadingNotificationImages(false);
    }
  };

  const openCreateForm = () => {
    setImageUploadError("");
    setEditingNotification(createEmptyNotification());
    loadNotificationImages();
  };

  const openEditForm = (notification) => {
    setImageUploadError("");
    setEditingNotification({ ...notification });
    loadNotificationImages();
  };

  const updateField = (field, value) => {
    setEditingNotification((notification) => ({
      ...notification,
      [field]: value,
    }));
  };

  const uploadImage = async (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("image", selectedFile);
    setIsUploadingImage(true);
    setImageUploadError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/upload-image`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json().catch(() => null);

      if (!response.ok || data?.status !== "success" || !data?.url) {
        throw new Error(data?.detail || "Unable to upload image.");
      }

      updateField("image", data.url);
      await loadNotificationImages();
    } catch (error) {
      setImageUploadError(error.message || "Unable to upload image.");
    } finally {
      setIsUploadingImage(false);
      event.target.value = "";
    }
  };

  const saveNotification = async (event) => {
    event.preventDefault();

    const notificationPayload = {
      title: editingNotification.title,
      text: editingNotification.text,
      image:
        editingNotification.displayMode === "text"
          ? null
          : editingNotification.image,
      displayMode: editingNotification.displayMode,
      startDate: editingNotification.startDate,
      endDate: editingNotification.endDate,
      active: editingNotification.active,
    };

    const isEditing = Boolean(editingNotification.id);
    const url = isEditing
      ? `${API_BASE_URL}/notifications/${editingNotification.id}`
      : `${API_BASE_URL}/notifications`;

    try {
      setNotificationError("");

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationPayload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || data?.status !== "success") {
        throw new Error(
          data?.detail || "Unable to save notification."
        );
      }

      const savedNotification = data.notification;

      setNotifications((currentNotifications) => {
        const existingIndex = currentNotifications.findIndex(
          (notification) => notification.id === savedNotification.id
        );
        const nextNotifications = [...currentNotifications];

        if (existingIndex >= 0) {
          nextNotifications[existingIndex] = savedNotification;
        } else {
          nextNotifications.push(savedNotification);
        }

        return nextNotifications;
      });

      setEditingNotification(null);
    } catch (error) {
      setNotificationError(
        error.message || "Unable to save notification."
      );
    }
  };

  const toggleNotification = async (notificationId) => {
    try {
      setNotificationError("");

      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/active`,
        {
          method: "PATCH",
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok || data?.status !== "success") {
        throw new Error(
          data?.detail || "Unable to update notification status."
        );
      }

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                active: data.active,
              }
            : notification
        )
      );
    } catch (error) {
      setNotificationError(
        error.message || "Unable to update notification status."
      );
    }
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

          {notificationError && (
            <p className="notification-image-upload-error" role="alert">
              {notificationError}
            </p>
          )}

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
                {isLoadingNotifications ? (
                  <tr>
                    <td colSpan="6" className="notification-empty-state">
                      Loading notifications...
                    </td>
                  </tr>
                ) : (
                  <>
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
                  </>
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
                  <input
                    ref={imageFileInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={uploadImage}
                    hidden
                  />
                  <div className="notification-form-actions notification-image-upload-action">
                    <button
                      type="button"
                      className="notification-primary-button"
                      onClick={() => imageFileInputRef.current?.click()}
                      disabled={isUploadingImage}
                    >
                      {isUploadingImage ? "Uploading..." : "Upload Image"}
                    </button>
                  </div>
                  {isLoadingNotificationImages && (
                    <p className="notification-image-status">
                      Loading images...
                    </p>
                  )}
                  {notificationImagesError && (
                    <p className="notification-image-upload-error" role="alert">
                      {notificationImagesError}
                    </p>
                  )}
                  {imageUploadError && (
                    <p className="notification-image-upload-error" role="alert">
                      {imageUploadError}
                    </p>
                  )}
                  {!isLoadingNotificationImages && notificationImages.map((image) => (
                    <button
                      key={image.url}
                      type="button"
                      className={`notification-image-card${editingNotification.image === image.url ? " selected" : ""}`}
                      onClick={() => updateField("image", image.url)}
                      aria-pressed={editingNotification.image === image.url}
                    >
                      <img src={image.url} alt="" />
                      <span>{image.filename}</span>
                    </button>
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