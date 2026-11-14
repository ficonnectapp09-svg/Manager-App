/**
 * Connect App Ecosystem - Global Validation Utility (Mobile TypeScript)
 * Standardized across Manager Mobile, Website, and Backend.
 */

// ==============================================================================
// 1. BANK ACCOUNT CONFIGURATIONS & RULES
// ==============================================================================
export const BANK_ACCOUNT_LENGTHS: Record<string, { min: number; max: number; label: string }> = {
  sbi: { min: 11, max: 17, label: 'State Bank of India' },
  hdfc: { min: 14, max: 14, label: 'HDFC Bank' },
  icici: { min: 12, max: 12, label: 'ICICI Bank' },
  pnb: { min: 16, max: 16, label: 'Punjab National Bank' },
  axis: { min: 15, max: 15, label: 'Axis Bank' },
  canara: { min: 13, max: 13, label: 'Canara Bank' },
  bob: { min: 14, max: 14, label: 'Bank of Baroda' },
  union: { min: 15, max: 15, label: 'Union Bank of India' },
  indian: { min: 9, max: 17, label: 'Indian Bank' },
  kotak: { min: 10, max: 10, label: 'Kotak Mahindra Bank' },
  indusind: { min: 12, max: 12, label: 'IndusInd Bank' },
  yes: { min: 15, max: 15, label: 'Yes Bank' },
  federal: { min: 14, max: 14, label: 'Federal Bank' },
  central: { min: 10, max: 17, label: 'Central Bank of India' },
};

export function resolveBankRule(bankNameOrCode?: string | null) {
  if (!bankNameOrCode) return null;
  const s = String(bankNameOrCode).toLowerCase().replace(/[^a-z]/g, '');
  if (s.includes('sbi') || s.includes('statebank')) return BANK_ACCOUNT_LENGTHS.sbi;
  if (s.includes('hdfc')) return BANK_ACCOUNT_LENGTHS.hdfc;
  if (s.includes('icici')) return BANK_ACCOUNT_LENGTHS.icici;
  if (s.includes('pnb') || s.includes('punjab')) return BANK_ACCOUNT_LENGTHS.pnb;
  if (s.includes('axis')) return BANK_ACCOUNT_LENGTHS.axis;
  if (s.includes('canara')) return BANK_ACCOUNT_LENGTHS.canara;
  if (s.includes('bob') || s.includes('baroda')) return BANK_ACCOUNT_LENGTHS.bob;
  if (s.includes('unionbank')) return BANK_ACCOUNT_LENGTHS.union;
  if (s.includes('kotak')) return BANK_ACCOUNT_LENGTHS.kotak;
  if (s.includes('indusind')) return BANK_ACCOUNT_LENGTHS.indusind;
  if (s.includes('yesbank')) return BANK_ACCOUNT_LENGTHS.yes;
  if (s.includes('federal')) return BANK_ACCOUNT_LENGTHS.federal;
  if (s.includes('centralbank')) return BANK_ACCOUNT_LENGTHS.central;
  if (s === 'indian' || s.includes('indianbank')) return BANK_ACCOUNT_LENGTHS.indian;
  return null;
}

