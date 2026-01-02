import { Routes, Route } from "react-router-dom";
import ModernUpload from "./components/ModernUpload";
import ModernResults from "./components/ModernResults";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ModernUpload />} />
      <Route path="/results" element={<ModernResults />} />
    </Routes>
  );
}

export default App;