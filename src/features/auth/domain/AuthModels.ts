export type AuthUser = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  clientCode: string;
};

export type LoginInput = {
  identifier: string;
  password: string;
  rememberIdentifier: boolean;
};

export type RegistrationInput = {
  fullName: string;
  phone: string;
  email: string;
  clientCode: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};

export type ForgotPasswordInput = {
  phone: string;
  clientCode: string;
};

export type OtpPurpose = 'registration' | 'password-reset';

export type OtpChallenge = {
  purpose: OtpPurpose;
  destination: string;
};

export type BiometricKind = 'face' | 'fingerprint';

export type BiometricCapabilities = {
  hasHardware: boolean;
  isEnrolled: boolean;
  face: boolean;
  fingerprint: boolean;
};

export interface AuthRepository {
  authenticate(identifier: string, password: string): Promise<AuthUser | null>;
  identifierExists(identifier: string): Promise<boolean>;
  createAccount(input: RegistrationInput): Promise<AuthUser>;
  findForPasswordReset(phone: string, clientCode: string): Promise<AuthUser | null>;
  updatePassword(userId: string, password: string): Promise<void>;
}

export interface AccountStorage {
  getIdentifier(): Promise<string | null>;
  saveIdentifier(identifier: string): Promise<void>;
  clearIdentifier(): Promise<void>;
}

export interface BiometricAuthenticator {
  getCapabilities(): Promise<BiometricCapabilities>;
  authenticate(kind: BiometricKind): Promise<void>;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}
