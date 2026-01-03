import { Routes, Route } from "react-router-dom";
import ModernUpload from "./components/ModernUpload";
import ModernResults from "./components/ModernResults";

function App() {
  return (
    <div className="w-full h-full min-h-screen">
      <Routes>
        <Route path="/" element={<ModernUpload />} />
        <Route path="/results" element={<ModernResults />} />
      </Routes>
    </div>
  );
}

export default App;