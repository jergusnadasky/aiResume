import { useLocation, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    Lightbulb
} from "lucide-react";

export default function ModernResults() {
    const location = useLocation();
    const navigate = useNavigate();
    const results = location.state?.data;

    if (!results || !results.ai_feedback) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">No results found</h2>
                    <button
                        onClick={() => navigate("/")}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const ai = results.ai_feedback;

    const getScoreColor = (value, max = 100) => {
        const percent = (value / max) * 100;
        if (percent >= 80) return "text-green-600";
        if (percent >= 60) return "text-yellow-600";
        return "text-red-600";
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Upload Another Resume
                </button>

                {/* Overall Score */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Resume Analysis Complete
                            </h1>
                            <p className="text-gray-600">
                                Pages: {results.pages_detected}
                            </p>
                        </div>

                        <div className="text-center">
                            <div className={`text-6xl font-bold ${getScoreColor(ai.overall_score)}`}>
                                {ai.overall_score}
                            </div>
                            <div className="text-gray-600 font-medium">out of 100</div>
                        </div>
                    </div>
                </div>

                {/* Subscores */}
                {ai.subscores && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        {Object.entries(ai.subscores).map(([key, value]) => {
                            const max = ai.score_scale?.[key];

                            return (
                                <div key={key} className="bg-white rounded-xl shadow p-6 text-center">
                                    <div className={`text-3xl font-bold mb-1 ${getScoreColor(value, max)}`}>
                                        {value}/{max}
                                    </div>
                                    <div className="text-sm text-gray-600 capitalize">
                                        {key.replace("_", " ")}
                                    </div>
                                </div>
                            );
                        })}

                    </div>
                )}

                {/* AI Insights */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Lightbulb className="w-7 h-7 text-purple-600" />
                        AI-Powered Insights
                    </h2>

                    {/* Summary / Reasoning */}
                    <div className="bg-white rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold">AI Quality Score</span>
                            <span className={`text-3xl font-bold ${getScoreColor(ai.overall_score)}`}>
                                {ai.overall_score}/100
                            </span>
                        </div>
                        <p className="text-gray-600 mt-2">{ai.reasoning}</p>
                    </div>

                    {/* Strengths */}
                    {ai.strengths?.length > 0 && (
                        <div className="bg-white rounded-lg p-6 mb-4">
                            <h3 className="text-lg font-bold text-green-700 mb-3 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Strengths
                            </h3>
                            <ul className="space-y-2">
                                {ai.strengths.map((s, i) => (
                                    <li key={i} className="text-gray-700">{s}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Issues */}
                    {ai.issues?.length > 0 && (
                        <div className="bg-white rounded-lg p-6 mb-4">
                            <h3 className="text-lg font-bold text-red-700 mb-3 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                Issues Identified
                            </h3>
                            <ul className="space-y-2">
                                {ai.issues.map((issue, i) => (
                                    <li key={i} className="text-gray-700">{issue}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Recommendations */}
                    {ai.recommendations?.length > 0 && (
                        <div className="bg-white rounded-lg p-6 mb-4">
                            <h3 className="text-lg font-bold text-indigo-700 mb-3 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Recommendations
                            </h3>
                            <ul className="space-y-2">
                                {ai.recommendations.map((r, i) => (
                                    <li key={i} className="text-gray-700">{r}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Improved Bullets */}
                    {ai.improved_bullets?.length > 0 && (
                        <div className="bg-white rounded-lg p-6">
                            <h3 className="text-lg font-bold text-purple-700 mb-3">
                                Suggested Bullet Improvements
                            </h3>
                            <div className="space-y-3">
                                {ai.improved_bullets.map((bullet, i) => (
                                    <div
                                        key={i}
                                        className="p-3 bg-purple-50 rounded border-l-4 border-purple-500"
                                    >
                                        {bullet}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
