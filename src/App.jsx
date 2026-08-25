import { useState } from "react";
import EmailLogin from "./components/EmailLogin";
import ParentDashboard from "./components/ParentDashboard";
import ChatbotGamifiedQuiz from "./components/ChatbotGamifiedQuiz";
import DemoChatbot from "./components/DemoChatbot";
import AdminInterviewBooking from "./components/AdminInterviewBooking";
import InterviewAdminLogin from "./components/InterviewAdminLogin";

function App() {
  const [parentData, setParentData] = useState(null);
  const [interviewAdminData, setInterviewAdminData] = useState(() => {
    const storedData = localStorage.getItem("interviewAdminData");
    return storedData ? JSON.parse(storedData) : null;
  });
  const isAdminInterviewBooking =
    window.location.pathname === "/admin";
  const isGamifiedQuiz =
    new URLSearchParams(window.location.search).get("view") ===
    "gamified-quiz";
  const isChatbot =
    new URLSearchParams(window.location.search).get("view") ===
    "chatbot";

  const handleLoginSuccess = (data) => {
    console.log("APP: handleLoginSuccess received:", data);
    localStorage.setItem("parentData", JSON.stringify(data));
    setParentData(data);
  };

  const handleLogout = () => {
    console.log("APP: logout");
    localStorage.removeItem("parentData");
    setParentData(null);
  };

  if (isAdminInterviewBooking) {
    if (!interviewAdminData) {
      return (
        <InterviewAdminLogin
          onLoginSuccess={setInterviewAdminData}
        />
      );
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