// ==============================================================================
// 2. NAME FIELD VALIDATION & FORMATTING
// ==============================================================================
export function formatName(val?: string | null): string {
  if (!val) return '';
  const str = String(val).replace(/^\s+/, '');
  return str.replace(/(?:^|[\s.'’\-])\p{L}/gu, (match) => match.toUpperCase());
}

export function validateName(name?: string | null, isRequired: boolean = true, fieldLabel: string = 'Name'): string | null {
  if (!name || !String(name).trim()) {
    return isRequired ? `${fieldLabel} is required.` : null;
  }
  const clean = String(name).trim();
  if (clean.length < 2) {
    return `${fieldLabel} must be at least 2 characters long.`;
  }
  if (clean.length > 70) {
    return `${fieldLabel} must not exceed 70 characters.`;
  }
  const hasLetter = /[\p{L}]/u.test(clean);
  const validChars = /^[\p{L}\p{M}\s.'’\-]+$/u.test(clean);
  if (!hasLetter || !validChars) {
    return `${fieldLabel} contains invalid characters. Only letters, spaces, hyphens, and apostrophes are allowed.`;
  }
  return null;
}

// ==============================================================================
// 3. EMAIL VALIDATION & NORMALIZATION
// ==============================================================================
export function normalizeEmail(email?: string | null): string {
  return email ? String(email).trim().toLowerCase() : '';
}

export function validateEmail(email?: string | null, isRequired: boolean = true): string | null {
  if (!email || !String(email).trim()) {
    return isRequired ? 'Email address is required.' : null;
  }
  const clean = String(email).trim();
  if (clean.length > 100) {
    return 'Email address must not exceed 100 characters.';
  }
  if (/\s/.test(clean)) {
    return 'Email address must not contain spaces.';
  }
  const atParts = clean.split('@');
  if (atParts.length !== 2) {
    return 'Email address must contain exactly one "@" symbol.';
  }
  const [localPart, domainPart] = atParts;
  if (!localPart || !domainPart) {
    return 'Invalid email address structure.';
  }
  const domainParts = domainPart.split('.');
  if (domainParts.length < 2 || domainParts.some(p => !p)) {
    return 'Email domain is invalid or missing.';
  }
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2 || !/^[A-Za-z]{2,}$/.test(tld)) {
    return 'Email address must have a valid domain extension (e.g., .com, .in).';
  }
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(clean)) {
    return 'Please enter a valid email address (e.g., name@domain.com).';
  }
  return null;
}

// ==============================================================================
// 4. INDIAN MOBILE NUMBER VALIDATION
// ==============================================================================
export function cleanMobile(mobile?: string | null): string {
  if (!mobile) return '';
  let clean = String(mobile).trim().replace(/[\s\-()]/g, '');
  if (clean.startsWith('+91')) {
    clean = clean.slice(3);
  }
  return clean;
}

export function validateMobile(mobile?: string | null, isRequired: boolean = true, fieldLabel: string = 'Mobile phone'): string | null {
  if (!mobile || !String(mobile).trim()) {
    return isRequired ? `${fieldLabel} is required.` : null;
  }
  const clean = cleanMobile(mobile);
  if (!/^\d+$/.test(clean)) {
    return `${fieldLabel} must contain numeric digits only.`;
  }
  if (clean.length !== 10) {
    return `${fieldLabel} must be exactly 10 digits.`;
  }
  if (!/^[6-9]/.test(clean)) {
    return `${fieldLabel} must start with 6, 7, 8, or 9. Numbers starting with 0–5 are not permitted.`;
  }
  return null;
}

// ==============================================================================
// 5. PASSWORD VALIDATION
// ==============================================================================
export function validatePassword(password?: string | null, isRequired: boolean = true): string | null {
  if (!password) {
    return isRequired ? 'Password is required.' : null;
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter (A-Z).';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one numeric digit (0-9).';
  }
  if (!/[^A-Za-z0-9\s]/.test(password)) {
    return 'Password must contain at least one special character (e.g. @, #, $, !).';
  }
  return null;
}

export function validatePasswordMatch(password?: string | null, confirmPassword?: string | null): string | null {
  if (!confirmPassword) {
    return 'Please confirm your password.';
  }
  if (password !== confirmPassword) {
    return 'Password and Confirm Password do not match.';
  }
  return null;
}

// ==============================================================================
// 6. AADHAAR NUMBER VALIDATION
// ==============================================================================
export function cleanAadhaar(aadhaar?: string | number | null): string {
  if (aadhaar === null || aadhaar === undefined) return '';
  return String(aadhaar).trim().replace(/[\s-]/g, '');
}

export const cleanAadhar = cleanAadhaar;

export function validateAadhaar(aadhaar?: string | number | null, isRequired: boolean = false): string | null {
  if (aadhaar === null || aadhaar === undefined || (typeof aadhaar === 'string' && !aadhaar.trim())) {
    return isRequired ? 'Aadhaar number is required.' : null;
  }
  const clean = cleanAadhaar(aadhaar);
  if (!clean) {
    return isRequired ? 'Aadhaar number is required.' : null;
  }
  if (!/^\d+$/.test(clean)) {
    return 'Aadhaar number must contain numeric digits only.';
  }
  if (clean.length !== 12) {
    return 'Aadhaar number must be exactly 12 numeric digits.';
  }
  return null;
}

export const validateAadhar = validateAadhaar;

// ==============================================================================
// 7. PAN CARD VALIDATION
// ==============================================================================
export function cleanPan(pan?: string | null): string {
  return pan ? String(pan).trim().toUpperCase().replace(/\s/g, '') : '';
}

export function validatePan(pan?: string | null, isRequired: boolean = false): string | null {
  const clean = cleanPan(pan);
  if (!clean) {
    return isRequired ? 'PAN card number is required.' : null;
  }
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(clean)) {
    return 'PAN must be exactly 10 characters (5 uppercase letters, 4 digits, 1 letter, e.g. ABCDE1234F).';
  }
  return null;
}

// ==============================================================================
// 8. BANK ACCOUNT NUMBER VALIDATION
// ==============================================================================
export function cleanAccountNumber(acc?: string | null): string {
  return acc ? String(acc).trim().replace(/\s/g, '') : '';
}

export function validateAccountNumber(acc?: string | null, isRequired: boolean = true, bankNameOrCode?: string | null): string | null {
  const clean = cleanAccountNumber(acc);
  if (!clean) {
    return isRequired ? 'Account Number is required.' : null;
  }
  if (!/^\d+$/.test(clean)) {
    return 'Account Number must contain numeric digits only.';
  }
  const bankRule = resolveBankRule(bankNameOrCode);
  if (bankRule) {
    if (clean.length < bankRule.min || clean.length > bankRule.max) {
      const allowedStr = bankRule.min === bankRule.max ? `${bankRule.min}` : `${bankRule.min}–${bankRule.max}`;
      return `${bankRule.label} account number must be ${allowedStr} digits.`;
    }
  } else {
    if (clean.length < 9 || clean.length > 18) {
      return 'Account Number must contain between 9 and 18 digits.';
    }
  }
  return null;
}

export function validateAccountNumberMatch(acc?: string | null, confirmAcc?: string | null): string | null {
  if (!confirmAcc) {
    return 'Please confirm your account number.';
  }
  if (cleanAccountNumber(acc) !== cleanAccountNumber(confirmAcc)) {
    return 'Account Number and Confirm Account Number do not match.';
  }
  return null;
}

// ==============================================================================
// 9. IFSC CODE VALIDATION
// ==============================================================================
export function cleanIfsc(ifsc?: string | null): string {
  return ifsc ? String(ifsc).trim().toUpperCase().replace(/\s/g, '') : '';
}

export function validateIfsc(ifsc?: string | null, isRequired: boolean = true): string | null {
  const clean = cleanIfsc(ifsc);
  if (!clean) {
    return isRequired ? 'IFSC Code is required.' : null;
  }
  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(clean)) {
    return 'IFSC Code must be valid (e.g. SBIN0001234: 4 letters, 0, followed by 6 alphanumeric characters).';
  }
  return null;
}

