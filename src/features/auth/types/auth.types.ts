export type RegistrationForm={
    firstName:string,
    lastName?:string,
    email:string,
    password:string,
}

export type LoginForm = {
    email: string;
    password: string;
}

export type ForgotPasswordForm = {
    email: string;
}

export type ResetPasswordForm = {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

export type VerifyEmailForm = {
    token: string;
}

export type ResendVerificationForm = {
    email: string;
}
