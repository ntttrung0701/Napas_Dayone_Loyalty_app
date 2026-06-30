export class PaymentOtpVerifier {
  constructor(private readonly expectedOtp = '123456') {}

  verify(value: string) {
    if (value === this.expectedOtp) {
      return {
        success: true,
        message: 'OTP hợp lệ.',
      };
    }

    return {
      success: false,
      message: 'Mã OTP không chính xác. Gợi ý demo: 123456.',
    };
  }
}
