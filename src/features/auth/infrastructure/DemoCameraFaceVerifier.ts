import {
  AuthError,
  type FaceCapture,
  type FaceVerifier,
} from '../domain/AuthModels';

/**
 * Bộ xác minh dành cho prototype front-end.
 * Chỉ kiểm tra camera đã tạo được một khung hình hợp lệ và không lưu ảnh.
 * Bản production có thể thay lớp này bằng adapter gọi Face Matching/Liveness API.
 */
export class DemoCameraFaceVerifier implements FaceVerifier {
  async verify(capture: FaceCapture): Promise<void> {
    if (!capture.uri || capture.width < 100 || capture.height < 100) {
      throw new AuthError('Không nhận được hình ảnh khuôn mặt hợp lệ. Vui lòng thử lại.');
    }
  }
}
