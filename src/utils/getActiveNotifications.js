const toLocalDate = (dateValue) => {
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const getActiveNotifications = (notifications, today = new Date()) => {
  const currentDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return notifications.filter((notification) => {
    if (!notification.active) return false;

    const startDate = toLocalDate(notification.startDate);
    const endDate = toLocalDate(notification.endDate);

    return startDate <= currentDate && currentDate <= endDate;
  });
};