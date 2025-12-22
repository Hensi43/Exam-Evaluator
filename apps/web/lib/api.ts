const API_URL = "http://localhost:8000/api/v1";

export async function uploadScan(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/scan/upload`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) throw new Error("Scan upload failed");
    return res.json();
}

export async function generateRubric(text: string, apiKey: string) {
    const res = await fetch(`${API_URL}/rubric/generate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Gemini-API-Key": apiKey
        },
        body: JSON.stringify({ answer_text: text }),
    });

    if (!res.ok) throw new Error("Rubric generation failed");
    return res.json();
}

export async function evaluateSubmission(submissionId: string, rubric: any, apiKey: string) {
    const res = await fetch(`${API_URL}/evaluate/${submissionId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Gemini-API-Key": apiKey
        },
        body: JSON.stringify({ rubric }),
    });

    if (!res.ok) throw new Error("Evaluation failed");
    return res.json();
}
