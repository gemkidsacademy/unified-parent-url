import { useState } from "react";
import EmailLogin from "./components/EmailLogin";
import ParentDashboard from "./components/ParentDashboard";

function App() {
  const [parentData, setParentData] = useState(null);

  const handleLoginSuccess = (data) => {
    console.log("APP: handleLoginSuccess received:", data);
    setParentData(data);
  };

  const handleLogout = () => {
    console.log("APP: logout");
    setParentData(null);
  };

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