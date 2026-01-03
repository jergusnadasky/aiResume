import { useLocation, useNavigate } from "react-router-dom";
import { useRef } from "react";
import {
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    Lightbulb,
    FileText,
    Award,
    Target,
    ChevronRight
} from "lucide-react";

const COLOR_MAP = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
    yellow: { bg: "bg-yellow-100", text: "text-yellow-600" },
    indigo: { bg: "bg-indigo-100", text: "text-indigo-600" },
};

const SCORE_CONFIG = [
    { key: "structure", label: "Structure", max: 20, icon: FileText, color: "blue" },
    { key: "technical_depth", label: "Technical Depth", max: 25, icon: Target, color: "purple" },
    { key: "impact", label: "Impact", max: 25, icon: TrendingUp, color: "green" },
    { key: "clarity", label: "Clarity", max: 15, icon: Lightbulb, color: "yellow" },
    { key: "ats", label: "ATS Optimization", max: 15, icon: Award, color: "indigo" },
];

// Helper function to safely extract string from array items (handles both strings and objects)
const extractString = (item) => {
    if (typeof item === 'string') {
        return item;
    }
    if (typeof item === 'object' && item !== null) {
        // Try common object keys that might contain the actual string
        return item.improved_bullet || item.bad_bullet || item.text || item.content || item.message || JSON.stringify(item);
    }
    return String(item || '');
};

