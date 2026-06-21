import type { FaceCapture } from '../domain/AuthModels';
import type {
  FaceDetectionFrame,
  FaceDetectorGateway,
} from '../domain/FaceRecognition';

export class ExpoFaceDetectorGateway implements FaceDetectorGateway {
  async detect(capture: FaceCapture): Promise<FaceDetectionFrame> {
    const detector = await import('expo-face-detector');
    const result = await detector.detectFacesAsync(capture.uri, {
      mode: detector.FaceDetectorMode.fast,
      detectLandmarks: detector.FaceDetectorLandmarks.none,
      runClassifications: detector.FaceDetectorClassifications.none,
    });

    return {
      width: result.image.width || capture.width,
      height: result.image.height || capture.height,
      faces: result.faces.map((face) => ({
        originX: face.bounds.origin.x,
        originY: face.bounds.origin.y,
        width: face.bounds.size.width,
        height: face.bounds.size.height,
        yawAngle: face.yawAngle ?? 0,
        rollAngle: face.rollAngle ?? 0,
      })),
    };
  }
}
