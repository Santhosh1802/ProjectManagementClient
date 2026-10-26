import api from "@/config/api";
import type { LoginForm, RegistrationForm } from "../types/auth.types";
import type { ApiResponse, User } from "@/features/users/types/user.types";

export async function registerUser(request:RegistrationForm) {
    const response = await api.post("/auth/register", request)
    return response;    
}

export async function LoginUser(request:LoginForm) {
    const response = await api.post("/auth/login",request);
    return response;
}

export async function isLoggedIn() {
    const response = await api.get<ApiResponse<User>>("/auth/me");
    return response;
}

export async function LogoutUser() {
    const response = await api.post("/auth/logout");
    return response;
}

export async function forgotPassword(email: string) {
    const response = await api.post<ApiResponse<string>>("/auth/forgot-password", { email });
    return response.data;
}

export async function resetPassword(token: string, newPassword: string) {
    const response = await api.post<ApiResponse<string>>("/auth/reset-password", { token, newPassword });
    return response.data;
}

export async function verifyEmail(token: string) {
    const response = await api.post<ApiResponse<string>>("/auth/verify-email", { token });
    return response.data;
}

export async function resendVerification(email: string) {
    const response = await api.post<ApiResponse<string>>("/auth/resend-verification", { email });
    return response.data;
}