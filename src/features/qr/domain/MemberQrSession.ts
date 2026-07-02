export type MemberQrPayload = {
  type: 'LOYALTY_MEMBER';
  loyaltyId: string;
  nonce: string;
  issuedAt: string;
  expiresAt: string;
};

export class MemberQrSession {
  static readonly validitySeconds = 120;

  static createPayload(loyaltyId: string): MemberQrPayload {
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + MemberQrSession.validitySeconds * 1000);

    return {
      type: 'LOYALTY_MEMBER',
      loyaltyId,
      nonce: MemberQrSession.createNonce(),
      issuedAt: issuedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };
  }

  static formatCountdown(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  private static createNonce() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
  }
}
