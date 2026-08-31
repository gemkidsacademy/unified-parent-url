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
import { getStoredNotifications } from "./utils/notificationStorage";

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

  const handleLoginSuccess = (data) => {
    console.log("APP: FULL LOGIN DATA:", data);
    console.log("APP: STUDENT DATA:", data?.student);
    console.log("APP: STUDENT ID:", data?.student?.student_id);
    console.log("APP: STUDENT NAME:", data?.student?.name);
    console.log("APP: PARENT EMAIL:", data?.student?.parent_email);

    localStorage.setItem("parentData", JSON.stringify(data));
    setParentData(data);
    setPendingParentNotifications(
      getActiveNotifications(getStoredNotifications())
    );
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

  if (parentData && pendingParentNotifications.length > 0) {
    return (
      <ParentNotificationModal
        notification={pendingParentNotifications[0]}
        onAcknowledge={handleNotificationAcknowledge}
      />
    );
  }

  if (parentData) {
    console.log("APP: rendering ParentDashboard");

    return (
      <ParentDashboard
        parentData={parentData}
        onLogout={handleLogout}
      />
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