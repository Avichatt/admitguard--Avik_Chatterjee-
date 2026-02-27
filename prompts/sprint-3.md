# Sprint-3: Configurable Rules Engine

Refactor the validation rules so they are NOT hardcoded in the form logic. 
Instead, store all rules in a separate JSON configuration object like this:

```json
{
  "rules": [
    {
      "field": "full_name",
      "type": "strict",
      "validation": "minLength:2, noNumbers, required",
      "errorMessage": "Name must be at least 2 characters with no numbers"
    },
    {
      "field": "dob",
      "type": "soft",
      "validation": "ageRange:18-35",
      "errorMessage": "Candidate age must be between 18-35",
      "exceptionAllowed": true,
      "rationaleKeywords": ["approved by", "special case", "documentation pending", "waiver granted"]
    }
  ]
}
```

The form should READ from this config object to determine what validations to apply. This way, the operations team can update rules by editing the config, not the form code.

Show me the complete config object for all 11 fields, and refactor the form to use it.

---

# Sprint-3: Audit Log and Data Persistence

Add an audit trail feature:

1. Every successful form submission gets logged with:
   - Timestamp
   - All field values entered
   - Number of exceptions used
   - Which fields had exceptions + the rationale text
   - Whether the entry was flagged for manager review

2. Add a separate "Audit Log" view/tab that shows all past submissions in a table format. Include:
   - Candidate name
   - Submission timestamp
   - Exception count
   - Flagged status (Yes/No)
   - A button to expand and see full details

3. Store the log in localStorage so it persists across page refreshes.

4. Add a "Clear Log" button (with a confirmation dialog) for testing.

---

# Sprint-3: UI Polish and Confirmation Flow

At this stage, switch to Annotation Mode in Antigravity Studio:

Click on specific UI elements and describe changes
"Make this form header larger and add a company logo placeholder"
"The error messages are too close to the next field — add spacing"
"Add a confirmation modal before submission showing a summary of all entered data"
"Add a subtle animation when validation passes on a field"
