import { useLocation, useNavigate } from "react-router-dom";

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state?.data;

  if (!results) {
    return (
      <div style={{ padding: 20 }}>
        <h2>No results found</h2>
        <button onClick={() => navigate("/")}>Go Back</button>
      </div>
    );
  }

  const evaluation = results.evaluation;

  return (
    <div style={{ padding: 20 }}>
      <h1>Resume Evaluation Results</h1>

      <h2>Score: {evaluation.score}/100</h2>

      <h3>Subscores</h3>
      <ul>
        <li>Structure: {evaluation.subscores.structure}</li>
        <li>Bullets: {evaluation.subscores.bullets}</li>
        <li>Technical Depth: {evaluation.subscores.technical_depth}</li>
        <li>Readability: {evaluation.subscores.readability}</li>
        <li>ATS: {evaluation.subscores.ats}</li>
      </ul>

      <h3>Sections Found</h3>
      <ul>
        <li>Education: {evaluation.sections_found.education ? "Yes" : "No"}</li>
        <li>Experience: {evaluation.sections_found.experience ? "Yes" : "No"}</li>
        <li>Projects: {evaluation.sections_found.projects ? "Yes" : "No"}</li>
        <li>Skills: {evaluation.sections_found.skills ? "Yes" : "No"}</li>
      </ul>

      <h3>Problem Bullets</h3>
      {evaluation.problem_bullets.length === 0 && <p>No issues 🎉</p>}

      <ul>
        {evaluation.problem_bullets.map((b, i) => (
          <li key={i}>
            <b>{b.text}</b>
            <ul>
              {b.issues.map((x, j) => (
                <li key={j}>{x}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      {/* ================= AI FEEDBACK ================= */}
      {results.ai_feedback && (
        <div style={{ marginTop: 30 }}>
          <h2>AI Resume Review</h2>

          <h3>AI Score</h3>
          <p>{results.ai_feedback.ai_score}</p>

          <h3>Strengths</h3>
          <ul>
            {results.ai_feedback.strengths?.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>

          <h3>Weaknesses</h3>
          <ul>
            {results.ai_feedback.weaknesses?.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>

          <h3>Recommendations</h3>
          <ul>
            {results.ai_feedback.recommendations?.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>

          <h3>Improved Bullets</h3>
          <ul>
            {results.ai_feedback.improved_bullets?.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}


      <button onClick={() => navigate("/")}>Upload Another</button>
    </div>
  );
}
