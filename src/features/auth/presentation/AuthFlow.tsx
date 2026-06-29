import { useCallback, useEffect, useState } from 'react';

import { AuthService } from '../application/AuthService';
import { DemoAuthRepository } from '../data/DemoAuthRepository';
import type {
  FaceCapture,
  ForgotPasswordInput,
  LoginInput,
  OtpChallenge,
  RegistrationInput,
} from '../domain/AuthModels';
import {
  FaceAlignmentPolicy,
  FaceRecognitionService,
} from '../domain/FaceRecognition';
import { AsyncAccountStorage } from '../infrastructure/AsyncAccountStorage';
import { DemoCameraFaceVerifier } from '../infrastructure/DemoCameraFaceVerifier';
import { ExpoBiometricAuthenticator } from '../infrastructure/ExpoBiometricAuthenticator';
import { ExpoFaceDetectorGateway } from '../infrastructure/ExpoFaceDetectorGateway';
import { NapasLoginScreen } from '../presentation/NapasLoginScreenView';
import { BiometricSelectionScreen } from './BiometricSelectionScreen';
import { FaceVerificationScreen } from './FaceVerificationScreen';
import { OtpVerificationScreen } from './OtpVerificationScreen';
import {
  ForgotPasswordScreen,
  ResetPasswordScreen,
} from './PasswordRecoveryScreens';
import { RegistrationScreen } from './RegistrationScreen';

type AuthRoute =
  | 'login'
  | 'registration'
  | 'forgot-password'
  | 'otp'
  | 'reset-password'
  | 'biometric'
  | 'face-camera';

export type AuthFlowProps = {
  onAuthenticated: () => void;
};

const authService = new AuthService(
  new DemoAuthRepository(),
  new AsyncAccountStorage(),
  new ExpoBiometricAuthenticator(),
  new DemoCameraFaceVerifier(),
);
const faceRecognitionService = new FaceRecognitionService(
  new ExpoFaceDetectorGateway(),
  new FaceAlignmentPolicy(),
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
  const authenticateFaceCapture = useCallback(
    async (capture: FaceCapture) => {
      await service.authenticateWithFaceCapture(capture);
      onAuthenticated();
    },
    [onAuthenticated, service],
  );
  const analyzeFace = useCallback(
    (capture: FaceCapture) => faceRecognitionService.analyze(capture),
    [],
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
          onFaceCamera={() => setRoute('face-camera')}
        />
      );
    case 'face-camera':
      return (
        <FaceVerificationScreen
          analyzeFace={analyzeFace}
          onBack={() => setRoute('biometric')}
          onVerified={authenticateFaceCapture}
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
