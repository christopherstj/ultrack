import { ErrorDetail } from '@ultrack/libs';

const EMAIL_REGEX =
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const validateNewUser = (
  email: string,
  password: string,
  confirmPassword: string,
): ErrorDetail[] => {
  const errors: ErrorDetail[] = [];

  if (!email) {
    errors.push({
      field: 'email',
      message: 'Email is required',
    });
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push({
      field: 'email',
      message: 'Email is invalid',
    });
  }

  if (!password) {
    errors.push({
      field: 'password',
      message: 'Password is required',
    });
  } else if (!PASSWORD_REGEX.test(password)) {
    errors.push({
      field: 'password',
      message:
        'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number and one special character',
    });
  }

  if (!confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: 'Confirm Password is required',
    });
  } else if (password !== confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: 'Passwords do not match',
    });
  }

  return errors;
};
