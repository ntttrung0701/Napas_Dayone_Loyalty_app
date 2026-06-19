import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AccountStorage } from '../domain/AuthModels';

const REMEMBERED_IDENTIFIER_KEY = '@napas/remembered-identifier';

export class AsyncAccountStorage implements AccountStorage {
  getIdentifier(): Promise<string | null> {
    return AsyncStorage.getItem(REMEMBERED_IDENTIFIER_KEY);
  }

  saveIdentifier(identifier: string): Promise<void> {
    return AsyncStorage.setItem(REMEMBERED_IDENTIFIER_KEY, identifier.trim());
  }

  clearIdentifier(): Promise<void> {
    return AsyncStorage.removeItem(REMEMBERED_IDENTIFIER_KEY);
  }
}
