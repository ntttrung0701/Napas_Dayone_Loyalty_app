import * as LocalAuthentication from 'expo-local-authentication';

import {
  AuthError,
  type BiometricAuthenticator,
  type BiometricCapabilities,
  type BiometricKind,
} from '../domain/AuthModels';

export class ExpoBiometricAuthenticator implements BiometricAuthenticator {
  async getCapabilities(): Promise<BiometricCapabilities> {
    const [hasHardware, isEnrolled, supported] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ]);

    return {
      hasHardware,
      isEnrolled,
      face: supported.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION),
      fingerprint: supported.includes(LocalAuthentication.AuthenticationType.FINGERPRINT),
    };
  }

  async authenticate(kind: BiometricKind): Promise<void> {
    const capabilities = await this.getCapabilities();
    if (!capabilities.hasHardware) {
      throw new AuthError('Thiết bị không hỗ trợ xác thực sinh trắc học.');
    }
    if (!capabilities.isEnrolled) {
      throw new AuthError('Bạn chưa thiết lập sinh trắc học trong cài đặt thiết bị.');
    }
    if (kind === 'face' && !capabilities.face) {
      throw new AuthError('Thiết bị không hỗ trợ nhận diện khuôn mặt.');
    }
    if (kind === 'fingerprint' && !capabilities.fingerprint) {
      throw new AuthError('Thiết bị không hỗ trợ vân tay.');
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: kind === 'face' ? 'Xác thực bằng khuôn mặt' : 'Xác thực bằng vân tay',
      cancelLabel: 'Hủy',
      fallbackLabel: 'Dùng mật mã thiết bị',
      disableDeviceFallback: false,
    });

    if (!result.success) {
      throw new AuthError(result.error === 'user_cancel' ? 'Bạn đã hủy xác thực.' : 'Xác thực không thành công.');
    }
  }
}
