import type { FaceCapture } from './AuthModels';

export type DetectedFaceGeometry = {
  originX: number;
  originY: number;
  width: number;
  height: number;
  yawAngle: number;
  rollAngle: number;
};

export type FaceDetectionFrame = {
  width: number;
  height: number;
  faces: DetectedFaceGeometry[];
};

export type FaceAlignmentCode =
  | 'no-face'
  | 'multiple-faces'
  | 'too-far'
  | 'off-center'
  | 'not-straight'
  | 'ready';

export type FaceAlignmentResult = {
  code: FaceAlignmentCode;
  message: string;
  isReady: boolean;
};

export interface FaceDetectorGateway {
  detect(capture: FaceCapture): Promise<FaceDetectionFrame>;
}

export type FaceAlignmentPolicyOptions = {
  minimumWidthRatio?: number;
  minimumHeightRatio?: number;
  maximumCenterOffsetRatio?: number;
  maximumYawAngle?: number;
  maximumRollAngle?: number;
};

/** Các ngưỡng nhận diện được gom tại đây để dễ tinh chỉnh theo thiết bị thực tế. */
export class FaceAlignmentPolicy {
  private readonly minimumWidthRatio: number;
  private readonly minimumHeightRatio: number;
  private readonly maximumCenterOffsetRatio: number;
  private readonly maximumYawAngle: number;
  private readonly maximumRollAngle: number;

  constructor(options: FaceAlignmentPolicyOptions = {}) {
    this.minimumWidthRatio = options.minimumWidthRatio ?? 0.3;
    this.minimumHeightRatio = options.minimumHeightRatio ?? 0.3;
    this.maximumCenterOffsetRatio = options.maximumCenterOffsetRatio ?? 0.16;
    this.maximumYawAngle = options.maximumYawAngle ?? 13;
    this.maximumRollAngle = options.maximumRollAngle ?? 10;
  }

  evaluate(frame: FaceDetectionFrame): FaceAlignmentResult {
    if (!frame.faces.length) {
      return this.result('no-face', 'Đưa khuôn mặt vào trong khung');
    }
    if (frame.faces.length > 1) {
      return this.result('multiple-faces', 'Chỉ để một khuôn mặt trong khung');
    }

    const face = frame.faces[0]!;
    const widthRatio = face.width / frame.width;
    const heightRatio = face.height / frame.height;
    if (widthRatio < this.minimumWidthRatio || heightRatio < this.minimumHeightRatio) {
      return this.result('too-far', 'Đưa khuôn mặt lại gần hơn');
    }

    const faceCenterX = face.originX + face.width / 2;
    const faceCenterY = face.originY + face.height / 2;
    const offsetX = Math.abs(faceCenterX - frame.width / 2) / frame.width;
    const offsetY = Math.abs(faceCenterY - frame.height / 2) / frame.height;
    if (
      offsetX > this.maximumCenterOffsetRatio ||
      offsetY > this.maximumCenterOffsetRatio
    ) {
      return this.result('off-center', 'Căn khuôn mặt vào giữa khung');
    }

    if (
      Math.abs(face.yawAngle) > this.maximumYawAngle ||
      Math.abs(face.rollAngle) > this.maximumRollAngle
    ) {
      return this.result('not-straight', 'Giữ mặt thẳng và nhìn vào camera');
    }

    return this.result(
      'ready',
      'Mặt bạn đã thẳng, đang tiến hành nhận dạng',
      true,
    );
  }

  private result(
    code: FaceAlignmentCode,
    message: string,
    isReady = false,
  ): FaceAlignmentResult {
    return { code, message, isReady };
  }
}

export class FaceRecognitionService {
  constructor(
    private readonly detector: FaceDetectorGateway,
    private readonly policy: FaceAlignmentPolicy,
  ) {}

  async analyze(capture: FaceCapture): Promise<FaceAlignmentResult> {
    return this.policy.evaluate(await this.detector.detect(capture));
  }
}
