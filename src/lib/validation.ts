
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Helper function to normalize values for comparison
const normalizeValue = (value: string): string => {
  if (!value || value === "N/A") return "N/A";
  return value.trim();
};

// Helper function to normalize sex values
const normalizeSex = (value: string): string => {
  if (!value || value === "N/A") return "N/A";
  const normalized = value.toLowerCase().trim();
  if (normalized === "male" || normalized === "m") return "Male";
  if (normalized === "female" || normalized === "f") return "Female";
  return value;
};

// Helper function to normalize civil status values
const normalizeCivilStatus = (value: string): string => {
  if (!value || value === "N/A") return "N/A";
  const normalized = value.toLowerCase().trim();
  const statusMap: { [key: string]: string } = {
    "single": "Single",
    "married": "Married",
    "lived-in": "Lived-In",
    "widowed": "Widowed",
    "divorced": "Divorced",
    "separated": "Separated"
  };
  return statusMap[normalized] || value;
};

export function validateAgeConsistency(age: number, birthday: string, youthAgeGroup: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check age vs birthday
  const birthdayDate = new Date(birthday);
  if (!isNaN(birthdayDate.getTime())) {
    const currentYear = new Date().getFullYear();
    const birthYear = birthdayDate.getFullYear();
    const calculatedAge = currentYear - birthYear;
    
    if (Math.abs(age - calculatedAge) > 1) {
      errors.push(`Age (${age}) doesn't match birthday (calculated age: ${calculatedAge})`);
    }
  }
  
  // Check age vs youth age group (only if not N/A)
  if (youthAgeGroup && youthAgeGroup !== "N/A") {
    const ageGroupRanges: { [key: string]: [number, number] } = {
      "Child Youth (15-17)": [15, 17],
      "Core Youth (18-24)": [18, 24], 
      "Young Adult (25-30)": [25, 30]
    };
    
    const range = ageGroupRanges[youthAgeGroup];
    if (range && (age < range[0] || age > range[1])) {
      errors.push(`Age (${age}) doesn't match age group (${youthAgeGroup})`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateDropdownValue(value: string, allowedValues: readonly string[], fieldName: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Allow N/A for all dropdown fields
  if (!value || value === "N/A") {
    return { isValid: true, errors, warnings };
  }

  // Normalize the value based on field type
  let normalizedValue = value;
  if (fieldName === 'sex') {
    normalizedValue = normalizeSex(value);
  } else if (fieldName === 'civil_status') {
    normalizedValue = normalizeCivilStatus(value);
  }

  // Check if the normalized value is in allowed values
  if (!allowedValues.includes(normalizedValue as any)) {
    // Try case-insensitive match as fallback
    const caseInsensitiveMatch = allowedValues.find(
      allowed => allowed.toLowerCase() === normalizedValue.toLowerCase()
    );
    
    if (!caseInsensitiveMatch) {
      errors.push(`Invalid ${fieldName}: "${value}" (not in allowed options: ${allowedValues.join(', ')})`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateRequiredFields(record: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Critical fields that cannot be N/A or blank - essential for identification
  const criticalFields = [
    { field: 'name', label: 'name' },
    { field: 'age', label: 'age' },
    { field: 'birthday', label: 'birthday' },
    { field: 'sex', label: 'sex/gender' },
    { field: 'barangay', label: 'barangay' }
  ];
  
  // Important fields that should be filled but can be N/A
  const importantFields = [
    { field: 'youth_classification', label: 'youth classification' },
    { field: 'youth_age_group', label: 'age group' }
  ];
  
  // Check critical fields - these must have actual values
  criticalFields.forEach(({ field, label }) => {
    const value = record[field];
    if (!value || value === "N/A" || (typeof value === 'string' && value.trim() === '')) {
      errors.push(`Missing critical field: ${label} (required for identification)`);
    }
  });

  // Check important fields - warn if missing but don't treat as error
  importantFields.forEach(({ field, label }) => {
    const value = record[field];
    if (!value || value === "N/A" || (typeof value === 'string' && value.trim() === '')) {
      warnings.push(`Consider filling: ${label} (helpful for categorization)`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
