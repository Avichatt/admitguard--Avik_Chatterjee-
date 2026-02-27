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
