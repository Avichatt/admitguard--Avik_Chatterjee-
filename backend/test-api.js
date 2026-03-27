const apiUrl = 'https://admit-guard.netlify.app/api/candidates';

const sampleCandidates = [
    {
        formData: {
            fullName: "John Doe",
            email: "john.doe@example.com",
            phone: "+1234567890",
            highestQualification: "B.Tech",
            graduationYear: "2023",
            percentageCgpa: "8.5",
            screeningTestScore: "85",
            interviewStatus: "Passed"
        },
        exceptions: {},
        exceptionCount: 0,
        systemFlags: []
    },
    {
        formData: {
            fullName: "Jane Smith",
            email: "jane.smith@example.com",
            phone: "+0987654321",
            highestQualification: "MCA",
            graduationYear: "2022",
            percentageCgpa: "9.2",
            screeningTestScore: "92",
            interviewStatus: "Passed"
        },
        exceptions: {},
        exceptionCount: 0,
        systemFlags: []
    },
    {
        formData: {
            fullName: "Alice Johnson",
            email: "alice.j@example.com",
            phone: "+1122334455",
            highestQualification: "BCA",
            graduationYear: "2024",
            percentageCgpa: "7.8",
            screeningTestScore: "75",
            interviewStatus: "Pending"
        },
        exceptions: {
            "graduationYear": {
                enabled: true,
                rationale: "Pursuing final year, early admission."
            }
        },
        exceptionCount: 1,
        systemFlags: []
    },
    {
        formData: {
            fullName: "Bob Williams",
            email: "bob.w@example.com",
            phone: "+5544332211",
            highestQualification: "B.Sc",
            graduationYear: "2020",
            percentageCgpa: "6.5",
            screeningTestScore: "90",
            interviewStatus: "Passed"
        },
        exceptions: {},
        exceptionCount: 0,
        systemFlags: [
            { message: "Gap year > 3 years detected" }
        ]
    },
    {
        formData: {
            fullName: "Charlie Brown",
            email: "charlie@example.com",
            phone: "+9988776655",
            highestQualification: "M.Tech",
            graduationYear: "2021",
            percentageCgpa: "8.9",
            screeningTestScore: "88",
            interviewStatus: "Failed"
        },
        exceptions: {},
        exceptionCount: 0,
        systemFlags: []
    }
];

async function runTests() {
    console.log("🚀 Starting API Validation Tests on:", apiUrl);
    
    // Fetch initial to see what the server responds with
    console.log("--- Initial GET request to see server status ---");
    try {
        const initRes = await fetch(apiUrl);
        console.log("Status:", initRes.status);
        const text = await initRes.text();
        console.log("Response text:", text.substring(0, 500));
        
        if (!initRes.ok) {
            console.log("Server does not appear to be ready. Exiting test.");
            return;
        }
    } catch(e) {
        console.log("Network error on initial fetch:", e.message);
        return;
    }

    // 1. Post 5 records
    console.log("\\n--- Testing POST /api/candidates ---");
    for (let i = 0; i < sampleCandidates.length; i++) {
        try {
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sampleCandidates[i])
            });
            const dataText = await res.text();
            if (res.ok) {
                const data = JSON.parse(dataText);
                console.log(`✅ [Record ${i + 1}] Successfully saved: ${sampleCandidates[i].formData.fullName} (ID: ${data.id})`);
            } else {
                console.error(`❌ [Record ${i + 1}] Failed to save. Status: ${res.status}. Response: ${dataText}`);
            }
        } catch (err) {
            console.error(`❌ [Record ${i + 1}] Network/Server Error:`, err.message);
        }
    }

    // 2. Fetch records
    console.log("\\n--- Testing GET /api/candidates ---");
    try {
        const res = await fetch(apiUrl);
        const dataText = await res.text();
        if (res.ok) {
            const data = JSON.parse(dataText);
            console.log(`✅ Fetched successfully. Total records retrieved: ${data.length}`);
            
            // Show recent 5 to verify
            console.log("\\n📝 Most recent 5 records:");
            data.slice(0, 5).forEach((record, index) => {
                const fullName = typeof record.data === 'string' ? JSON.parse(record.data).fullName : record.data.fullName;
                console.log(`- ${index+1}. ${fullName} | Status: ${record.status} | Created At: ${record.createdAt}`);
            });
        } else {
            console.error(`❌ Failed to fetch records. Status: ${res.status}. Response: ${dataText}`);
        }
    } catch(err) {
        console.error(`❌ Error fetching records:`, err.message);
    }
}

runTests();
