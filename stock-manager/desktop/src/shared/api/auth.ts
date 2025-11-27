import { apiFetch } from './httpClient';

export type LoginResponse = {
    token: string;
    user: {
        id: number;
        username: string;
        roleId: number;
        fullName: string;
    };
};

export const authApi = {
    login: (credentials: { username: string; password: string }) =>
        apiFetch<LoginResponse>('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        }),
};