export default function ModernResults() {
    const location = useLocation();
    const navigate = useNavigate();
    const results = location.state?.data;
    const categoryRefs = useRef({});

    if (!results || !results.ai_feedback) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">No results found</h2>
                    <p className="text-gray-600 mb-6">Please upload a resume to get started.</p>
                    <button
                        onClick={() => navigate("/")}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                        Upload Resume
                    </button>
                </div>
            </div>
        );
    }

    const ai = results.ai_feedback;

    // Function to scroll to a specific category section
    const scrollToCategory = (categoryKey) => {
        const element = categoryRefs.current[categoryKey];
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start',
                inline: 'nearest'
            });
        }
    };

    const getScoreColor = (value, max = 100) => {
        const percent = (value / max) * 100;
        if (percent >= 80) return { text: "text-emerald-600", bg: "bg-emerald-500", ring: "ring-emerald-500" };
        if (percent >= 60) return { text: "text-amber-600", bg: "bg-amber-500", ring: "ring-amber-500" };
        return { text: "text-red-600", bg: "bg-red-500", ring: "ring-red-500" };
    };

    const getScorePercentage = (value, max) => {
        return Math.min((value / max) * 100, 100);
    };

    return (
        <div className="w-full h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden flex flex-col">
            {/* Animated background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            </div>

            {/* Top Navigation Bar */}
            <div className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-white/20 px-6 py-4">
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900 group transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Upload Another Resume</span>
                </button>
            </div>

            {/* Two Column Layout */}
            <div className="relative flex-1 flex overflow-hidden">
                {/* Left Side - Resume Display */}
                <div className="w-1/2 border-r border-gray-200/50 bg-gray-50 overflow-y-auto">
                    <div className="p-6">
                        <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 sticky top-0 z-10 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-purple-600" />
                                Your Resume
                            </h2>
                            <p className="text-xs text-gray-500">
                                {results.pages_detected} {results.pages_detected === 1 ? "Page" : "Pages"} • {results.raw_text?.length || 0} characters
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 min-h-[600px]">
                            <div className="prose prose-slate max-w-none">
                                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed font-normal">
                                    {results.raw_text || "No resume text available"}
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Scrollable Metrics */}
                <div className="w-1/2 overflow-y-auto">
                    <div className="p-6 space-y-6">

                        {/* Overall Score Card */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 animate-slide-up">
                            <div className="flex items-center justify-between gap-4 mb-6">
                                <div className="flex-1">
                                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                                        Analysis Complete
                                    </h1>
                                    <p className="text-gray-600 text-sm">
                                        {ai.summary || ai.reasoning || "Your resume has been thoroughly analyzed by our AI."}
                                    </p>
                                </div>

                                <div className="relative flex-shrink-0">
                                    <div className="absolute inset-0 bg-purple-500 rounded-full blur-2xl opacity-30"></div>
                                    <div className="relative bg-purple-600 rounded-full w-24 h-24 flex items-center justify-center shadow-xl">
                                        <div className="text-center">
                                            <div className="text-3xl font-extrabold text-white mb-1">
                                                {ai.overall_score}
                                            </div>
                                            <div className="text-white/90 text-xs font-semibold">/100</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Overall Score Progress Bar */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-semibold text-gray-700">Overall Score</span>
                                    <span className={`text-xs font-bold ${getScoreColor(ai.overall_score).text}`}>
                                        {getScorePercentage(ai.overall_score, 100).toFixed(0)}%
                                    </span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${getScoreColor(ai.overall_score).bg} transition-all duration-1000 ease-out`}
                                        style={{ width: `${getScorePercentage(ai.overall_score, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* UPDATED: Compact Category Scores - 2 per row with clickable links */}
                        {ai?.subscores && (
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Detailed Scores</h2>
                                <div className="grid grid-cols-2 gap-3">
                                    {SCORE_CONFIG.map(({ key, label, max, icon: Icon, color }) => {
                                        const value = ai.subscores[key] ?? 0;
                                        const percent = getScorePercentage(value, max);
                                        const scoreColors = getScoreColor(value, max);

                                        return (
                                            <button
                                                key={key}
                                                onClick={() => scrollToCategory(key)}
                                                className="bg-gray-50 rounded-xl p-3 hover:shadow-md hover:scale-[1.02] transition-all duration-300 text-left group cursor-pointer"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`p-1.5 ${COLOR_MAP[color].bg} rounded-lg`}>
                                                            <Icon className={`w-3 h-3 ${COLOR_MAP[color].text}`} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-gray-900 text-xs leading-tight">{label}</h3>
                                                            <p className="text-[10px] text-gray-500">Max: {max}pts</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <div className={`text-base font-bold ${scoreColors.text}`}>
                                                            {value}<span className="text-xs">/{max}</span>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                </div>
                                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${scoreColors.bg} transition-all duration-1000 ease-out`}
                                                        style={{ width: `${percent}%` }}
                                                    ></div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* AI Insights Section - Categorized by Score Type */}
                        {ai.feedback_by_category ? (
                            // New categorized view with refs for scrolling
                            SCORE_CONFIG.map(({ key, label, color }) => {
                                const categoryFeedback = ai.feedback_by_category[key];
                                if (!categoryFeedback) return null;

                                const hasContent = 
                                    (categoryFeedback.strengths?.length > 0) ||
                                    (categoryFeedback.issues?.length > 0) ||
                                    (categoryFeedback.recommendations?.length > 0);

                                if (!hasContent) return null;

                                const IconComponent = SCORE_CONFIG.find(c => c.key === key)?.icon;

                                return (
                                    <div 
                                        key={key} 
                                        ref={(el) => (categoryRefs.current[key] = el)}
                                        className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 animate-fade-in scroll-mt-6"
                                    >
                                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <div className={`p-2 ${COLOR_MAP[color].bg} rounded-lg`}>
                                                {IconComponent && (
                                                    <IconComponent className={`w-5 h-5 ${COLOR_MAP[color].text}`} />
                                                )}
                                            </div>
                                            {label}
                                        </h2>

                                        {/* Strengths */}
                                        {categoryFeedback.strengths?.length > 0 && (
                                            <div className="mb-4">
                                                <h3 className="text-sm font-semibold text-emerald-700 mb-2 flex items-center gap-1">
                                                    <CheckCircle className="w-4 h-4" />
                                                    Strengths
                                                </h3>
                                                <div className="space-y-2">
                                                    {categoryFeedback.strengths.map((s, i) => (
                                                        <div key={i} className="bg-emerald-50 rounded-lg p-2 border-l-2 border-emerald-400">
                                                            <p className="text-gray-800 text-xs leading-relaxed">{extractString(s)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Issues */}
                                        {categoryFeedback.issues?.length > 0 && (
                                            <div className="mb-4">
                                                <h3 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4" />
                                                    Areas for Improvement
                                                </h3>
                                                <div className="space-y-2">
                                                    {categoryFeedback.issues.map((issue, i) => (
                                                        <div key={i} className="bg-red-50 rounded-lg p-2 border-l-2 border-red-400">
                                                            <p className="text-gray-800 text-xs leading-relaxed">{extractString(issue)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Recommendations */}
                                        {categoryFeedback.recommendations?.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-indigo-700 mb-2 flex items-center gap-1">
                                                    <TrendingUp className="w-4 h-4" />
                                                    Recommendations
                                                </h3>
                                                <div className="space-y-2">
                                                    {categoryFeedback.recommendations.map((r, i) => (
                                                        <div key={i} className="bg-indigo-50 rounded-lg p-2 border-l-2 border-indigo-400 flex items-start gap-2">
                                                            <div className="flex-shrink-0 w-4 h-4 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                                                {i + 1}
                                                            </div>
                                                            <p className="text-gray-800 text-xs leading-relaxed flex-1">{extractString(r)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            // Fallback to old format if categorized feedback not available
                            <>
                                {/* Strengths */}
                                {ai.strengths?.length > 0 && (
                                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-lg border border-emerald-100 p-6 animate-fade-in">
                                        <h2 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
                                            <div className="p-2 bg-emerald-500 rounded-lg">
                                                <CheckCircle className="w-5 h-5 text-white" />
                                            </div>
                                            Strengths
                                        </h2>
                                        <div className="space-y-3">
                                            {ai.strengths.map((s, i) => (
                                                <div
                                                    key={i}
                                                    className="bg-white rounded-xl p-3 border-l-4 border-emerald-500 shadow-sm hover:shadow-md transition-shadow"
                                                >
                                                    <p className="text-gray-800 text-sm leading-relaxed">{extractString(s)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Issues */}
                                {ai.issues?.length > 0 && (
                                    <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl shadow-lg border border-red-100 p-6 animate-fade-in">
                                        <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                                            <div className="p-2 bg-red-500 rounded-lg">
                                                <AlertCircle className="w-5 h-5 text-white" />
                                            </div>
                                            Areas for Improvement
                                        </h2>
                                        <div className="space-y-3">
                                            {ai.issues.map((issue, i) => (
                                                <div
                                                    key={i}
                                                    className="bg-white rounded-xl p-3 border-l-4 border-red-500 shadow-sm hover:shadow-md transition-shadow"
                                                >
                                                    <p className="text-gray-800 text-sm leading-relaxed">{extractString(issue)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recommendations */}
                                {ai.recommendations?.length > 0 && (
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg border border-indigo-100 p-6 animate-fade-in">
                                        <h2 className="text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
                                            <div className="p-2 bg-indigo-500 rounded-lg">
                                                <TrendingUp className="w-5 h-5 text-white" />
                                            </div>
                                            Recommendations
                                        </h2>
                                        <div className="space-y-3">
                                            {ai.recommendations.map((r, i) => (
                                                <div
                                                    key={i}
                                                    className="bg-white rounded-xl p-3 border-l-4 border-indigo-500 shadow-sm hover:shadow-md transition-shadow flex items-start gap-2"
                                                >
                                                    <div className="flex-shrink-0 w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                                        {i + 1}
                                                    </div>
                                                    <p className="text-gray-800 text-sm leading-relaxed flex-1">{extractString(r)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Improved Bullets - Always show if available */}
                        {ai.improved_bullets?.length > 0 && (
                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg border border-purple-100 p-6 animate-fade-in">
                                <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                                    <div className="p-2 bg-purple-500 rounded-lg">
                                        <Lightbulb className="w-5 h-5 text-white" />
                                    </div>
                                    Suggested Bullet Improvements
                                </h2>
                                <div className="space-y-3">
                                    {ai.improved_bullets.map((bullet, i) => (
                                        <div
                                            key={i}
                                            className="bg-white rounded-xl p-4 border-l-4 border-purple-500 shadow-sm hover:shadow-md transition-all hover:-translate-x-1"
                                        >
                                            <p className="text-gray-800 text-sm leading-relaxed font-medium">{extractString(bullet)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}