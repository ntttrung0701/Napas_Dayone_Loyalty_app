import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../shared/components/PrimaryButton';
import { ScreenHeader } from '../../shared/components/ScreenHeader';
import { getScreenBottomPadding } from '../../shared/layout';
import { colors } from '../../theme/colors';
import type { Receipt } from '../../types';
import { formatCurrency, formatPoints } from '../../utils/format';

type PaymentFlowScreenProps = {
  points: number;
  onBack: () => void;
  onComplete: (receipt: Receipt) => void;
};

type IconName = ComponentProps<typeof Ionicons>['name'];
type PaymentStep = 'lookup' | 'setup' | 'confirm';
type PaymentMethodId = 'napas-card' | 'dayone-wallet';
type InvoiceSource = 'manual' | 'qr-demo' | 'suggested';

type LoyaltyPaymentInvoice = {
  id: string;
  amount: number;
  category: string;
  channel: 'POS' | 'QR' | 'Ecom';
  customerNote: string;
  dueLabel: string;
  merchant: string;
  source: InvoiceSource;
  terminal: string;
};

type LoyaltyPaymentVoucher = {
  id: string;
  description: string;
  discountRate: number;
  expiresLabel: string;
  maxDiscount: number;
  title: string;
};

type LinkedPaymentMethod = {
  id: PaymentMethodId;
  accent: string;
  background: string;
  description: string;
  icon: IconName;
  maskedAccount: string;
  name: string;
};

type PaymentConfiguration = {
  method: LinkedPaymentMethod;
  pointsRequested: number;
  voucher: LoyaltyPaymentVoucher | null;
};

const DEMO_OTP = '123456';
const OTP_LENGTH = 6;
const POINT_TO_VND_RATE = 1;
const MAX_POINTS_PER_PAYMENT = 80_000;
const DEFAULT_INVOICE_CODE = 'HD-WM-24062026';

const mockInvoices: LoyaltyPaymentInvoice[] = [
  {
    id: DEFAULT_INVOICE_CODE,
    amount: 450_000,
    category: 'Mua sắm',
    channel: 'POS',
    customerNote: 'Hóa đơn mua sắm tại quầy thu ngân',
    dueLabel: 'Thanh toán trong ngày',
    merchant: 'WinMart Landmark 81',
    source: 'suggested',
    terminal: 'POS-NPS-8839',
  },
  {
    id: 'QR-CGV-26062026',
    amount: 286_000,
    category: 'Giải trí',
    channel: 'QR',
    customerNote: 'Mã QR hóa đơn tại quầy CGV',
    dueLabel: 'QR còn hiệu lực 05:00',
    merchant: 'CGV Vincom Center',
    source: 'qr-demo',
    terminal: 'QR-NPS-1028',
  },
  {
    id: 'ECOM-HL-26062026',
    amount: 125_000,
    category: 'Ẩm thực',
    channel: 'Ecom',
    customerNote: 'Đơn hàng online Highlands Coffee',
    dueLabel: 'Chờ thanh toán',
    merchant: 'Highlands Coffee Online',
    source: 'manual',
    terminal: 'ECOM-NPS-7712',
  },
];

const mockVouchers: LoyaltyPaymentVoucher[] = [
  {
    id: 'voucher-gold-10',
    description: 'Áp dụng cho hóa đơn từ 200.000đ tại merchant tham gia Loyalty.',
    discountRate: 0.1,
    expiresLabel: '31/12/2026',
    maxDiscount: 50_000,
    title: 'Hoàn 10% cho Hạng Vàng',
  },
  {
    id: 'voucher-weekend-5',
    description: 'Ưu đãi cuối tuần, không áp dụng đồng thời với hoàn tiền ngân hàng.',
    discountRate: 0.05,
    expiresLabel: '30/09/2026',
    maxDiscount: 25_000,
    title: 'Giảm 5% cuối tuần',
  },
];

const linkedPaymentMethods: LinkedPaymentMethod[] = [
  {
    id: 'napas-card',
    accent: colors.primary,
    background: colors.primarySoft,
    description: 'Phương thức mặc định',
    icon: 'card-outline',
    maskedAccount: 'Vietcombank •••• 8839',
    name: 'Napas Debit',
  },
  {
    id: 'dayone-wallet',
    accent: colors.purple,
    background: '#F1EFFF',
    description: 'Thanh toán phần tiền còn lại',
    icon: 'wallet-outline',
    maskedAccount: 'Ví điện tử đã liên kết',
    name: 'Ví DayOne',
  },
];

