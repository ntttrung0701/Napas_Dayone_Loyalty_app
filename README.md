# Napas DayOne Demo

Bản prototype mobile dùng Expo SDK 54, React Native và TypeScript, mô phỏng ứng dụng thanh toán và loyalty theo demo AI Studio.

## Luồng demo hiện có

```text
Splash → Onboarding → Xác thực → Dashboard
                         ├── Đăng nhập thường / sinh trắc học
                         ├── Đăng ký → OTP
                         └── Quên mật khẩu → OTP → Đặt mật khẩu mới

Dashboard
├── Kho ưu đãi → Lọc danh mục → Chi tiết → Đổi điểm → Biên lai
├── Mã QR thành viên
├── Tặng điểm → Biên lai
├── Liên kết thẻ & ví
├── Thanh toán hỗn hợp → Biên lai
├── Lịch sử điểm → Lọc nhận điểm / sử dụng
└── Tài khoản
```

Tài khoản mẫu: `0987654321` / `Demo@123`. Mã OTP demo: `123749`. Ghi nhớ tên đăng nhập dùng AsyncStorage; Face ID/vân tay dùng API sinh trắc học của hệ điều hành. Repository tài khoản và OTP vẫn là dữ liệu demo cục bộ, vì vậy không nhập dữ liệu thật.

## Cấu trúc

```text
.
├── App.tsx
├── app.json                 # Cấu hình Expo, Android và iOS
├── index.ts                 # Entry point
└── src
    ├── features
    │   ├── auth
    │   │   ├── application # AuthService và các use case
    │   │   ├── data        # DemoAuthRepository
    │   │   ├── domain      # Model, interface và lỗi nghiệp vụ
    │   │   ├── infrastructure # AsyncStorage và biometric adapter
    │   │   └── presentation   # Màn hình/component thuần giao diện
    │   ├── offers/domain    # OfferCatalog
    │   └── history/domain   # TransactionLedger
    ├── mock                 # Dữ liệu demo cục bộ
    ├── shared
    │   └── components       # Component dùng chung
    └── theme                # Màu sắc và design tokens
```

## Chạy dự án khi cần

```bash
npm install
npm start
```

Sau đó mở ứng dụng **Expo Go** trên điện thoại và quét QR trong terminal. Điện thoại và máy tính nên dùng cùng mạng Wi-Fi.

Nếu đã kết nối Android emulator hoặc điện thoại qua ADB, có thể dùng `npm run android`. Lệnh này vẫn chạy bằng Expo Go; native build riêng được giữ ở `npm run native:android`.

Mở trực tiếp trên nền tảng:

```bash
npm run android
npm run ios
```

> `npm run ios` cần macOS và Xcode. Trên Windows có thể dùng Expo Go hoặc build iOS qua EAS.

## Thư mục native Android/iOS

Expo quản lý cấu hình Android/iOS trong `app.json`. Khi thật sự cần sửa native module hoặc build native cục bộ, sinh hai thư mục `android/` và `ios/` bằng:

```bash
npm run prebuild
```

Không commit khóa bí mật hoặc private key vào ứng dụng. Mọi giao dịch thanh toán phải được xác thực và ký ở backend.
