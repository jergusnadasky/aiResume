import axios from "axios";
import { useState } from "react";

export default function BulletFix({ bullet }) {
  const [rewrite, setRewrite] = useState(null);

  const handleRewrite = async () => {
    const res = await axios.post("http://127.0.0.1:8000/rewrite", {
      bullet: bullet.text
    });
    setRewrite(res.data.rewritten);
  }

  return (
    <div className="border p-4 mt-4 rounded">
      <div className="font-semibold">Problem:</div>
      <div>{bullet.text}</div>

      <div className="text-red-600 mt-2">
        {bullet.issues.join(", ")}
      </div>

      <button
        className="mt-3 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleRewrite}
      >
        Rewrite
      </button>

      {rewrite && (
        <div className="mt-3 bg-green-100 p-3 rounded">
          {rewrite}
        </div>
      )}
    </div>
  );
}
