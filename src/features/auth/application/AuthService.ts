import {
  AuthError,
  type AccountStorage,
  type AuthRepository,
  type AuthUser,
  type BiometricAuthenticator,
  type BiometricCapabilities,
  type BiometricKind,
  type ForgotPasswordInput,
  type LoginInput,
  type OtpChallenge,
  type RegistrationInput,
} from '../domain/AuthModels';

export const DEMO_OTP = '123749';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\d{9,11}$/;

export class AuthService {
  private pendingRegistration: RegistrationInput | null = null;
  private pendingResetUserId: string | null = null;
  private currentChallenge: OtpChallenge | null = null;

  constructor(
    private readonly repository: AuthRepository,
    private readonly storage: AccountStorage,
    private readonly biometric: BiometricAuthenticator,
  ) {}

  getRememberedIdentifier(): Promise<string | null> {
    return this.storage.getIdentifier();
  }

  async login(input: LoginInput): Promise<AuthUser> {
    const identifier = input.identifier.trim();
    if (!identifier) throw new AuthError('Vui lòng nhập số điện thoại, email hoặc mã CIF.');
    if (input.password.length < 6) throw new AuthError('Mật khẩu phải có ít nhất 6 ký tự.');

    const user = await this.repository.authenticate(identifier, input.password);
    if (!user) throw new AuthError('Tài khoản hoặc mật khẩu không chính xác.');

    if (input.rememberIdentifier) await this.storage.saveIdentifier(identifier);
    else await this.storage.clearIdentifier();
    return user;
  }

  async beginRegistration(input: RegistrationInput): Promise<OtpChallenge> {
    this.validateRegistration(input);
    if (await this.repository.identifierExists(input.phone)) {
      throw new AuthError('Số điện thoại đã được đăng ký.');
    }
    if (await this.repository.identifierExists(input.email)) {
      throw new AuthError('Email đã được đăng ký.');
    }
    if (await this.repository.identifierExists(input.clientCode)) {
      throw new AuthError('Mã CIF đã được sử dụng.');
    }

    this.pendingRegistration = { ...input };
    this.pendingResetUserId = null;
    return this.createChallenge('registration', input.phone);
  }

  async beginPasswordReset(input: ForgotPasswordInput): Promise<OtpChallenge> {
    const phone = input.phone.replace(/\s/g, '');
    if (!phonePattern.test(phone)) throw new AuthError('Số điện thoại không hợp lệ.');
    if (input.clientCode.trim().length < 3) throw new AuthError('Vui lòng nhập đúng mã CIF/khách hàng.');

    const user = await this.repository.findForPasswordReset(phone, input.clientCode);
    if (!user) throw new AuthError('Không tìm thấy tài khoản phù hợp.');

    this.pendingRegistration = null;
    this.pendingResetUserId = user.id;
    return this.createChallenge('password-reset', phone);
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
    if (!this.pendingResetUserId) throw new AuthError('Yêu cầu đặt lại mật khẩu không còn hiệu lực.');
    if (password.length < 6) throw new AuthError('Mật khẩu mới phải có ít nhất 6 ký tự.');
    if (password !== confirmPassword) throw new AuthError('Mật khẩu nhập lại không khớp.');

    await this.repository.updatePassword(this.pendingResetUserId, password);
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

  private createChallenge(purpose: OtpChallenge['purpose'], phone: string): OtpChallenge {
    const digits = phone.replace(/\D/g, '');
    const destination = digits.length > 3 ? `***** **${digits.slice(-3)}` : phone;
    this.currentChallenge = { purpose, destination };
    return { ...this.currentChallenge };
  }

  private validateRegistration(input: RegistrationInput) {
    if (input.fullName.trim().length < 2) throw new AuthError('Vui lòng nhập họ và tên.');
    if (!phonePattern.test(input.phone.replace(/\s/g, ''))) throw new AuthError('Số điện thoại không hợp lệ.');
    if (!emailPattern.test(input.email.trim())) throw new AuthError('Email không hợp lệ.');
    if (input.clientCode.trim().length < 3) throw new AuthError('Mã CIF/khách hàng phải có ít nhất 3 ký tự.');
    if (input.password.length < 6) throw new AuthError('Mật khẩu phải có ít nhất 6 ký tự.');
    if (input.password !== input.confirmPassword) throw new AuthError('Mật khẩu nhập lại không khớp.');
    if (!input.acceptedTerms) throw new AuthError('Bạn cần đồng ý với điều khoản và chính sách.');
  }
}
