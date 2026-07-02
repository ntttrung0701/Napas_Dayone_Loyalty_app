import type { BarcodeScanningResult } from 'expo-camera';

export type QrScannerPurpose = 'general' | 'invoice' | 'loyalty-member';

export type QrScannerCopy = {
  title: string;
  instructionTitle: string;
  instructionDescription: string;
  helperTitle: string;
  helperDescription: string;
};

export type QrScanResult = {
  barcodeType: string;
  data: string;
  parsedData?: unknown;
  scannedAt: string;
};

const scannerCopyByPurpose: Record<QrScannerPurpose, QrScannerCopy> = {
  general: {
    title: 'Quét QR',
    instructionTitle: 'Đưa mã QR vào khung',
    instructionDescription: 'Quét mã QR được cung cấp bởi đối tác hoặc dịch vụ Loyalty.',
    helperTitle: 'Chỉ quét mã QR hợp lệ',
    helperDescription:
      'Sử dụng scanner này cho các mã QR trong hệ sinh thái Napas DayOne Loyalty.',
  },
  invoice: {
    title: 'Quét QR hóa đơn',
    instructionTitle: 'Đưa QR hóa đơn vào khung',
    instructionDescription: 'Quét mã từ POS hoặc Merchant để nhận thông tin hóa đơn.',
    helperTitle: 'Chỉ quét QR hóa đơn thanh toán',
    helperDescription:
      'Chỉ quét mã QR trên hóa đơn từ điểm chấp nhận thẻ POS hoặc đối tác liên kết của Napas.',
  },
  'loyalty-member': {
    title: 'Quét QR thành viên',
    instructionTitle: 'Đưa QR thành viên vào khung',
    instructionDescription: 'Quét mã Loyalty ID để nhận diện thành viên và áp dụng quyền lợi.',
    helperTitle: 'Chỉ quét QR Loyalty',
    helperDescription:
      'Mã QR cần thuộc hệ thống Loyalty để tích điểm, đổi điểm hoặc áp dụng ưu đãi.',
  },
};

export class QrScanSession {
  static getCopy(purpose: QrScannerPurpose): QrScannerCopy {
    return scannerCopyByPurpose[purpose];
  }

  static fromBarcode(result: BarcodeScanningResult): QrScanResult {
    return {
      barcodeType: result.type,
      data: result.data,
      parsedData: QrScanSession.tryParseJson(result.data),
      scannedAt: new Date().toISOString(),
    };
  }

  static formatPreview(result: QrScanResult): string {
    if (typeof result.parsedData === 'object' && result.parsedData !== null) {
      return JSON.stringify(result.parsedData, null, 2);
    }

    return result.data;
  }

  private static tryParseJson(value: string): unknown {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }
}
