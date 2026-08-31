import "./ParentNotificationModal.css";

function ParentNotificationModal({ notification, onAcknowledge }) {
  const showText =
    notification.displayMode === "text" ||
    notification.displayMode === "text-image";
  const showImage =
    (notification.displayMode === "image" ||
      notification.displayMode === "text-image") &&
    notification.image;

  return (
    <div className="parent-notification-overlay">
      <section
        className="parent-notification-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={showText ? "parent-notification-title" : undefined}
        aria-label={showText ? undefined : "Gem AI notification"}
      >
        {showImage && (
          <img
            className="parent-notification-image"
            src={notification.image}
            alt=""
          />
        )}

        {showText && (
          <div className="parent-notification-content">
            <span className="parent-notification-eyebrow">Gem AI update</span>
            <h1 id="parent-notification-title">{notification.title}</h1>
            <p>{notification.text}</p>
          </div>
        )}

        <button type="button" onClick={onAcknowledge} autoFocus>
          Got It
        </button>
      </section>
    </div>
  );
}

export default ParentNotificationModal;