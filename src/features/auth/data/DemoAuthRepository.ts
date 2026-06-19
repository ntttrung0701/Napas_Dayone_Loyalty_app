import type {
  AuthRepository,
  AuthUser,
  RegistrationInput,
} from '../domain/AuthModels';

type UserRecord = AuthUser & { password: string };

const normalize = (value: string) => value.trim().toLocaleLowerCase('vi');

export class DemoAuthRepository implements AuthRepository {
  private readonly users = new Map<string, UserRecord>();

  constructor() {
    this.store({
      id: 'demo-user',
      fullName: 'Khách hàng Napas',
      phone: '0987654321',
      email: 'demo@napas.vn',
      clientCode: 'CIF001',
      password: 'Demo@123',
    });
  }

  async authenticate(identifier: string, password: string): Promise<AuthUser | null> {
    const record = this.users.get(normalize(identifier));
    if (!record || record.password !== password) return null;
    return this.toUser(record);
  }

  async identifierExists(identifier: string): Promise<boolean> {
    return this.users.has(normalize(identifier));
  }

  async createAccount(input: RegistrationInput): Promise<AuthUser> {
    const record: UserRecord = {
      id: `demo-${Date.now()}`,
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
      clientCode: input.clientCode.trim(),
      password: input.password,
    };
    this.store(record);
    return this.toUser(record);
  }

  async findForPasswordReset(phone: string, clientCode: string): Promise<AuthUser | null> {
    const record = this.users.get(normalize(phone));
    if (!record || normalize(record.clientCode) !== normalize(clientCode)) return null;
    return this.toUser(record);
  }

  async updatePassword(userId: string, password: string): Promise<void> {
    const record = [...this.users.values()].find((user) => user.id === userId);
    if (!record) return;
    record.password = password;
    this.store(record);
  }

  private store(record: UserRecord) {
    [record.phone, record.email, record.clientCode].forEach((identifier) => {
      this.users.set(normalize(identifier), record);
    });
  }

  private toUser(record: UserRecord): AuthUser {
    const { password: _password, ...user } = record;
    return user;
  }
}
