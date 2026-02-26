import rulesConfig from '../../config/rules.json';

const rules = rulesConfig;

function getAge(dateOfBirth, referenceDate) {
  const dob = new Date(dateOfBirth);
  const ref = new Date(referenceDate);
  let age = ref.getFullYear() - dob.getFullYear();
  const monthDiff = ref.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && ref.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function runValidation(validation, value, allFormData, editId, existingEmails = []) {
  const v = value?.toString().trim() ?? '';

  switch (validation.type) {
    case 'required':
      return v.length > 0 ? null : validation.message;

    case 'minLength':
      return v.length >= validation.value ? null : validation.message;

    case 'pattern': {
      const regex = new RegExp(validation.value);
      return regex.test(v) ? null : validation.message;
    }

    case 'unique': {
      return !existingEmails.includes(v.toLowerCase()) ? null : validation.message;
    }

    case 'ageRange': {
      if (!v) return null;
      const age = getAge(v, rules.programStartDate);
      if (age < validation.min || age > validation.max) return validation.message;
      return null;
    }

    case 'oneOf':
      return validation.values.includes(v) ? null : validation.message;

    case 'range': {
      const num = parseFloat(v);
      if (isNaN(num)) return 'Please enter a valid number';
      if (num < validation.min || num > validation.max) return validation.message;
      return null;
    }

    case 'percentageOrCgpa': {
      const num = parseFloat(v);
      if (isNaN(num)) return 'Please enter a valid number';
      if (num <= validation.cgpaScale) {
        return num >= validation.minCgpa ? null : validation.message;
      }
      return num >= validation.minPercentage ? null : validation.message;
    }

    case 'min': {
      const num = parseFloat(v);
      if (isNaN(num)) return 'Please enter a valid number';
      return num >= validation.value ? null : validation.message;
    }

    case 'max': {
      const num = parseFloat(v);
      if (isNaN(num)) return 'Please enter a valid number';
      return num <= validation.value ? null : validation.message;
    }

    case 'notValue':
      return v !== validation.value ? null : validation.message;

    case 'crossField': {
      if (validation.condition === 'offerLetterRequiresInterview') {
        if (v === 'Yes') {
          const interviewStatus = allFormData?.interviewStatus ?? '';
          if (interviewStatus !== 'Cleared' && interviewStatus !== 'Waitlisted') {
            return validation.message;
          }
        }
      }
      return null;
    }

    default:
      return null;
  }
}

export function validateField(fieldId, value, allFormData = {}, editId = null, existingEmails = []) {
  const fieldConfig = rules.fields.find(f => f.fieldId === fieldId);
  if (!fieldConfig) return { valid: true, errors: [], ruleCategory: 'unknown' };

  const errors = [];
  for (const validation of fieldConfig.validations) {
    const error = runValidation(validation, value, allFormData, editId, existingEmails);
    if (error) errors.push(error);
  }

  return {
    valid: errors.length === 0,
    errors,
    ruleCategory: fieldConfig.ruleCategory,
    exceptionAllowed: fieldConfig.exceptionAllowed
  };
}

export function validateForm(formData, exceptions = {}, editId = null, existingEmails = []) {
  const results = {};
  let allValid = true;
  let exceptionCount = 0;

  for (const field of rules.fields) {
    const value = formData[field.fieldId] ?? '';
    const result = validateField(field.fieldId, value, formData, editId, existingEmails);

    if (!result.valid) {
      if (field.ruleCategory === 'strict') {
        allValid = false;
      } else if (field.ruleCategory === 'soft') {
        const exception = exceptions[field.fieldId];
        if (exception?.enabled) {
          const rationaleResult = validateRationale(exception.rationale);
          if (!rationaleResult.valid) {
            allValid = false;
          } else {
            exceptionCount++;
          }
        } else {
          allValid = false;
        }
      }
    }

    results[field.fieldId] = {
      ...result,
      value,
      hasException: exceptions[field.fieldId]?.enabled || false
    };
  }

  const systemFlags = [];
  const maxExRule = rules.systemRules.find(r => r.type === 'exceptionCountLimit');
  if (maxExRule && exceptionCount > maxExRule.maxExceptions) {
    systemFlags.push({
      type: 'managerReview',
      message: maxExRule.message,
      exceptionCount
    });
  }

  return {
    valid: allValid,
    results,
    exceptionCount,
    systemFlags,
    requiresManagerReview: systemFlags.length > 0
  };
}

export function validateRationale(rationale) {
  const config = rules.exceptionConfig;
  const text = (rationale || '').trim();
  const errors = [];

  if (text.length < config.minRationaleLength) {
    errors.push(`Rationale must be at least ${config.minRationaleLength} characters (currently ${text.length})`);
  }

  const lowerText = text.toLowerCase();
  const hasKeyword = config.requiredKeywords.some(kw => lowerText.includes(kw.toLowerCase()));
  if (!hasKeyword) {
    errors.push(`Rationale must include at least one of: "${config.requiredKeywords.join('", "')}"`);
  }

  return { valid: errors.length === 0, errors };
}

export function getRulesConfig() {
  return rules;
}

export function getFieldConfig(fieldId) {
  return rules.fields.find(f => f.fieldId === fieldId);
}
