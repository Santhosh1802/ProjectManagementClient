import api from "@/config/api";
import type { UserByEmail } from "../types/user.types";

export async function getUserByEmail(request:UserByEmail) {
    const response = await api.get(`/users/email`,{params:{
        email:request.email
    }});
    return response;
}