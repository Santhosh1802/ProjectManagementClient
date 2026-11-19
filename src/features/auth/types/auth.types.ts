export type RegistrationForm={
    firstName:string,
    lastName?:string,
    email:string,
    password:string,
}

export type LoginForm = {
    email: string;
    password: string;
    mfaCode?: string;
}

export interface MfaSetupResponse {
    secret: string;
    otpAuthUri: string;
    mfaEnabled: boolean;
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
