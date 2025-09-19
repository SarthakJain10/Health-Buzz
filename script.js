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
                            text: `You are a medical assistant. 
                            A patient reports the disease/symptom: "${issue}".
                            Provide three sections:

                            1. Diagnostic explanation : "short, clear explanation (max 3 sentences)", 
                            2. First aid / immediate steps : ["bullet point 1","bullet point 2","bullet point 3"], 
                            3. Suggested lifestyle changes: ["point 1","point 2","point 3"]`
                        }]
                    }]
                })
            });

            const data = await response.json();

            if (data.candidates && data.candidates.length > 0) {
                const reply = data.candidates[0].content.parts[0].text;

                // Split into sections
                const sections = reply.split(/\d\./).map(s => s.trim()).filter(Boolean);
                // console.log(sections)

                // Section 1: Diagnostic explanation (normal paragraph)
                diagnosisResult.innerHTML = sections[1] 
                    ? `<p><strong>Diagnosis:</strong> ${sections[1]}</p>` 
                    : "No diagnostic information found.";

                // Section 2: First aid (make bullet list)
                if (sections[2]) {
                    const firstAidPoints = sections[2]
                        .split(/[-•]\s*|\n/) // split on dashes, bullets, or newlines
                        .filter(Boolean)
                        .map(p => `<li>${p.trim()}</li>`)
                        .join("");
                    firstAidDiv.innerHTML = `<strong>First Aid:</strong><ul>${firstAidPoints}</ul>`;
                } else {
                    firstAidDiv.textContent = "No first aid information found.";
                }

                // Section 3: Lifestyle changes (make bullet list)
                if (sections[3]) {
                    const lifestylePoints = sections[3]
                        .split(/[-•]\s*|\n/)
                        .filter(Boolean)
                        .map(p => `<li>${p.trim()}</li>`)
                        .join("");
                    lifestyleChangesDiv.innerHTML = `<strong>Lifestyle Changes:</strong><ul>${lifestylePoints}</ul>`;
                } else {
                    lifestyleChangesDiv.textContent = "No lifestyle changes suggested.";
                }
            }


        } catch (error) {
            console.error(error);
            diagnosisResult.textContent = "❌ Error fetching diagnosis. Please try again.";
        } finally {
            document.body.style.cursor = "default";
        }
    });

});
