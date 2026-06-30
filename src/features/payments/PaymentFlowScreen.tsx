import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { getScreenBottomPadding } from '../../shared/layout';
import { colors } from '../../theme/colors';
import type { Receipt } from '../../types';
import { PaymentService } from './application/PaymentService';
import { InvoiceLookupStep } from './components/InvoiceLookupStep';
import { PaymentBenefitStep } from './components/PaymentBenefitStep';
import { PaymentConfirmStep } from './components/PaymentConfirmStep';
import { PaymentOtpSheet } from './components/PaymentOtpSheet';
import { DemoPaymentRepository } from './data/DemoPaymentRepository';
import type { PaymentInvoice } from './domain/PaymentModels';

type PaymentFlowScreenProps = {
  points: number;
  onBack: () => void;
  onComplete: (receipt: Receipt) => void;
};

type PaymentStep = 'lookup' | 'benefit' | 'confirm';

const DEFAULT_INVOICE_CODE = 'HD-WM-24062026';
const OTP_LENGTH = 6;

const paymentSteps: ReadonlyArray<{ id: PaymentStep; label: string }> = [
  { id: 'lookup', label: 'Tìm hóa đơn' },
  { id: 'benefit', label: 'Quyền lợi' },
  { id: 'confirm', label: 'Xác nhận' },
];

