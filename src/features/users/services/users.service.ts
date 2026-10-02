import api from "@/config/api";
import type { UserByEmail, UserById } from "../types/user.types";

export async function getUserByEmail(request:UserByEmail) {
    const response = await api.get(`/users/email`,{params:{
        email:request.email
    }});
    return response;
}

export async function getUserById(request:UserById) {
    const response = await api.get(`/users/id`,{params:{
        id:request.id
    }});
    return response;
}