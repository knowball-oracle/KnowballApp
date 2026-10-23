import type {
  CreateUserRequest,
  Page,
  UpdateProfileRequest,
  UpdateUserRequest,
  UserFilters,
  UserProfile,
  UserResponse,
} from '@/types/api';
import { http } from './http';

export const USERS_PAGE_SIZE = 20;

export const usersService = {
  me: () => http.get<UserProfile>('/users/me'),
  /** profilePicture: '' remove; data URL Base64 (~400 px) troca. */
  updateMe: (body: UpdateProfileRequest) => http.put<UserProfile>('/users/me', body),

  // ADMIN
  /** Page do Spring, 0-based, ordenado por nome. Filtros sem diferenciar maiúsculas. */
  list: ({ name, email, page = 0, size = USERS_PAGE_SIZE }: UserFilters = {}) =>
    http.get<Page<UserResponse>>('/users', { query: { name, email, page, size } }),
  get: (id: number) => http.get<UserResponse>(`/users/${id}`),
  create: (body: CreateUserRequest) => http.post<UserResponse>('/users', body),
  /** Senha vazia mantém a atual: não envie o campo. */
  update: (id: number, body: UpdateUserRequest) => {
    const { password, ...rest } = body;
    return http.put<UserResponse>(`/users/${id}`, password ? body : rest);
  },
  remove: (id: number) => http.del(`/users/${id}`),
};
