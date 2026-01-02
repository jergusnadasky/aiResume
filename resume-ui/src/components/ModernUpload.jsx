import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Loader } from "lucide-react";

export default function ModernUpload() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const navigate = useNavigate();

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === "application/pdf") {
                setFile(droppedFile);
            } else {
                alert("Please upload a PDF file");
            }
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please upload a resume first");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);

            const res = await fetch("http://127.0.0.1:8000/upload", {
                method: "POST",
                body: formData,
            });

            // 1️⃣ Read raw text first (ALWAYS safest)
            const rawText = await res.text();
            console.log("🟢 RAW BACKEND RESPONSE:");
            console.log(rawText);

            // 2️⃣ Parse JSON safely
            let data;
            try {
                data = JSON.parse(rawText);
            } catch (parseErr) {
                console.error("❌ JSON parse failed:", parseErr);
                alert("Backend returned invalid JSON. Check console.");
                return;
            }

            // 3️⃣ Validate expected structure
            if (!data.ai_feedback) {
                console.error("❌ Missing ai_feedback:", data);
                alert("Invalid analysis data received.");
                return;
            }

            // 4️⃣ Navigate with GOOD data
            navigate("/results", { state: { data } });

        } catch (err) {
            console.error("❌ Upload failed:", err);
            alert("Upload failed. Make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <FileText className="w-12 h-12 text-indigo-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Resume Intelligence
                    </h1>
                    <p className="text-gray-600">
                        AI-powered resume analysis with actionable feedback
                    </p>
                </div>

                {/* Upload Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div
                        className={`border-4 border-dashed rounded-xl p-12 text-center transition-all ${dragActive
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-300 hover:border-indigo-400"
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />

                        {!file ? (
                            <>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                    Drag & drop your resume
                                </h3>
                                <p className="text-gray-500 mb-4">or</p>
                                <label className="inline-block cursor-pointer">
                                    <span className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                                        Browse Files
                                    </span>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        className="hidden"
                                    />
                                </label>
                                <p className="text-sm text-gray-400 mt-4">PDF format only</p>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-center gap-3 text-green-600">
                                    <FileText className="w-6 h-6" />
                                    <span className="font-medium">{file.name}</span>
                                </div>
                                <button
                                    onClick={() => setFile(null)}
                                    className="text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Remove file
                                </button>
                            </div>
                        )}
                    </div>

                    {file && (
                        <button
                            onClick={handleUpload}
                            disabled={loading}
                            className="w-full mt-6 px-6 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold text-lg flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" />
                                    Analyzing Resume...
                                </>
                            ) : (
                                "Analyze Resume"
                            )}
                        </button>
                    )}
                </div>

                {/* Features */}
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                    <div className="p-4">
                        <div className="text-2xl font-bold text-indigo-600">AI-Powered</div>
                        <div className="text-sm text-gray-600">Smart Analysis</div>
                    </div>
                    <div className="p-4">
                        <div className="text-2xl font-bold text-indigo-600">Instant</div>
                        <div className="text-sm text-gray-600">Fast Results</div>
                    </div>
                    <div className="p-4">
                        <div className="text-2xl font-bold text-indigo-600">Actionable</div>
                        <div className="text-sm text-gray-600">Clear Feedback</div>
                    </div>
                </div>
            </div>
        </div>
    );
}