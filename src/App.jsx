import { useState } from "react";
import EmailLogin from "./components/EmailLogin";
import ParentDashboard from "./components/ParentDashboard";
import ChatbotGamifiedQuiz from "./components/ChatbotGamifiedQuiz";

function App() {
  const [parentData, setParentData] = useState(null);
  const isGamifiedQuiz =
    new URLSearchParams(window.location.search).get("view") ===
    "gamified-quiz";

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