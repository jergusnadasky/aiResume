import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UploadResume() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return alert("Upload a resume first");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      navigate("/results", { state: { results: data } });

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Upload Resume</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Analyzing..." : "Upload"}
      </button>
    </div>
  );
}
