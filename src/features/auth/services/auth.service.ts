import api from "@/config/api";
import type { LoginForm, RegistrationForm } from "../types/auth.types";

export async function registerUser(request:RegistrationForm) {
    const response = await api.post("/auth/register", request)
    return response;    
}

export async function LoginUser(request:LoginForm) {
    const response = await api.post("/auth/login",request);
    return response;
}

export async function isLoggedIn() {
    const response = await api.get("/auth/me");
    return response;
    
}

export async function LogoutUser() {
    const response = await api.post("/auth/logout");
    return response;
}