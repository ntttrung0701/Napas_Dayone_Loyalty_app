export type AuthScreenPresentationOptions = {
  title?: string;
  subtitle?: string;
};

/**
 * Cấu hình hiển thị bất biến cho phần tiêu đề của một màn hình xác thực.
 * Bỏ title/subtitle khỏi options để ẩn phần tương ứng mà không sửa AuthShell.
 */
export class AuthScreenPresentation {
  static readonly empty = new AuthScreenPresentation();

  readonly title?: string;
  readonly subtitle?: string;

  constructor({ title, subtitle }: AuthScreenPresentationOptions = {}) {
    this.title = AuthScreenPresentation.normalize(title);
    this.subtitle = AuthScreenPresentation.normalize(subtitle);
  }

  get hasTitle(): boolean {
    return Boolean(this.title);
  }

  get hasSubtitle(): boolean {
    return Boolean(this.subtitle);
  }

  withTitle(title?: string): AuthScreenPresentation {
    return new AuthScreenPresentation({ title, subtitle: this.subtitle });
  }

  withSubtitle(subtitle?: string): AuthScreenPresentation {
    return new AuthScreenPresentation({ title: this.title, subtitle });
  }

  private static normalize(value?: string): string | undefined {
    const normalized = value?.trim();
    return normalized ? normalized : undefined;
  }
}

export const authScreenPresentations = Object.freeze({
  // Không khai báo title nên màn đăng nhập chỉ hiển thị subtitle.
  login: new AuthScreenPresentation({
    subtitle: 'Napas DayOne — Trải nghiệm tài chính hiện đại',
  }),
  registration: new AuthScreenPresentation({
    title: 'ĐĂNG KÝ',
    subtitle: 'Điền thông tin để tạo tài khoản Napas DayOne',
  }),
  forgotPassword: new AuthScreenPresentation({
    title: 'QUÊN MẬT KHẨU',
    subtitle: 'Xác minh thông tin để nhận mã đặt lại mật khẩu',
  }),
  resetPassword: new AuthScreenPresentation({
    title: 'ĐẶT LẠI MẬT KHẨU',
    subtitle: 'Tạo mật khẩu mới cho tài khoản của bạn',
  }),
  otp: new AuthScreenPresentation({
    title: 'XÁC THỰC OTP',
  }),
  biometric: new AuthScreenPresentation({
    title: 'SINH TRẮC HỌC',
    subtitle: 'Chọn phương thức đã thiết lập trên thiết bị',
  }),
});
