import axios from "axios";
import { useState } from "react";
import BulletFix from "bulletFix.js";


export default function Upload() {
  const [data, setData] = useState(null);

  const handleUpload = async (e) => {
    try {
      const file = e.target.files[0];
      const form = new FormData();
      form.append("file", file);

      const res = await axios.post("http://127.0.0.1:8000/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setData(res.data.evaluation);
    } catch (err) {
      console.error("UPLOAD ERROR", err);
      alert("Upload failed. Check console.");
    }
  };


  return (
    <div className="p-6">
      <input type="file" onChange={handleUpload} className="border p-4" />

      {data && (
        <div className="mt-6">
          <h1 className="text-3xl font-bold">
            Score: {data.score}/100
          </h1>

          <h2 className="mt-4 text-xl font-semibold">Subscores</h2>
          {Object.entries(data.subscores).map(([k, v]) => (
            <div key={k} className="mt-2">
              {k}: <span className="font-bold">{v}</span>
            </div>
          ))}

          <h2 className="mt-6 text-xl font-semibold">
            Issues Found
          </h2>

          {data.problem_bullets.map((b, i) => (
            <BulletFix key={i} bullet={b} />
          ))}
        </div>
      )}
    </div>
  );
}