const paymentSteps: ReadonlyArray<{ id: PaymentStep; label: string }> = [
  { id: 'lookup', label: 'Tìm hóa đơn' },
  { id: 'setup', label: 'Thiết lập' },
  { id: 'confirm', label: 'Xác nhận' },
];

class PaymentInvoiceCatalog {
  constructor(private readonly invoices: LoyaltyPaymentInvoice[]) {}

  findByCode(code: string): LoyaltyPaymentInvoice | null {
    const normalized = code.trim().toUpperCase();
    return this.invoices.find((invoice) => invoice.id === normalized) ?? null;
  }

  get suggestedInvoice() {
    return this.invoices[0]!;
  }

  get qrInvoice() {
    return this.invoices.find((invoice) => invoice.source === 'qr-demo') ?? this.suggestedInvoice;
  }
}

class LoyaltyPaymentCalculator {
  constructor(
    private readonly invoice: LoyaltyPaymentInvoice,
    private readonly config: PaymentConfiguration,
  ) {}

  get voucherDiscount() {
    if (!this.config.voucher) return 0;
    return Math.min(
      Math.round(this.invoice.amount * this.config.voucher.discountRate),
      this.config.voucher.maxDiscount,
      this.invoice.amount,
    );
  }

  maxUsablePoints(pointsBalance: number) {
    return Math.min(
      pointsBalance,
      MAX_POINTS_PER_PAYMENT,
      Math.max(0, this.invoice.amount - this.voucherDiscount),
    );
  }

  pointsUsed(pointsBalance: number) {
    return Math.min(this.config.pointsRequested, this.maxUsablePoints(pointsBalance));
  }

  pointDiscount(pointsBalance: number) {
    return this.pointsUsed(pointsBalance) * POINT_TO_VND_RATE;
  }

  cashAmount(pointsBalance: number) {
    return Math.max(
      0,
      this.invoice.amount - this.voucherDiscount - this.pointDiscount(pointsBalance),
    );
  }

  earnedPoints(pointsBalance: number) {
    return Math.floor(this.cashAmount(pointsBalance) / 10_000);
  }
}

class PaymentOtpVerifier {
  constructor(private readonly expectedOtp = DEMO_OTP) {}

  verify(value: string) {
    return value === this.expectedOtp;
  }
}

class LoyaltyPaymentReceiptFactory {
  static create({
    calculator,
    invoice,
    pointsBalance,
  }: {
    calculator: LoyaltyPaymentCalculator;
    invoice: LoyaltyPaymentInvoice;
    pointsBalance: number;
  }): Receipt {
    const createdAt = new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date());

    return {
      id: `NPS-PM-${Date.now().toString().slice(-6)}`,
      kind: 'payment',
      merchant: invoice.merchant,
      title: `Thanh toán ${invoice.channel} - ${invoice.id}`,
      originalAmount: invoice.amount,
      voucherDiscount: calculator.voucherDiscount,
      pointsUsed: calculator.pointsUsed(pointsBalance),
      cashAmount: calculator.cashAmount(pointsBalance),
      createdAt,
    };
  }
}

