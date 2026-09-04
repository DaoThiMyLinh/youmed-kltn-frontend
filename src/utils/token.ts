const TOKEN_KEY = 'yomed_token';
const ROLE_KEY = 'yomed_role';
const NAME_KEY = 'yomed_name';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = (): void => localStorage.removeItem(TOKEN_KEY);

export const getRole = (): string | null => localStorage.getItem(ROLE_KEY);
export const setRole = (role: string): void => localStorage.setItem(ROLE_KEY, role);
export const removeRole = (): void => localStorage.removeItem(ROLE_KEY);

export const getName = (): string | null => localStorage.getItem(NAME_KEY);
export const setName = (name: string): void => localStorage.setItem(NAME_KEY, name);
export const removeName = (): void => localStorage.removeItem(NAME_KEY);

export const clearAuth = (): void => {
  removeToken();
  removeRole();
  removeName();
};
