# Sprint-2: Soft Rules and Exception System

Now add SOFT rule validations. These are different from strict rules — they block submission by default, BUT the user can override them.

Soft rules:
1. Date of Birth: Candidate must be between 18 and 35 years old (calculated from today's date to DOB). 
2. Graduation Year: Must be between 2015 and 2025.
3. Percentage/CGPA: If in percentage mode, must be >= 60%. If in CGPA mode (10-point scale), must be >= 6.0.
4. Screening Test Score: Must be >= 40 out of 100.

When a soft rule is violated:
- Show a yellow/amber warning (not red error) below the field
- Show a toggle/checkbox labeled "Request Exception"
- When the toggle is ON, show a text area labeled "Exception Rationale"
- The rationale must be at least 30 characters long
- The rationale must contain at least ONE of these phrases: "approved by", "special case", "documentation pending", "waiver granted"
- If the rationale doesn't meet these conditions, show a helpful error message explaining what's needed
- If the rationale IS valid, the soft rule violation is overridden and submission is allowed
Keep the form visually clear — strict errors in red, soft warnings in amber/yellow, valid fields in green.

---

# Sprint-2: Exception Counter and Flagging

Add a system-level rule: 

Count the number of active exceptions on the current form. Display this count prominently near the submit button as: 
"Active Exceptions: X/4"

If the count exceeds 2, show a warning banner:
"⚠️ This candidate has more than 2 exceptions. Entry will be flagged for manager review."

The submit button should still work, but the entry should be visually marked as "Flagged" in any data display.
