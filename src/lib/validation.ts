
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

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
  
  // Check age vs youth age group
  if (youthAgeGroup && youthAgeGroup !== "N/A") {
    const ageGroupRanges: { [key: string]: [number, number] } = {
      "CHILD YOUTH (15-17)": [15, 17],
      "CORE YOUTH (18-24)": [18, 24], 
      "YOUNG ADULT (25-30)": [25, 30]
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
  
  if (value && value !== "N/A" && !allowedValues.includes(value as any)) {
    errors.push(`Invalid ${fieldName}: "${value}" (not in allowed options)`);
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
  
  // Critical fields that cannot be N/A or blank
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
  
  // Optional fields
  const optionalFields = [
    { field: 'civil_status', label: 'civil status' },
    { field: 'highest_education', label: 'education level' },
    { field: 'work_status', label: 'work status' },
    { field: 'registered_voter', label: 'voter registration status' },
    { field: 'voted_last_election', label: 'voting history' },
    { field: 'attended_kk_assembly', label: 'KK assembly attendance info' },
    { field: 'home_address', label: 'home address' },
    { field: 'email_address', label: 'email address' },
    { field: 'contact_number', label: 'contact number' }
  ];

  // Check critical fields
  criticalFields.forEach(({ field, label }) => {
    const value = record[field];
    if (!value || value === "N/A" || (typeof value === 'string' && value.trim() === '')) {
      errors.push(`Missing critical field: ${label} (required for identification)`);
    }
  });

  // Check important fields
  importantFields.forEach(({ field, label }) => {
    const value = record[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      warnings.push(`Missing important field: ${label}`);
    }
  });

  // Optional fields only generate warnings if completely missing
  optionalFields.forEach(({ field, label }) => {
    const value = record[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      warnings.push(`Missing optional field: ${label}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
