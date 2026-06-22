import {
  AuthError,
  type AccountStorage,
  type AuthRepository,
  type AuthUser,
  type BiometricAuthenticator,
  type BiometricCapabilities,
  type BiometricKind,
  type ForgotPasswordInput,
  type FaceCapture,
  type FaceVerifier,
  type LoginInput,
  type OtpChallenge,
  type RegistrationInput,
} from '../domain/AuthModels';
import { AuthValidator } from '../domain/AuthValidation';


export const DEMO_OTP = '123749';



export class AuthService {
  private pendingRegistration: RegistrationInput | null = null;
  private pendingResetUserId: string | null = null;
  private currentChallenge: OtpChallenge | null = null;

  constructor(
    private readonly repository: AuthRepository,
    private readonly storage: AccountStorage,
    private readonly biometric: BiometricAuthenticator,
    private readonly faceVerifier: FaceVerifier,
  ) {}

  getRememberedIdentifier(): Promise<string | null> {
    return this.storage.getIdentifier();
  }

async login(input: LoginInput): Promise<AuthUser> {
  const validatedInput = AuthValidator.validateLogin(input);

  const user = await this.repository.authenticate(
    validatedInput.identifier,
    validatedInput.password,
  );

  if (!user) throw new AuthError('Tài khoản hoặc mật khẩu không chính xác.');

  if (validatedInput.rememberIdentifier) {
    await this.storage.saveIdentifier(validatedInput.identifier);
  } else {
    await this.storage.clearIdentifier();
  }

  return user;
}

  async beginRegistration(input: RegistrationInput): Promise<OtpChallenge> {
  const validatedInput = AuthValidator.validateRegistration(input);

  if (await this.repository.identifierExists(validatedInput.phone)) {
    throw new AuthError('Số điện thoại đã được đăng ký.');
  }

  if (await this.repository.identifierExists(validatedInput.email)) {
    throw new AuthError('Email đã được đăng ký.');
  }

  if (await this.repository.identifierExists(validatedInput.clientCode)) {
    throw new AuthError('Mã CIF đã được sử dụng.');
  }

  this.pendingRegistration = { ...validatedInput };
  this.pendingResetUserId = null;

  return this.createChallenge('registration', validatedInput.phone);
}

async beginPasswordReset(input: ForgotPasswordInput): Promise<OtpChallenge> {
  const validatedInput = AuthValidator.validatePasswordResetRequest(input);

  const user = await this.repository.findForPasswordReset(
    validatedInput.phone,
    validatedInput.clientCode,
  );

  if (!user) throw new AuthError('Không tìm thấy tài khoản phù hợp.');

  this.pendingRegistration = null;
  this.pendingResetUserId = user.id;

  return this.createChallenge('password-reset', validatedInput.phone);
}

  resendOtp(): OtpChallenge {
    if (!this.currentChallenge) throw new AuthError('Phiên xác thực OTP đã hết hạn.');
    return { ...this.currentChallenge };
  }

  async verifyOtp(code: string): Promise<AuthUser | null> {
    if (!this.currentChallenge) throw new AuthError('Phiên xác thực OTP đã hết hạn.');
    if (code.trim() !== DEMO_OTP) throw new AuthError('Mã OTP không chính xác. Mã demo là 123749.');

    if (this.currentChallenge.purpose === 'registration') {
      if (!this.pendingRegistration) throw new AuthError('Thông tin đăng ký không còn hiệu lực.');
      const user = await this.repository.createAccount(this.pendingRegistration);
      this.pendingRegistration = null;
      this.currentChallenge = null;
      return user;
    }

    if (!this.pendingResetUserId) throw new AuthError('Yêu cầu đặt lại mật khẩu không còn hiệu lực.');
    this.currentChallenge = null;
    return null;
  }

async resetPassword(password: string, confirmPassword: string): Promise<void> {
  if (!this.pendingResetUserId) {
    throw new AuthError('Yêu cầu đặt lại mật khẩu không còn hiệu lực.');
  }

  const validatedPassword = AuthValidator.validateNewPassword(password, confirmPassword);

  await this.repository.updatePassword(this.pendingResetUserId, validatedPassword);
  this.pendingResetUserId = null;
}

  getBiometricCapabilities(): Promise<BiometricCapabilities> {
    return this.biometric.getCapabilities();
  }

  async authenticateWithBiometric(kind: BiometricKind): Promise<void> {
    const linkedIdentifier = await this.storage.getIdentifier();
    if (!linkedIdentifier) {
      throw new AuthError('Hãy đăng nhập bằng mật khẩu và bật “Ghi nhớ tài khoản” trước khi dùng sinh trắc học.');
    }
    await this.biometric.authenticate(kind);
  }

  async authenticateWithFaceCapture(capture: FaceCapture): Promise<void> {
    const linkedIdentifier = await this.storage.getIdentifier();
    if (!linkedIdentifier) {
      throw new AuthError(
        'Hãy đăng nhập bằng mật khẩu và bật “Ghi nhớ tài khoản” trước khi dùng nhận diện khuôn mặt.',
      );
    }
    await this.faceVerifier.verify(capture);
  }

  private createChallenge(purpose: OtpChallenge['purpose'], phone: string): OtpChallenge {
    const digits = phone.replace(/\D/g, '');
    const destination = digits.length > 3 ? `***** **${digits.slice(-3)}` : phone;
    this.currentChallenge = { purpose, destination };
    return { ...this.currentChallenge };
  }

}
