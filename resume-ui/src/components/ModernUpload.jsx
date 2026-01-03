import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Sparkles, CheckCircle2, AlertCircle, Loader2, Mail, Github, Linkedin } from "lucide-react";

const API_URL = "http://localhost:8000";

export default function ModernUpload() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);
    const [fileName, setFileName] = useState(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleFileUpload = async (file) => {
        if (!file) return;

        if (file.type !== "application/pdf") {
            setError("Please upload a PDF file only");
            return;
        }

        setError(null);
        setFileName(file.name);
        setIsAnalyzing(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(`${API_URL}/upload`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Upload failed");
            }

            const data = await response.json();
            
            // Navigate to results page with data
            navigate("/results", { state: { data } });
        } catch (err) {
            setError(err.message || "Failed to analyze resume. Please try again.");
            setIsAnalyzing(false);
            setFileName(null);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0];
        handleFileUpload(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        handleFileUpload(file);
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative w-full min-h-screen flex flex-col items-center justify-center p-6 md:p-8">
                <div className="w-full max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12 space-y-4 animate-fade-in">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600 rounded-2xl shadow-lg mb-4 transform hover:scale-105 transition-transform">
                            <Sparkles className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
                            aiResume
                        </h1>
                        <a href="https://linkedin.com/in/jergusnadasky" className="inline-block text-lg md:text-xl font-semibold text-gray-700 hover:text-purple-600 transition-colors duration-200">
                            by Jergus Nadasky
                        </a>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Get AI-powered analysis and actionable recommendations to make your resume stand out
                        </p>
                    </div>

                    {/* Upload Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12 mb-8 animate-slide-up">
                        <div
                            onClick={() => !isAnalyzing && fileInputRef.current?.click()}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`relative border-4 border-dashed rounded-2xl p-12 transition-all duration-300 ${
                                isDragging
                                    ? "border-purple-500 bg-purple-50 scale-[1.02]"
                                    : "border-purple-300 hover:border-purple-500 bg-gradient-to-br from-purple-50/50 to-indigo-50/50"
                            } ${isAnalyzing ? "pointer-events-none opacity-75" : "cursor-pointer"}`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileSelect}
                                className="hidden"
                                disabled={isAnalyzing}
                            />

                            {!isAnalyzing ? (
                                <div className="flex flex-col items-center justify-center space-y-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-purple-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                                        <div className="relative bg-purple-600 p-6 rounded-2xl shadow-lg transform hover:scale-110 transition-transform">
                                            <Upload className="w-12 h-12 text-white" />
                                        </div>
                                    </div>

                                    <div className="text-center space-y-2">
                                        <h3 className="text-2xl font-bold text-gray-800">
                                            {fileName ? fileName : "Drop your resume here"}
                                        </h3>
                                        <p className="text-gray-500">
                                            or <span className="text-purple-600 font-semibold">click anywhere to browse files</span>
                                        </p>
                                        <p className="text-sm text-gray-400 mt-2">PDF format only • Max size 10MB</p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            fileInputRef.current?.click();
                                        }}
                                        className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                                    >
                                        Choose File
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center space-y-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-purple-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                                        <div className="relative bg-purple-600 p-6 rounded-2xl shadow-lg">
                                            <Loader2 className="w-12 h-12 text-white animate-spin" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-2xl font-bold text-gray-800">Analyzing Resume...</h3>
                                        <p className="text-gray-500">Our AI is evaluating your resume</p>
                                        <div className="flex items-center justify-center space-x-2 mt-4">
                                            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start space-x-3 animate-shake">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-red-700">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in-delay">
                        {[
                            { icon: FileText, title: "AI Analysis", desc: "Comprehensive evaluation using advanced AI" },
                            { icon: Sparkles, title: "Smart Insights", desc: "Actionable recommendations tailored to you" },
                            { icon: CheckCircle2, title: "ATS Optimized", desc: "Improve your resume's ATS compatibility" },
                        ].map((feature, idx) => (
                            <div
                                key={idx}
                                className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                            >
                                <feature.icon className="w-8 h-8 text-purple-600 mb-3" />
                                <h3 className="font-bold text-gray-800 mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-600">{feature.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Social Links */}
                    <div className="flex items-center justify-center gap-4 animate-fade-in-delay">
                        <a
                            href="mailto:jergusko23@gmail.com"
                            className="group flex items-center justify-center w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                            aria-label="Email"
                        >
                            <Mail className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
                        </a>
                        <a
                            href="https://github.com/jergusnadasky"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-center w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                            aria-label="GitHub"
                        >
                            <Github className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
                        </a>
                        <a
                            href="https://linkedin.com/in/jergusnadasky"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-center w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                            aria-label="LinkedIn"
                        >
                            <Linkedin className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}