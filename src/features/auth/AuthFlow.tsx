import { useCallback, useEffect, useState } from 'react';

import { AuthService } from './application/AuthService';
import { DemoAuthRepository } from './data/DemoAuthRepository';
import type {
  ForgotPasswordInput,
  LoginInput,
  OtpChallenge,
  RegistrationInput,
} from './domain/AuthModels';
import { AsyncAccountStorage } from './infrastructure/AsyncAccountStorage';
import { ExpoBiometricAuthenticator } from './infrastructure/ExpoBiometricAuthenticator';
import { NapasLoginScreen } from './NapasLoginScreen';
import { BiometricSelectionScreen } from './presentation/BiometricSelectionScreen';
import { OtpVerificationScreen } from './presentation/OtpVerificationScreen';
import {
  ForgotPasswordScreen,
  ResetPasswordScreen,
} from './presentation/PasswordRecoveryScreens';
import { RegistrationScreen } from './presentation/RegistrationScreen';

type AuthRoute = 'login' | 'registration' | 'forgot-password' | 'otp' | 'reset-password' | 'biometric';

export type AuthFlowProps = {
  onAuthenticated: () => void;
};

const authService = new AuthService(
  new DemoAuthRepository(),
  new AsyncAccountStorage(),
  new ExpoBiometricAuthenticator(),
);

export function AuthFlow({ onAuthenticated }: AuthFlowProps) {
  const service = authService;
  const [route, setRoute] = useState<AuthRoute>('login');
  const [challenge, setChallenge] = useState<OtpChallenge | null>(null);
  const [rememberedIdentifier, setRememberedIdentifier] = useState('');
  const [loginMessage, setLoginMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    service.getRememberedIdentifier()
      .then((identifier) => { if (active && identifier) setRememberedIdentifier(identifier); })
      .catch(() => undefined);
    return () => { active = false; };
  }, [service]);

  const login = async (input: LoginInput) => {
    await service.login(input);
    onAuthenticated();
  };

  const register = async (input: RegistrationInput) => {
    setChallenge(await service.beginRegistration(input));
    setRoute('otp');
  };

  const forgotPassword = async (input: ForgotPasswordInput) => {
    setChallenge(await service.beginPasswordReset(input));
    setRoute('otp');
  };

  const verifyOtp = async (code: string) => {
    const user = await service.verifyOtp(code);
    if (challenge?.purpose === 'registration' && user) {
      onAuthenticated();
      return;
    }
    setRoute('reset-password');
  };

  const resetPassword = async (password: string, confirmPassword: string) => {
    await service.resetPassword(password, confirmPassword);
    setLoginMessage('Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.');
    setChallenge(null);
    setRoute('login');
  };

  const loadBiometricCapabilities = useCallback(
    () => service.getBiometricCapabilities(),
    [service],
  );
  const authenticateBiometric = useCallback(
    async (kind: 'face' | 'fingerprint') => {
      await service.authenticateWithBiometric(kind);
      onAuthenticated();
    },
    [onAuthenticated, service],
  );

  switch (route) {
    case 'registration':
      return <RegistrationScreen onBack={() => setRoute('login')} onSubmit={register} />;
    case 'forgot-password':
      return <ForgotPasswordScreen onBack={() => setRoute('login')} onSubmit={forgotPassword} />;
    case 'otp':
      if (!challenge) return null;
      return (
        <OtpVerificationScreen
          challenge={challenge}
          onBack={() => setRoute(challenge.purpose === 'registration' ? 'registration' : 'forgot-password')}
          onResend={() => { setChallenge(service.resendOtp()); }}
          onVerify={verifyOtp}
        />
      );
    case 'reset-password':
      return <ResetPasswordScreen onBack={() => setRoute('forgot-password')} onSubmit={resetPassword} />;
    case 'biometric':
      return (
        <BiometricSelectionScreen
          loadCapabilities={loadBiometricCapabilities}
          onAuthenticate={authenticateBiometric}
          onBack={() => setRoute('login')}
        />
      );
    case 'login':
    default:
      return (
        <NapasLoginScreen
          initialIdentifier={rememberedIdentifier}
          initialRemember={Boolean(rememberedIdentifier)}
          message={loginMessage}
          onBiometric={() => setRoute('biometric')}
          onCreateAccount={() => setRoute('registration')}
          onForgotPassword={() => setRoute('forgot-password')}
          onSubmit={login}
        />
      );
  }
}

export default AuthFlow;
