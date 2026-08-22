import {
  validateEmail,
  validatePassword,
  getPasswordStrength,
  validateName,
  validateConfirmPassword,
  validateRole,
  validateTerms,
} from './src/utils/validators.ts';

const runTests = () => {
  console.log('--- Running CamTrust Validator Tests ---');
  let failures = 0;

  const assert = (condition, msg) => {
    if (!condition) {
      console.error(`❌ FAILED: ${msg}`);
      failures++;
    } else {
      console.log(`✅ PASSED: ${msg}`);
    }
  };

  // 1. Email tests
  assert(validateEmail('alex@gmail.com').isValid === true, 'alex@gmail.com is valid');
  assert(validateEmail('user@example.com').isValid === true, 'user@example.com is valid');
  assert(validateEmail('alexgmail.com').isValid === false, 'alexgmail.com is invalid');
  assert(validateEmail('alex@').isValid === false, 'alex@ is invalid');
  assert(validateEmail('@example.com').isValid === false, '@example.com is invalid');
  assert(validateEmail('').isValid === false, 'empty email is invalid');
  assert(validateEmail('alex@gmail.com').error === null, 'no error on valid email');
  assert(validateEmail('alexgmail.com').error === 'Please enter a valid email address.', 'proper error message on invalid email');

  // 2. Password tests
  assert(validatePassword('1234567').isValid === false, 'password < 8 chars invalid');
  assert(validatePassword('12345678').isValid === true, 'password >= 8 chars valid');
  assert(validatePassword('1234567').error === 'Password must contain at least 8 characters.', 'password error msg');

  // 3. Password Strength tests
  assert(getPasswordStrength('weak').label === 'Weak', 'short password is Weak');
  assert(getPasswordStrength('Password1').label === 'Medium', 'Medium password');
  assert(getPasswordStrength('Password123!').label === 'Strong', 'Strong password');

  // 4. Name tests
  assert(validateName('A').isValid === false, 'single char name invalid');
  assert(validateName('Alex Rivera').isValid === true, 'full name valid');
  assert(validateName('').error === 'Please enter your full name.', 'name error msg');

  // 5. Confirm password
  assert(validateConfirmPassword('pass1234', 'pass1234').isValid === true, 'matching passwords valid');
  assert(validateConfirmPassword('pass1234', 'pass9999').isValid === false, 'mismatch invalid');
  assert(validateConfirmPassword('pass1234', 'pass9999').error === 'Passwords do not match.', 'confirm error msg');

  // 6. Role tests
  assert(validateRole('property_owner').isValid === true, 'property_owner role valid');
  assert(validateRole('professional').isValid === true, 'professional role valid');
  assert(validateRole('administrator').isValid === true, 'administrator role valid');
  assert(validateRole('invalid_role').isValid === false, 'random role invalid');

  // 7. Terms test
  assert(validateTerms(true).isValid === true, 'accepted terms valid');
  assert(validateTerms(false).isValid === false, 'unaccepted terms invalid');
  assert(validateTerms(false).error === 'You must accept the Terms and Conditions.', 'terms error msg');

  if (failures === 0) {
    console.log('\n🎉 ALL VALIDATOR TESTS PASSED SUCCESSFULLY!');
  } else {
    console.error(`\n⚠️ ${failures} tests failed!`);
    process.exit(1);
  }
};

runTests();
