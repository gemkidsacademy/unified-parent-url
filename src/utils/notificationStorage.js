import { demoParentNotifications } from "../config/demoParentNotifications";

export const NOTIFICATION_STORAGE_KEY = "gem_ai_notifications";

export const getStoredNotifications = () => {
  const storedNotifications = localStorage.getItem(NOTIFICATION_STORAGE_KEY);

  if (!storedNotifications) {
    localStorage.setItem(
      NOTIFICATION_STORAGE_KEY,
      JSON.stringify(demoParentNotifications)
    );
    return demoParentNotifications;
  }

  try {
    const notifications = JSON.parse(storedNotifications);
    return Array.isArray(notifications) ? notifications : [];
  } catch {
    return [];
  }
};

export const saveStoredNotifications = (notifications) => {
  localStorage.setItem(
    NOTIFICATION_STORAGE_KEY,
    JSON.stringify(notifications)
  );
};