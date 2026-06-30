import type { Receipt } from '../../types';
import { PaymentFlowScreen } from './PaymentFlowScreen';

type PaymentScreenProps = {
  points: number;
  onBack: () => void;
  onComplete: (receipt: Receipt) => void;
};

export function PaymentScreen(props: PaymentScreenProps) {
  return <PaymentFlowScreen {...props} />;
}
