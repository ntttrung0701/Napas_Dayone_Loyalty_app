import {
  AuthError,
  type ForgotPasswordInput,
  type LoginInput,
  type RegistrationInput,
} from './AuthModels';

export const PASSWORD_RULE_HINT =
  'Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt';

const VIETNAM_MOBILE_PHONE_PATTERN = /^(03|05|07|08|09)\d{8}$/;
const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const CLIENT_CODE_PATTERN = /^[A-Za-z0-9]{3,20}$/;
const FULL_NAME_PATTERN = /^[A-Za-zÀ-ỹ\s]+$/;

export class FullName {
  static normalize(value: string) {
    return value.trim().replace(/\s+/g, ' ');
  }

  static validate(value: string) {
    const normalized = this.normalize(value);

    if (normalized.length < 2) {
      throw new AuthError('Vui lòng nhập họ và tên.');
    }

    if (!FULL_NAME_PATTERN.test(normalized)) {
      throw new AuthError('Họ tên chỉ được chứa chữ cái và khoảng trắng.');
    }

    return normalized;
  }
}

export class VietnamesePhoneNumber {
  static toCanonical(value: string) {
    const compact = value.replace(/[\s.-]/g, '');

    if (compact.startsWith('+84')) {
      return `0${compact.slice(3)}`;
    }

    if (compact.startsWith('84')) {
      return `0${compact.slice(2)}`;
    }

    return compact;
  }

  static isValid(value: string) {
    return VIETNAM_MOBILE_PHONE_PATTERN.test(this.toCanonical(value));
  }

  static validate(value: string) {
    const normalized = this.toCanonical(value);

    if (!normalized) {
      throw new AuthError('Vui lòng nhập số điện thoại.');
    }

    if (!VIETNAM_MOBILE_PHONE_PATTERN.test(normalized)) {
      throw new AuthError('Số điện thoại không đúng định dạng di động Việt Nam.');
    }

    return normalized;
  }
}

export class EmailAddress {
  static normalize(value: string) {
    return value.trim().toLowerCase();
  }

  static validate(value: string) {
    const normalized = this.normalize(value);

    if (!normalized) {
      throw new AuthError('Vui lòng nhập email.');
    }

    if (!EMAIL_PATTERN.test(normalized)) {
      throw new AuthError('Email không đúng định dạng.');
    }

    return normalized;
  }
}

export class ClientCode {
  static normalize(value: string) {
    return value.trim().toUpperCase();
  }

  static validate(value: string) {
    const normalized = this.normalize(value);

    if (!normalized) {
      throw new AuthError('Vui lòng nhập mã CIF/khách hàng.');
    }

    if (!CLIENT_CODE_PATTERN.test(normalized)) {
      throw new AuthError('Mã CIF chỉ gồm chữ và số, từ 3 đến 20 ký tự.');
    }

    return normalized;
  }
}

export class PasswordPolicy {
  static validate(value: string) {
    if (!value) {
      throw new AuthError('Vui lòng nhập mật khẩu.');
    }

    if (value.length < 8) {
      throw new AuthError('Mật khẩu phải có ít nhất 8 ký tự.');
    }

    if (!/[a-z]/.test(value)) {
      throw new AuthError('Mật khẩu cần có ít nhất 1 chữ thường.');
    }

    if (!/[A-Z]/.test(value)) {
      throw new AuthError('Mật khẩu cần có ít nhất 1 chữ hoa.');
    }

    if (!/\d/.test(value)) {
      throw new AuthError('Mật khẩu cần có ít nhất 1 chữ số.');
    }

    if (!/[^A-Za-z0-9]/.test(value)) {
      throw new AuthError('Mật khẩu cần có ít nhất 1 ký tự đặc biệt.');
    }

    return value;
  }

  static validateConfirmation(password: string, confirmPassword: string) {
    if (password !== confirmPassword) {
      throw new AuthError('Mật khẩu nhập lại không khớp.');
    }
  }
}

export class LoginIdentifier {
  static normalize(value: string) {
    const trimmed = value.trim();

    if (!trimmed) {
      throw new AuthError('Vui lòng nhập số điện thoại, email hoặc mã CIF.');
    }

    if (trimmed.includes('@')) {
      return EmailAddress.validate(trimmed);
    }

    const canonicalPhone = VietnamesePhoneNumber.toCanonical(trimmed);

    if (VietnamesePhoneNumber.isValid(canonicalPhone)) {
      return canonicalPhone;
    }

    return ClientCode.validate(trimmed);
  }
}

export class AuthValidator {
  static validateLogin(input: LoginInput): LoginInput {
    const identifier = LoginIdentifier.normalize(input.identifier);

    if (input.password.length < 8) {
      throw new AuthError('Mật khẩu phải có ít nhất 8 ký tự.');
    }

    return {
      ...input,
      identifier,
    };
  }

  static validateRegistration(input: RegistrationInput): RegistrationInput {
    const fullName = FullName.validate(input.fullName);
    const phone = VietnamesePhoneNumber.validate(input.phone);
    const email = EmailAddress.validate(input.email);
    const clientCode = ClientCode.validate(input.clientCode);
    const password = PasswordPolicy.validate(input.password);

    PasswordPolicy.validateConfirmation(password, input.confirmPassword);

    if (!input.acceptedTerms) {
      throw new AuthError('Bạn cần đồng ý với điều khoản và chính sách.');
    }

    return {
      ...input,
      fullName,
      phone,
      email,
      clientCode,
      password,
      confirmPassword: password,
    };
  }

  static validatePasswordResetRequest(input: ForgotPasswordInput): ForgotPasswordInput {
    return {
      phone: VietnamesePhoneNumber.validate(input.phone),
      clientCode: ClientCode.validate(input.clientCode),
    };
  }

  static validateNewPassword(password: string, confirmPassword: string) {
    const normalizedPassword = PasswordPolicy.validate(password);
    PasswordPolicy.validateConfirmation(normalizedPassword, confirmPassword);

    return normalizedPassword;
  }
}