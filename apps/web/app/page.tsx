"use client";

import { useState } from "react";
import { uploadScan, generateRubric, evaluateSubmission } from "@/lib/api";
import Camera from "@/components/Camera";

export default function Home() {
  const [apiKey, setApiKey] = useState("AIzaSyAKWs310vfRgcRln5Rr0bDxX0BeI4oj6jw");
  const [step, setStep] = useState(1);
  const [modelAnswer, setModelAnswer] = useState("the mitochondria is the powerhouse of the cell");
  const [rubric, setRubric] = useState<any>(null);
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [submissionId, setSubmissionId] = useState("");
  const [scanPreview, setScanPreview] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleCreateRubric = async () => {
    if (!apiKey) return alert("Please enter a Gemini API Key");
    setLoading(true);
    try {
      const res = await generateRubric(modelAnswer, apiKey);
      setRubric(res.rubric);
      setStep(2);
    } catch (e) {
      alert("Error generating rubric. Check API Key.");
    } finally {
      setLoading(false);
    }
  };

  const handleScanUpload = async () => {
    if (!scanFile) return;
    setLoading(true);
    try {
      const res = await uploadScan(scanFile);
      setSubmissionId(res.submission_id);
      setScanPreview(res.extracted_text_preview); // Just showing first few lines
      setStep(3);
    } catch (e) {
      alert("Error uploading scan");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!apiKey) return alert("Please enter a Gemini API Key");
    setLoading(true);
    try {
      const res = await evaluateSubmission(submissionId, rubric, apiKey);
      setEvaluation(res);
      setStep(4);
    } catch (e) {
      alert("Error evaluating. Check API Key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 font-sans transition-colors duration-200">
      {showCamera && (
        <Camera
          onClose={() => setShowCamera(false)}
          onCapture={(file) => {
            setScanFile(file);
            setShowCamera(false);
          }}
        />
      )}

      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 transition-colors duration-200">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">AI Exam Evaluator 🤖</h1>
        <p className="text-gray-500 dark:text-gray-300 mb-8">Scan, Parse, and Grade Logic-based answers.</p>

        {/* API Key Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gemini API Key</label>
          <input
            type="password"
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="Enter your Google Gemini API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-1">Get one at https://aistudio.google.com/app/apikey</p>
        </div>

        {/* Stepper */}
        <div className="flex justify-between mb-8 text-sm font-medium text-gray-400">
          <div className={`${step >= 1 ? "text-blue-600" : ""}`}>1. Model Answer</div>
          <div className={`${step >= 2 ? "text-blue-600" : ""}`}>2. Scan Paper</div>
          <div className={`${step >= 3 ? "text-blue-600" : ""}`}>3. Review OCR</div>
          <div className={`${step >= 4 ? "text-blue-600" : ""}`}>4. Result</div>
        </div>

        {/* Step 1: Create Rubric */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Step 1: Input Model Answer</h2>

            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
              <strong>What is this?</strong><br />
              Paste the "Correct Answer" or "Teacher's Key" here. <br />
              The AI will read this and automatically create a **Rubric** (grading rules) to score the student's work.
            </div>

            <textarea
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg h-40 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              value={modelAnswer}
              onChange={(e) => setModelAnswer(e.target.value)}
            />
            <button
              onClick={handleCreateRubric}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Generating Grading Rules..." : "Generate Rubric"}
            </button>
          </div>
        )}

        {/* Step 2: Upload Scan */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Step 2: Scan Student Paper</h2>
            <p className="text-sm text-gray-600">Upload an image or take a photo of the handwritten answer sheet.</p>

            <div className="flex gap-4">
              <div className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer relative">
                <span className="text-gray-500 dark:text-gray-400">📂 Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setScanFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              <button
                onClick={() => setShowCamera(true)}
                className="flex-1 border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-8 text-center hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-blue-600 dark:text-blue-400 font-semibold"
              >
                📸 Open Camera
              </button>
            </div>

            {scanFile && (
              <div className="text-center text-sm text-green-600 font-medium">
                Ready to process: {scanFile.name}
              </div>
            )}

            <button
              onClick={handleScanUpload}
              disabled={loading || !scanFile}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Vision Agent Processing..." : "Process Scan"}
            </button>
          </div>
        )}

        {/* Step 3: Review Extraction */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Step 3: Verify OCR Extraction</h2>
            <p className="text-sm text-gray-600">The AI read the handwriting. Check if it looks correct before grading.</p>
            <div className="bg-gray-100 p-4 rounded-lg text-sm font-mono h-40 overflow-y-auto">
              <pre>{JSON.stringify(scanPreview, null, 2)}</pre>
            </div>
            <button
              onClick={handleEvaluate}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? "Evaluation Agent Grading..." : "Grade Paper"}
            </button>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && evaluation && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800">{evaluation.total_score} / {evaluation.max_score}</h2>
              <p className="text-gray-500">Final Score</p>
            </div>

            <div className="space-y-4">
              {evaluation.detailed_results.map((res: any, idx: number) => (
                <div key={idx} className="border p-4 rounded-lg bg-white shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-lg">Q{res.question_id}</span>
                    <span className="font-bold text-blue-600">{res.score}/{res.max_marks}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Student Answer:</span> "{res.student_text}"
                  </div>
                  <div className={`text-sm p-2 rounded ${res.score === res.max_marks ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    <span className="font-semibold">Feedback:</span> {res.feedback}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition"
            >
              Start New Evaluation
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