// ==============================================================================
// 10. DATE OF BIRTH AND MINIMUM AGE (18+)
// ==============================================================================
export function calculateAge(dobDate: string | Date): number | null {
  const today = new Date();
  const birth = new Date(dobDate);
  if (isNaN(birth.getTime())) return null;

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function validateDob(dob?: string | null, minAge: number = 18, isRequired: boolean = true): string | null {
  if (!dob) {
    return isRequired ? 'Date of birth is required.' : null;
  }
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) {
    return 'Please enter a valid date of birth (YYYY-MM-DD).';
  }
  const today = new Date();
  if (birth > today) {
    return 'Date of birth cannot be in the future.';
  }
  const age = calculateAge(birth);
  if (age === null || age < minAge) {
    return `You must be at least ${minAge} years old to register.`;
  }
  return null;
}

export function getEighteenYearsAgoDateString(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split('T')[0];
}

// ==============================================================================
// 11. LOCATION NAME VALIDATION
// ==============================================================================
export function validateLocationName(val?: string | null, isRequired: boolean = true, fieldLabel: string = 'Location Name'): string | null {
  if (val === null || val === undefined || !String(val).trim()) {
    return isRequired ? `${fieldLabel} is required.` : null;
  }
  const clean = String(val).trim();
  if (clean.length < 2) {
    return `${fieldLabel} must be at least 2 characters long.`;
  }
  if (clean.length > 70) {
    return `${fieldLabel} must not exceed 70 characters.`;
  }
  if (/^\d+$/.test(clean) || !/[\p{L}]/u.test(clean)) {
    return `${fieldLabel} cannot be numeric-only. Please enter a valid location name.`;
  }
  const validChars = /^[\p{L}\p{M}\p{N}\s.'’\-,/()]+$/u.test(clean);
  if (!validChars) {
    return `${fieldLabel} contains invalid characters.`;
  }
  return null;
}

// ==============================================================================
// 12. INDIAN POSTAL PIN CODE VALIDATION (6 DIGITS)
// ==============================================================================
export function validatePincode(val?: string | null, isRequired: boolean = true): string | null {
  if (!val || (typeof val === 'string' && !val.trim())) {
    return isRequired ? 'PIN Code is required.' : null;
  }
  const clean = String(val).replace(/\D/g, '');
  if (!/^[1-9][0-9]{5}$/.test(clean)) {
    return 'Enter a valid 6-digit Indian PIN Code.';
  }
  return null;
}

