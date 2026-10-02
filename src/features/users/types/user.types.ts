export type UserByEmail={
    email:string
}

export type User={
    id:string,
    firstName:string,
    lastName:string,
    email:string,
    userRole:string,
    isActive:boolean,
    emailVerified:boolean,
    createdAt:string,
    updatedAt:string,
    lastLoginAt:string,
}