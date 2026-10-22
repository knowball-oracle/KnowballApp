import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import type { Role } from '@/types/api';

// Só o token vai no SecureStore (limite de ~2 KB por item).
// Usuário e foto (Base64 grande) ficam no AsyncStorage.
const TOKEN_KEY = 'kb.token';
const USER_KEY = 'kb.user';
const photoKey = (userId: number) => `kb.photo.${userId}`;

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  role: Role;
}

export const sessionStorage = {
  async load(): Promise<{ token: string; user: SessionUser } | null> {
    const [token, rawUser] = await Promise.all([SecureStore.getItemAsync(TOKEN_KEY), AsyncStorage.getItem(USER_KEY)]);
    if (!token || !rawUser) return null;
    try {
      return { token, user: JSON.parse(rawUser) as SessionUser };
    } catch {
      return null;
    }
  },

  async save(token: string, user: SessionUser) {
    await Promise.all([SecureStore.setItemAsync(TOKEN_KEY, token), AsyncStorage.setItem(USER_KEY, JSON.stringify(user))]);
  },

  async clear() {
    await Promise.all([SecureStore.deleteItemAsync(TOKEN_KEY), AsyncStorage.removeItem(USER_KEY)]);
  },

  async loadPhoto(userId: number) {
    return AsyncStorage.getItem(photoKey(userId));
  },

  async savePhoto(userId: number, photo: string | null) {
    if (photo) await AsyncStorage.setItem(photoKey(userId), photo);
    else await AsyncStorage.removeItem(photoKey(userId));
  },
};
