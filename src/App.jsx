import { useState } from "react";
import EmailLogin from "./components/EmailLogin";
import ParentDashboard from "./components/ParentDashboard";
import ChatbotGamifiedQuiz from "./components/ChatbotGamifiedQuiz";
import DemoChatbot from "./components/DemoChatbot";
import AdminInterviewBooking from "./components/AdminInterviewBooking";
import InterviewAdminLogin from "./components/InterviewAdminLogin";
import AdminNotificationManagement from "./components/AdminNotificationManagement";
import ParentNotificationModal from "./components/ParentNotificationModal";
import { getActiveNotifications } from "./utils/getActiveNotifications";
import { API_BASE_URL } from "./config/api";

function App() {
  const [parentData, setParentData] = useState(null);
  const [pendingParentNotifications, setPendingParentNotifications] = useState([]);
  const [interviewAdminData, setInterviewAdminData] = useState(() => {
    const storedData = localStorage.getItem("interviewAdminData");
    return storedData ? JSON.parse(storedData) : null;
  });
  const isAdminInterviewBooking =
    window.location.pathname === "/admin";
  const isAdminNotifications =
    window.location.pathname === "/admin/notifications";
  const isGamifiedQuiz =
    new URLSearchParams(window.location.search).get("view") ===
    "gamified-quiz";
  const isChatbot =
    new URLSearchParams(window.location.search).get("view") ===
    "chatbot";

  const handleLoginSuccess = async (data) => {
    console.log("APP: FULL LOGIN DATA:", data);
    console.log("APP: STUDENT DATA:", data?.student);
    console.log("APP: STUDENT ID:", data?.student?.student_id);
    console.log("APP: STUDENT NAME:", data?.student?.name);
    console.log("APP: PARENT EMAIL:", data?.student?.parent_email);

    localStorage.setItem("parentData", JSON.stringify(data));
    setParentData(data);

    try {
      const response = await fetch(`${API_BASE_URL}/notifications`);
      const responseData = await response.json().catch(() => null);

      if (!response.ok || responseData?.status !== "success") {
        throw new Error(
          responseData?.detail || "Unable to load notifications."
        );
      }

      const notifications = Array.isArray(responseData.notifications)
        ? responseData.notifications
        : [];
      const mappedNotifications = notifications.map((notification) => ({
        id: notification.id,
        title: notification.title,
        text: notification.text,
        image: notification.image,
        displayMode: notification.displayMode,
        startDate: notification.startDate,
        endDate: notification.endDate,
        active: notification.active,
      }));

      setPendingParentNotifications(
        getActiveNotifications(mappedNotifications)
      );
    } catch (error) {
      console.error("APP: failed to load parent notifications:", error);
    }
  };

  const handleLogout = () => {
    console.log("APP: logout");
    localStorage.removeItem("parentData");
    setParentData(null);
    setPendingParentNotifications([]);
  };

  const handleNotificationAcknowledge = () => {
    setPendingParentNotifications((notifications) =>
      notifications.slice(1)
    );
  };

  if (isAdminInterviewBooking || isAdminNotifications) {
    if (!interviewAdminData) {
      return (
        <InterviewAdminLogin
          onLoginSuccess={setInterviewAdminData}
        />
      );
    }

    if (isAdminNotifications) {
      return <AdminNotificationManagement />;
    }

    return <AdminInterviewBooking />;
  }

  if (isGamifiedQuiz) {
    const storedParentData = localStorage.getItem("parentData");

    if (storedParentData) {
      const parsedParentData = JSON.parse(storedParentData);

      return (
        <ChatbotGamifiedQuiz
          parentData={parsedParentData}
          onBack={() => {
            window.close();
          }}
        />
      );
    }
  }

  if (isChatbot) {
    const storedParentData = localStorage.getItem("parentData");

    if (storedParentData) {
      const parsedParentData = JSON.parse(storedParentData);

      return (
        <DemoChatbot
          parentData={parsedParentData}
          onBack={() => {
            window.close();
          }}
        />
      );
    }
  }

  console.log("APP: parentData is:", parentData);

  if (parentData) {
    console.log("APP: rendering ParentDashboard");

    return (
      <>
        <ParentDashboard
          parentData={parentData}
          onLogout={handleLogout}
        />
        {pendingParentNotifications.length > 0 && (
          <ParentNotificationModal
            notification={pendingParentNotifications[0]}
            onAcknowledge={handleNotificationAcknowledge}
          />
        )}
      </>
    );
  }

  console.log("APP: rendering EmailLogin");

  return (
    <EmailLogin
      onLoginSuccess={handleLoginSuccess}
    />
  );
}

export default App;