export function PaymentFlowScreen({ points, onBack, onComplete }: PaymentFlowScreenProps) {
  const insets = useSafeAreaInsets();
  const paymentService = useMemo(
    () => new PaymentService(new DemoPaymentRepository()),
    [],
  );

  const [step, setStep] = useState<PaymentStep>('lookup');
  const [invoiceCode, setInvoiceCode] = useState(DEFAULT_INVOICE_CODE);
  const [invoice, setInvoice] = useState<PaymentInvoice | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(null);
  const [selectedPoints, setSelectedPoints] = useState(0);
  const [otpVisible, setOtpVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const voucherOptions = useMemo(
    () => (invoice ? paymentService.getVoucherOptions(invoice) : []),
    [invoice, paymentService],
  );

  const benefit = useMemo(
    () =>
      invoice
        ? paymentService.calculateBenefit({
            invoice,
            pointsAvailable: points,
            requestedPoints: selectedPoints,
            voucherId: selectedVoucherId,
          })
        : null,
    [invoice, paymentService, points, selectedPoints, selectedVoucherId],
  );

  const processingChannel = useMemo(
    () => (invoice && benefit ? paymentService.getProcessingChannel(invoice, benefit) : null),
    [benefit, invoice, paymentService],
  );

  const pointOptions = useMemo(() => {
    if (!benefit) return [0];

    return [0, Math.floor(benefit.maxUsablePoints / 2), benefit.maxUsablePoints]
      .filter((value, index, values) => values.indexOf(value) === index)
      .map((value) => Math.max(0, value));
  }, [benefit]);

  useEffect(() => {
    if (!benefit || selectedPoints <= benefit.maxUsablePoints) return;
    setSelectedPoints(benefit.maxUsablePoints);
  }, [benefit, selectedPoints]);

  const activeStepIndex = paymentSteps.findIndex((item) => item.id === step);

  const resolveDefaultVoucherId = (nextInvoice: PaymentInvoice) =>
    paymentService.getVoucherOptions(nextInvoice).find((option) => option.eligibility.isEligible)
      ?.voucher.id ?? null;

  const selectInvoice = (nextInvoice: PaymentInvoice) => {
    setInvoice(nextInvoice);
    setInvoiceCode(nextInvoice.id);
    setLookupError(null);
    setSelectedVoucherId(resolveDefaultVoucherId(nextInvoice));
    setSelectedPoints(0);
    setStep('benefit');
  };

  const lookupManualInvoice = () => {
    const result = paymentService.lookupInvoice(invoiceCode);
    if (!result.invoice) {
      setLookupError(result.error);
      return;
    }

    selectInvoice(result.invoice);
  };

  const lookupQrInvoice = () => {
    selectInvoice(paymentService.getQrInvoice());
  };

  const lookupSuggestedInvoice = () => {
    selectInvoice(paymentService.getSuggestedInvoice());
  };

  const closeOtp = () => {
    if (processing) return;
    setOtpVisible(false);
    setOtp('');
    setOtpError(null);
  };

  const confirmOtp = () => {
    if (!invoice || !benefit || !processingChannel || processing) return;

    const result = paymentService.confirmPayment({
      invoice,
      benefit,
      processingChannel,
      otp,
    });

    if (!result.ok) {
      setOtp('');
      setOtpError(result.message);
      return;
    }

    setProcessing(true);
    setTimeout(() => {
      onComplete(result.receipt);
    }, 520);
  };

  const goPreviousStep = () => {
    if (step === 'lookup') {
      onBack();
      return;
    }

    setStep(step === 'confirm' ? 'benefit' : 'lookup');
  };

  return (
    <View style={styles.root}>
      <ScreenHeader onBack={goPreviousStep} rightLabel="Demo" title="Thanh toán Loyalty" />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: getScreenBottomPadding(insets.bottom) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <PaymentProgress activeIndex={activeStepIndex} />

        {step === 'lookup' ? (
          <InvoiceLookupStep
            invoiceCode={invoiceCode}
            lookupError={lookupError}
            points={points}
            onChangeInvoiceCode={setInvoiceCode}
            onLookup={lookupManualInvoice}
            onQrLookup={lookupQrInvoice}
            onUseSuggested={lookupSuggestedInvoice}
          />
        ) : null}

        {step === 'benefit' && invoice && benefit && processingChannel ? (
          <PaymentBenefitStep
            benefit={benefit}
            invoice={invoice}
            pointOptions={pointOptions}
            pointsAvailable={points}
            processingChannel={processingChannel}
            selectedVoucherId={selectedVoucherId}
            voucherOptions={voucherOptions}
            onConfirm={() => setStep('confirm')}
            onSelectPoints={setSelectedPoints}
            onSelectVoucher={(voucherId) =>
              setSelectedVoucherId((current) => (current === voucherId ? null : voucherId))
            }
          />
        ) : null}

        {step === 'confirm' && invoice && benefit && processingChannel ? (
          <PaymentConfirmStep
            benefit={benefit}
            invoice={invoice}
            processingChannel={processingChannel}
            onBack={() => setStep('benefit')}
            onPay={() => {
              setOtpVisible(true);
              setOtp('');
              setOtpError(null);
            }}
          />
        ) : null}
      </ScrollView>

      <PaymentOtpSheet
        bottomInset={insets.bottom}
        error={otpError}
        otp={otp}
        processing={processing}
        visible={otpVisible}
        onChangeOtp={(value) => {
          setOtp(value.replace(/\D/g, '').slice(0, OTP_LENGTH));
          setOtpError(null);
        }}
        onClose={closeOtp}
        onConfirm={confirmOtp}
      />
    </View>
  );
}

function PaymentProgress({ activeIndex }: { activeIndex: number }) {
  return (
    <View style={styles.progressCard}>
      {paymentSteps.map((item, index) => {
        const active = index === activeIndex;
        const completed = index < activeIndex;

        return (
          <View key={item.id} style={styles.progressItem}>
            <View
              style={[
                styles.progressDot,
                active && styles.progressDotActive,
                completed && styles.progressDotDone,
              ]}
            >
              {completed ? (
                <Ionicons color={colors.white} name="checkmark" size={13} />
              ) : (
                <Text style={[styles.progressNumber, active && styles.progressNumberActive]}>
                  {index + 1}
                </Text>
              )}
            </View>
            <Text style={[styles.progressLabel, active && styles.progressLabelActive]}>
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18, paddingTop: 18 },
  progressCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 12,
  },
  progressItem: { flex: 1, alignItems: 'center' },
  progressDot: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
  },
  progressDotActive: { backgroundColor: colors.primary },
  progressDotDone: { backgroundColor: colors.success },
  progressNumber: { color: colors.primary, fontSize: 11, fontWeight: '900' },
  progressNumberActive: { color: colors.white },
  progressLabel: { marginTop: 6, color: colors.textMuted, fontSize: 9, fontWeight: '800' },
  progressLabelActive: { color: colors.primary },
});
