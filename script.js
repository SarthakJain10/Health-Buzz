document.addEventListener('DOMContentLoaded', function () {

    // Health Issue Assessment Form
    const healthForm = document.getElementById('health-form');
    const healthDescription = document.getElementById('health-description');
    const diagnosisResult = document.getElementById('diagnosis-result');
    const firstAidDiv = document.getElementById('first-aid');
    const lifestyleChangesDiv = document.getElementById('lifestyle-changes');

    healthForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Show loading state
        document.body.style.cursor = "wait";
        diagnosisResult.textContent = "Processing your symptoms... Please wait.";
        firstAidDiv.textContent = "";
        lifestyleChangesDiv.textContent = "";

        const issue = healthDescription.value.trim();

        if (!issue) {
            diagnosisResult.textContent = "⚠️ Please enter a health issue.";
            document.body.style.cursor = "default";
            return;
        }

        try {
            // Call Gemini API
            const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyDkDU9zziwxWEdpndkqWRmG3NXN6KaPUwc", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are a medical assistant. A patient reports the disease/symptom: "${issue}". 
                                    Return a JSON object with exactly three keys: 
                                    {
                                    "diagnosis": "Short diagnostic explanation (max 3 sentences)",
                                    "firstAid": ["Step 1", "Step 2", "Step 3"],
                                    "lifestyle": ["Tip 1", "Tip 2", "Tip 3"]
                                    }

                                    Do NOT include any extra text, Markdown, or formatting outside of the JSON.`
                        }]
                    }]
                })
            });

            const data = await response.json();
            // console.log(data);

            try {
                if (data.candidates && data.candidates.length > 0) {
                    const rawText = data.candidates[0].content.parts[0].text.trim();
                    const replyText = rawText.replace(/```json|```/g, "").trim();

                    // Parse the JSON directly
                    const parsed = JSON.parse(replyText);
                    // console.log(parsed)

                    const diagnostic = parsed.diagnosis || "No diagnostic information found.";
                    const firstAid = Array.isArray(parsed.firstAid) ? parsed.firstAid : [];
                    const lifestyle = Array.isArray(parsed.lifestyle) ? parsed.lifestyle : [];

                    // Section 1: Diagnostic explanation
                    diagnosisResult.innerHTML = `<h2>Diagnostic Explanation</h2>
                                                <p>${diagnostic}</p>`;

                    // Section 2: First aid (bullet list)
                    firstAidDiv.innerHTML = `<h2>First Aid / Immediate Steps</h2>
                                            ${firstAid.length > 0 ? `<ul>${firstAid.map(item => `<li>${item}</li>`).join("")}</ul>` : "<p>No first aid information found.</p>"}`;

                    // Section 3: Lifestyle changes (bullet list)
                    lifestyleChangesDiv.innerHTML = `<h2>Suggested Lifestyle Changes</h2>
                                                    ${lifestyle.length > 0 ? `<ul>${lifestyle.map(item => `<li>${item}</li>`).join("")}</ul>` : "<p>No lifestyle changes suggested.</p>"}`;
                } else {
                    diagnosisResult.textContent = "❌ No response from API.";
                    firstAidDiv.textContent = "";
                    lifestyleChangesDiv.textContent = "";
                }
            } catch (err) {
                console.error("Error parsing API response:", err);
                diagnosisResult.textContent = "❌ Failed to parse response.";
                firstAidDiv.textContent = "";
                lifestyleChangesDiv.textContent = "";
            }



        } catch (error) {
            console.error(error);
            diagnosisResult.textContent = "❌ Error fetching diagnosis. Please try again.";
        } finally {
            document.body.style.cursor = "default";
        }
    });

});
