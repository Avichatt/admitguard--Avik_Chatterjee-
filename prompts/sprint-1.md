# Sprint-1: Base Form Structure

**Role**: You are a senior frontend developer building an internal business tool.

**Task**: Create a candidate admission form for an education company's enrollment process. The form collects the following fields:
- Full Name (text)
- Email (text)
- Phone (text, 10 digits)
- Date of Birth (date picker)
- Highest Qualification (dropdown: B.Tech, B.E., B.Sc, BCA, M.Tech, M.Sc, MCA, MBA)
- Graduation Year (number, range 2015-2025)
- Percentage or CGPA (number with a toggle to switch between percentage and CGPA mode)
- Screening Test Score (number, 0-100)
- Interview Status (dropdown: Cleared, Waitlisted, Rejected)
- Aadhaar Number (text, 12 digits only)
- Offer Letter Sent (toggle: Yes/No)

**Constraints**:
- Use a clean, professional design. Not a generic template.
- Each field should show a label, input, and validation message area.
- The submit button should be disabled until all strict validations pass.
- Use a single-page layout with a card-based form design.
- Show a progress indicator or step tracker if the form is long.

---

# Sprint-1: Strict Validation Rules

Now add validation for these STRICT rules (violations block submission, no exceptions allowed):

1. Full Name: Cannot be blank. Minimum 2 characters. No numbers allowed.
2. Email: Must be valid email format (contains @ and a domain).
3. Phone: Exactly 10 digits. Must start with 6, 7, 8, or 9.
4. Highest Qualification: Must select one from the dropdown (cannot be empty).
5. Interview Status: If "Rejected" is selected, block submission entirely and show a red banner: "Rejected candidates cannot be enrolled."
6. Aadhaar Number: Exactly 12 digits. No alphabets or special characters.
7. Offer Letter Sent: Cannot be "Yes" unless Interview Status is "Cleared" or "Waitlisted".

Show validation errors INLINE below each field in red text as the user types or changes values. The submit button stays disabled until ALL strict rules pass.