export function PaymentFlowScreen({ points, onBack, onComplete }: PaymentFlowScreenProps) {
  const insets = useSafeAreaInsets();
  const catalog = useMemo(() => new PaymentInvoiceCatalog(mockInvoices), []);
  const otpVerifier = useMemo(() => new PaymentOtpVerifier(), []);

  const [step, setStep] = useState<PaymentStep>('lookup');
  const [invoiceCode, setInvoiceCode] = useState(DEFAULT_INVOICE_CODE);
  const [invoice, setInvoice] = useState<LoyaltyPaymentInvoice | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState<PaymentMethodId>('napas-card');
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(mockVouchers[0]?.id ?? null);
  const [selectedPoints, setSelectedPoints] = useState(Math.min(points, 50_000));
  const [otpVisible, setOtpVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const selectedMethod =
    linkedPaymentMethods.find((method) => method.id === selectedMethodId) ?? linkedPaymentMethods[0]!;
  const selectedVoucher = mockVouchers.find((voucher) => voucher.id === selectedVoucherId) ?? null;
  const config = useMemo<PaymentConfiguration>(
    () => ({
      method: selectedMethod,
      pointsRequested: selectedPoints,
      voucher: selectedVoucher,
    }),
    [selectedMethod, selectedPoints, selectedVoucher],
  );
  const calculator = useMemo(
    () => (invoice ? new LoyaltyPaymentCalculator(invoice, config) : null),
    [config, invoice],
  );
  const maxUsablePoints = calculator?.maxUsablePoints(points) ?? 0;
  const pointsUsed = calculator?.pointsUsed(points) ?? 0;
  const cashAmount = calculator?.cashAmount(points) ?? 0;
  const earnedPoints = calculator?.earnedPoints(points) ?? 0;

  const pointOptions = useMemo(
    () =>
      [0, Math.floor(maxUsablePoints / 2), maxUsablePoints]
        .filter((value, index, values) => values.indexOf(value) === index)
        .map((value) => Math.max(0, value)),
    [maxUsablePoints],
  );

  useEffect(() => {
    setSelectedPoints((current) => Math.min(current, maxUsablePoints));
  }, [maxUsablePoints]);

  const activeStepIndex = paymentSteps.findIndex((item) => item.id === step);

  const lookupInvoice = (nextInvoice: LoyaltyPaymentInvoice | null) => {
    if (!nextInvoice) {
      setLookupError('Không tìm thấy hóa đơn. Thử HD-WM-24062026 hoặc quét QR demo.');
      return;
    }

    setInvoice(nextInvoice);
    setInvoiceCode(nextInvoice.id);
    setLookupError(null);
    setStep('setup');
  };

  const lookupManualInvoice = () => {
    lookupInvoice(catalog.findByCode(invoiceCode));
  };

  const lookupQrInvoice = () => {
    lookupInvoice(catalog.qrInvoice);
  };

  const confirmOtp = () => {
    if (!invoice || !calculator || processing) return;

    if (!otpVerifier.verify(otp)) {
      setOtpError('Mã OTP không chính xác. Gợi ý demo: 123456.');
      setOtp('');
      return;
    }

    setProcessing(true);
    setTimeout(() => {
      onComplete(
        LoyaltyPaymentReceiptFactory.create({
          calculator,
          invoice,
          pointsBalance: points,
        }),
      );
    }, 500);
  };

  const closeOtp = () => {
    if (processing) return;
    setOtpVisible(false);
    setOtp('');
    setOtpError(null);
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        onBack={step === 'lookup' ? onBack : () => setStep(step === 'confirm' ? 'setup' : 'lookup')}
        rightLabel="Demo"
        title="Thanh toán Loyalty"
      />

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
            onChangeInvoiceCode={setInvoiceCode}
            onLookup={lookupManualInvoice}
            onQrLookup={lookupQrInvoice}
            onUseSuggested={() => lookupInvoice(catalog.suggestedInvoice)}
          />
        ) : null}

        {step === 'setup' && invoice && calculator ? (
          <PaymentSetupStep
            calculator={calculator}
            cashAmount={cashAmount}
            config={config}
            earnedPoints={earnedPoints}
            invoice={invoice}
            maxUsablePoints={maxUsablePoints}
            pointOptions={pointOptions}
            points={points}
            pointsUsed={pointsUsed}
            selectedMethodId={selectedMethodId}
            selectedVoucherId={selectedVoucherId}
            onConfirm={() => setStep('confirm')}
            onSelectMethod={setSelectedMethodId}
            onSelectPoints={setSelectedPoints}
            onSelectVoucher={(voucherId) =>
              setSelectedVoucherId((current) => (current === voucherId ? null : voucherId))
            }
          />
        ) : null}

        {step === 'confirm' && invoice && calculator ? (
          <PaymentConfirmStep
            calculator={calculator}
            cashAmount={cashAmount}
            config={config}
            earnedPoints={earnedPoints}
            invoice={invoice}
            points={points}
            pointsUsed={pointsUsed}
            onBack={() => setStep('setup')}
            onPay={() => {
              setOtpVisible(true);
              setOtp('');
              setOtpError(null);
            }}
          />
        ) : null}
      </ScrollView>

      <OtpSheet
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

function InvoiceLookupStep({
  invoiceCode,
  lookupError,
  onChangeInvoiceCode,
  onLookup,
  onQrLookup,
  onUseSuggested,
}: {
  invoiceCode: string;
  lookupError: string | null;
  onChangeInvoiceCode: (value: string) => void;
  onLookup: () => void;
  onQrLookup: () => void;
  onUseSuggested: () => void;
}) {
  return (
    <>
      <View style={styles.bankHero}>
        <View style={styles.bankIcon}>
          <Ionicons color={colors.white} name="receipt-outline" size={28} />
        </View>
        <View style={styles.bankHeroCopy}>
          <Text style={styles.bankHeroLabel}>THANH TOÁN HÓA ĐƠN</Text>
          <Text style={styles.bankHeroTitle}>Nhập mã hóa đơn hoặc quét QR tại quầy</Text>
          <Text style={styles.bankHeroText}>
            Demo frontend dùng hóa đơn mock, chưa kết nối POS/API thật.
          </Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <SectionTitle
          icon="search-outline"
          subtitle="Nhập mã hóa đơn do thu ngân/POS cung cấp"
          title="Tìm hóa đơn"
        />
        <View style={styles.invoiceInputBox}>
          <Ionicons color={colors.textMuted} name="document-text-outline" size={19} />
          <TextInput
            autoCapitalize="characters"
            autoCorrect={false}
            onChangeText={onChangeInvoiceCode}
            placeholder="Ví dụ: HD-WM-24062026"
            placeholderTextColor={colors.textMuted}
            style={styles.invoiceInput}
            value={invoiceCode}
          />
        </View>
        {lookupError ? (
          <View style={styles.errorBox}>
            <Ionicons color={colors.danger} name="alert-circle-outline" size={16} />
            <Text style={styles.errorText}>{lookupError}</Text>
          </View>
        ) : null}
        <PrimaryButton label="Tra cứu hóa đơn" onPress={onLookup} />
      </View>

      <View style={styles.lookupActions}>
        <LookupAction
          icon="qr-code-outline"
          label="Quét QR hóa đơn"
          note="Mô phỏng quét QR tại quầy"
          onPress={onQrLookup}
        />
        <LookupAction
          icon="flash-outline"
          label="Dùng hóa đơn mẫu"
          note="Tải nhanh đơn WinMart"
          onPress={onUseSuggested}
        />
      </View>
    </>
  );
}

function PaymentSetupStep({
  calculator,
  cashAmount,
  config,
  earnedPoints,
  invoice,
  maxUsablePoints,
  pointOptions,
  points,
  pointsUsed,
  selectedMethodId,
  selectedVoucherId,
  onConfirm,
  onSelectMethod,
  onSelectPoints,
  onSelectVoucher,
}: {
  calculator: LoyaltyPaymentCalculator;
  cashAmount: number;
  config: PaymentConfiguration;
  earnedPoints: number;
  invoice: LoyaltyPaymentInvoice;
  maxUsablePoints: number;
  pointOptions: number[];
  points: number;
  pointsUsed: number;
  selectedMethodId: PaymentMethodId;
  selectedVoucherId: string | null;
  onConfirm: () => void;
  onSelectMethod: (methodId: PaymentMethodId) => void;
  onSelectPoints: (points: number) => void;
  onSelectVoucher: (voucherId: string) => void;
}) {
  return (
    <>
      <InvoicePreviewCard invoice={invoice} />

      <View style={styles.sectionCard}>
        <SectionTitle
          icon="card-outline"
          subtitle="Chọn nguồn thanh toán phần tiền còn lại"
          title="Phương thức liên kết"
        />
        {linkedPaymentMethods.map((method) => (
          <SelectableRow
            key={method.id}
            accent={method.accent}
            background={method.background}
            icon={method.icon}
            selected={selectedMethodId === method.id}
            subtitle={`${method.maskedAccount} • ${method.description}`}
            title={method.name}
            onPress={() => onSelectMethod(method.id)}
          />
        ))}
      </View>

      <View style={styles.sectionCard}>
        <SectionTitle
          icon="pricetag-outline"
          subtitle="Chọn voucher hoặc bỏ áp dụng trước khi xác nhận"
          title="Mã giảm giá"
        />
        {mockVouchers.map((voucher) => (
          <SelectableRow
            key={voucher.id}
            accent={colors.warning}
            background={colors.warningSoft}
            icon="gift-outline"
            rightContent={
              selectedVoucherId === voucher.id ? (
                <Text style={styles.rowAmount}>-{formatCurrency(calculator.voucherDiscount)}</Text>
              ) : null
            }
            selected={selectedVoucherId === voucher.id}
            subtitle={`${voucher.description} HSD ${voucher.expiresLabel}`}
            title={voucher.title}
            onPress={() => onSelectVoucher(voucher.id)}
          />
        ))}
      </View>

      <View style={styles.sectionCard}>
        <SectionTitle
          icon="sparkles-outline"
          subtitle={`Khả dụng ${formatPoints(points)} pts • Tối đa ${formatPoints(maxUsablePoints)} pts`}
          title="Sử dụng điểm Loyalty"
        />
        <View style={styles.pointOptions}>
          {pointOptions.map((option) => {
            const selected = pointsUsed === option;
            return (
              <Pressable
                accessibilityRole="button"
                key={option}
                onPress={() => onSelectPoints(option)}
                style={({ pressed }) => [
                  styles.pointOption,
                  selected && styles.pointOptionActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.pointOptionLabel, selected && styles.pointOptionLabelActive]}>
                  {option === 0 ? 'Không dùng' : formatPoints(option)}
                </Text>
                {option > 0 ? (
                  <Text style={[styles.pointOptionSub, selected && styles.pointOptionSubActive]}>
                    -{formatCurrency(option)}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      <PaymentSummaryCard
        calculator={calculator}
        cashAmount={cashAmount}
        config={config}
        earnedPoints={earnedPoints}
        invoice={invoice}
        points={points}
        pointsUsed={pointsUsed}
      />

      <PrimaryButton label={`Tiếp tục xác nhận ${formatCurrency(cashAmount)}`} onPress={onConfirm} />
    </>
  );
}

function PaymentConfirmStep({
  calculator,
  cashAmount,
  config,
  earnedPoints,
  invoice,
  points,
  pointsUsed,
  onBack,
  onPay,
}: {
  calculator: LoyaltyPaymentCalculator;
  cashAmount: number;
  config: PaymentConfiguration;
  earnedPoints: number;
  invoice: LoyaltyPaymentInvoice;
  points: number;
  pointsUsed: number;
  onBack: () => void;
  onPay: () => void;
}) {
  return (
    <>
      <View style={styles.confirmCard}>
        <View style={styles.confirmIcon}>
          <Ionicons color={colors.primary} name="shield-checkmark-outline" size={30} />
        </View>
        <Text style={styles.confirmTitle}>Xác nhận thanh toán?</Text>
        <Text style={styles.confirmText}>
          Vui lòng kiểm tra lại hóa đơn, phương thức, voucher và điểm sử dụng trước khi nhập OTP.
        </Text>
      </View>

      <InvoicePreviewCard invoice={invoice} compact />

      <View style={styles.sectionCard}>
        <InfoRow label="Phương thức" value={`${config.method.name} • ${config.method.maskedAccount}`} />
        <InfoRow label="Mã giảm giá" value={config.voucher?.title ?? 'Không áp dụng'} />
        <InfoRow label="Điểm sử dụng" value={`${formatPoints(pointsUsed)} pts`} />
        <InfoRow label="Tiền cần trả" strong value={formatCurrency(cashAmount)} />
      </View>

      <PaymentSummaryCard
        calculator={calculator}
        cashAmount={cashAmount}
        config={config}
        earnedPoints={earnedPoints}
        invoice={invoice}
        points={points}
        pointsUsed={pointsUsed}
      />

      <View style={styles.confirmActions}>
        <PrimaryButton label="Thanh toán" onPress={onPay} />
        <View style={styles.actionSpacer} />
        <PrimaryButton label="Quay lại chỉnh sửa" onPress={onBack} variant="secondary" />
      </View>
    </>
  );
}

function OtpSheet({
  bottomInset,
  error,
  otp,
  processing,
  visible,
  onChangeOtp,
  onClose,
  onConfirm,
}: {
  bottomInset: number;
  error: string | null;
  otp: string;
  processing: boolean;
  visible: boolean;
  onChangeOtp: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalRoot}
      >
        <Pressable disabled={processing} onPress={onClose} style={styles.modalBackdrop} />
        <View style={[styles.otpSheet, { paddingBottom: getScreenBottomPadding(bottomInset, 8) }]}>
          <View style={styles.sheetHandle} />
          <View style={styles.otpHeader}>
            <View style={styles.otpIcon}>
              <Ionicons color={colors.primary} name="lock-closed-outline" size={24} />
            </View>
            <View style={styles.otpCopy}>
              <Text style={styles.otpTitle}>Nhập OTP xác nhận</Text>
              <Text style={styles.otpSubtitle}>Mã demo: 123456</Text>
            </View>
            <Pressable disabled={processing} hitSlop={10} onPress={onClose}>
              <Ionicons color={colors.textMuted} name="close" size={24} />
            </Pressable>
          </View>

          <TextInput
            autoFocus
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            onChangeText={onChangeOtp}
            placeholder="••••••"
            placeholderTextColor="#A8B6C7"
            style={styles.otpInput}
            value={otp}
          />
          <View style={styles.otpDots}>
            {Array.from({ length: OTP_LENGTH }).map((_, index) => (
              <View key={index} style={[styles.otpDot, index < otp.length && styles.otpDotFilled]} />
            ))}
          </View>
          {error ? (
            <View style={styles.otpErrorBox}>
              <Ionicons color={colors.danger} name="alert-circle-outline" size={16} />
              <Text style={styles.otpErrorText}>{error}</Text>
            </View>
          ) : null}
          <PrimaryButton
            disabled={otp.length !== OTP_LENGTH || processing}
            label={processing ? 'Đang xác thực...' : 'Xác nhận OTP'}
            onPress={onConfirm}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function InvoicePreviewCard({
  invoice,
  compact = false,
}: {
  invoice: LoyaltyPaymentInvoice;
  compact?: boolean;
}) {
  return (
    <View style={[styles.invoiceCard, compact && styles.invoiceCardCompact]}>
      <View style={styles.invoiceCardHeader}>
        <View style={styles.merchantLogo}>
          <Ionicons color={colors.primary} name="storefront-outline" size={22} />
        </View>
        <View style={styles.invoiceMerchantCopy}>
          <Text style={styles.invoiceMerchant}>{invoice.merchant}</Text>
          <Text style={styles.invoiceMeta}>
            {invoice.channel} • {invoice.terminal}
          </Text>
        </View>
        <View style={styles.invoiceChannelBadge}>
          <Text style={styles.invoiceChannelText}>{invoice.category}</Text>
        </View>
      </View>
      <View style={styles.invoiceAmountBox}>
        <Text style={styles.invoiceAmountLabel}>Số tiền hóa đơn</Text>
        <Text style={styles.invoiceAmount}>{formatCurrency(invoice.amount)}</Text>
      </View>
      {!compact ? (
        <View style={styles.invoiceFooter}>
          <InfoRow label="Mã hóa đơn" value={invoice.id} />
          <InfoRow label="Ghi chú" value={invoice.customerNote} />
          <InfoRow label="Trạng thái" value={invoice.dueLabel} />
        </View>
      ) : null}
    </View>
  );
}

function PaymentSummaryCard({
  calculator,
  cashAmount,
  earnedPoints,
  invoice,
  points,
  pointsUsed,
}: {
  calculator: LoyaltyPaymentCalculator;
  cashAmount: number;
  config: PaymentConfiguration;
  earnedPoints: number;
  invoice: LoyaltyPaymentInvoice;
  points: number;
  pointsUsed: number;
}) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryTitle}>Tóm tắt thanh toán</Text>
      <SummaryRow label="Giá trị hóa đơn" value={formatCurrency(invoice.amount)} />
      <SummaryRow
        label="Voucher / mã giảm giá"
        value={`-${formatCurrency(calculator.voucherDiscount)}`}
        valueColor={colors.success}
      />
      <SummaryRow
        label={`Điểm Loyalty (${formatPoints(pointsUsed)} pts)`}
        value={`-${formatCurrency(calculator.pointDiscount(points))}`}
        valueColor="#9FD4FF"
      />
      <View style={styles.totalDivider} />
      <SummaryRow bold label="Số tiền cần trả" value={formatCurrency(cashAmount)} />
      <View style={styles.earnRow}>
        <Ionicons color="#A7F3D0" name="add-circle-outline" size={17} />
        <Text style={styles.earnText}>
          Dự kiến cộng {formatPoints(earnedPoints)} điểm sau khi giao dịch hoàn tất.
        </Text>
      </View>
    </View>
  );
}

function LookupAction({
  icon,
  label,
  note,
  onPress,
}: {
  icon: IconName;
  label: string;
  note: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.lookupAction, pressed && styles.pressed]}
    >
      <View style={styles.lookupActionIcon}>
        <Ionicons color={colors.primary} name={icon} size={22} />
      </View>
      <Text style={styles.lookupActionLabel}>{label}</Text>
      <Text style={styles.lookupActionNote}>{note}</Text>
    </Pressable>
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: IconName;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <View style={styles.sectionIcon}>
        <Ionicons color={colors.primary} name={icon} size={18} />
      </View>
      <View style={styles.sectionCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function SelectableRow({
  icon,
  selected,
  title,
  subtitle,
  accent,
  background,
  rightContent,
  onPress,
}: {
  icon: IconName;
  selected: boolean;
  title: string;
  subtitle: string;
  accent: string;
  background: string;
  rightContent?: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.selectableRow,
        selected && styles.selectableRowActive,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: background }]}>
        <Ionicons color={accent} name={icon} size={20} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text numberOfLines={2} style={styles.rowSubtitle}>
          {subtitle}
        </Text>
      </View>
      {rightContent}
      <View style={[styles.radio, selected && styles.radioActive]}>
        {selected ? <Ionicons color={colors.white} name="checkmark" size={13} /> : null}
      </View>
    </Pressable>
  );
}

function InfoRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, strong && styles.infoValueStrong]}>{value}</Text>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  valueColor = colors.white,
  bold = false,
}: {
  label: string;
  value: string;
  valueColor?: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold && styles.summaryBold]}>{label}</Text>
      <Text style={[styles.summaryValue, bold && styles.summaryBold, { color: valueColor }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  pressed: { opacity: 0.72 },
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
  bankHero: {
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: colors.primaryDark,
    padding: 18,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 6,
  },
  bankIcon: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  bankHeroCopy: { flex: 1, marginLeft: 14 },
  bankHeroLabel: { color: '#B8D9F4', fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
  bankHeroTitle: { marginTop: 6, color: colors.white, fontSize: 19, fontWeight: '900', lineHeight: 25 },
  bankHeroText: { marginTop: 8, color: '#D8ECFF', fontSize: 11, lineHeight: 16 },
  sectionCard: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    backgroundColor: colors.surface,
    padding: 16,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
  },
  sectionCopy: { flex: 1, marginLeft: 11 },
  sectionTitle: { color: colors.text, fontSize: 14, fontWeight: '900' },
  sectionSubtitle: { marginTop: 3, color: colors.textMuted, fontSize: 10, lineHeight: 15 },
  invoiceInputBox: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: '#F8FBFE',
    paddingHorizontal: 14,
  },
  invoiceInput: {
    flex: 1,
    minHeight: 50,
    marginLeft: 9,
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 13,
    backgroundColor: '#FFF1F2',
    padding: 10,
  },
  errorText: { flex: 1, marginLeft: 7, color: colors.danger, fontSize: 10, lineHeight: 15 },
  lookupActions: { flexDirection: 'row', justifyContent: 'space-between' },
  lookupAction: {
    width: '48%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 16,
  },
  lookupActionIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
  },
  lookupActionLabel: { marginTop: 10, textAlign: 'center', color: colors.text, fontSize: 12, fontWeight: '900' },
  lookupActionNote: { marginTop: 5, textAlign: 'center', color: colors.textMuted, fontSize: 10, lineHeight: 14 },
  invoiceCard: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 16,
  },
  invoiceCardCompact: { marginBottom: 14 },
  invoiceCardHeader: { flexDirection: 'row', alignItems: 'center' },
  merchantLogo: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
  },
  invoiceMerchantCopy: { flex: 1, marginLeft: 12 },
  invoiceMerchant: { color: colors.text, fontSize: 15, fontWeight: '900' },
  invoiceMeta: { marginTop: 4, color: colors.textMuted, fontSize: 10, fontWeight: '700' },
  invoiceChannelBadge: {
    borderRadius: 999,
    backgroundColor: colors.warningSoft,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  invoiceChannelText: { color: colors.warning, fontSize: 9, fontWeight: '900' },
  invoiceAmountBox: {
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: colors.primaryDark,
    padding: 16,
  },
  invoiceAmountLabel: { color: '#B8D4E8', fontSize: 10, fontWeight: '800' },
  invoiceAmount: { marginTop: 7, color: colors.white, fontSize: 26, fontWeight: '900' },
  invoiceFooter: { marginTop: 14 },
  selectableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.white,
    padding: 12,
  },
  selectableRowActive: { borderColor: 'rgba(0,91,170,0.36)', backgroundColor: '#F7FBFF' },
  rowIcon: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 15 },
  rowCopy: { flex: 1, marginHorizontal: 11 },
  rowTitle: { color: colors.text, fontSize: 12, fontWeight: '900' },
  rowSubtitle: { marginTop: 4, color: colors.textMuted, fontSize: 10, lineHeight: 15 },
  rowAmount: { marginRight: 8, color: colors.success, fontSize: 11, fontWeight: '900' },
  radio: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
  },
  radioActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  pointOptions: { flexDirection: 'row' },
  pointOption: {
    flex: 1,
    minHeight: 66,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.white,
    paddingHorizontal: 6,
  },
  pointOptionActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  pointOptionLabel: { textAlign: 'center', color: colors.text, fontSize: 11, fontWeight: '900' },
  pointOptionLabelActive: { color: colors.white },
  pointOptionSub: { marginTop: 5, color: colors.textMuted, fontSize: 9, fontWeight: '700' },
  pointOptionSubActive: { color: '#D8ECFF' },
  summaryCard: { marginBottom: 14, borderRadius: 22, backgroundColor: colors.primaryDark, padding: 18 },
  summaryTitle: {
    marginBottom: 14,
    color: '#B8D4E8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11 },
  summaryLabel: { maxWidth: '65%', color: '#D7E5EF', fontSize: 11 },
  summaryValue: { color: colors.white, fontSize: 12, fontWeight: '800' },
  summaryBold: { color: colors.white, fontSize: 15, fontWeight: '900' },
  totalDivider: { height: 1, marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.18)' },
  earnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    borderRadius: 13,
    backgroundColor: 'rgba(16,166,106,0.16)',
    padding: 11,
  },
  earnText: { flex: 1, marginLeft: 7, color: '#D1FAE5', fontSize: 10, fontWeight: '800', lineHeight: 15 },
  confirmCard: {
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 22,
  },
  confirmIcon: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 31,
    backgroundColor: colors.primarySoft,
  },
  confirmTitle: { marginTop: 14, color: colors.text, fontSize: 20, fontWeight: '900' },
  confirmText: { marginTop: 8, textAlign: 'center', color: colors.textMuted, fontSize: 11, lineHeight: 17 },
  confirmActions: { marginTop: 2 },
  actionSpacer: { height: 10 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: { maxWidth: '38%', color: colors.textMuted, fontSize: 11 },
  infoValue: { maxWidth: '58%', textAlign: 'right', color: colors.text, fontSize: 11, fontWeight: '800' },
  infoValueStrong: { color: colors.primary, fontSize: 15, fontWeight: '900' },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7, 27, 45, 0.58)',
  },
  otpSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 46,
    height: 5,
    marginBottom: 16,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  otpHeader: { flexDirection: 'row', alignItems: 'center' },
  otpIcon: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
  },
  otpCopy: { flex: 1, marginHorizontal: 12 },
  otpTitle: { color: colors.text, fontSize: 16, fontWeight: '900' },
  otpSubtitle: { marginTop: 3, color: colors.textMuted, fontSize: 11 },
  otpInput: {
    height: 58,
    marginTop: 18,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 10,
    textAlign: 'center',
  },
  otpDots: { flexDirection: 'row', justifyContent: 'center', marginVertical: 16 },
  otpDot: {
    width: 10,
    height: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: colors.border,
  },
  otpDotFilled: { backgroundColor: colors.primary },
  otpErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 13,
    backgroundColor: '#FFF1F2',
    padding: 10,
  },
  otpErrorText: { flex: 1, marginLeft: 7, color: colors.danger, fontSize: 10, lineHeight: 15 },
});
