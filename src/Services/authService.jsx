import { getData, postData } from "./apiServices";

export const loginWithEmail = (data) => postData("/auth/login", data);
export const loginWithMobile = (data) =>
  postData("/auth/login-with-mobile", data);
export const loginWithotp = (data) => postData("/auth/verify-otp", data);
export const forgotPasswordApi = (data) =>
  postData("/auth/forgot-password", data);
export const resetPasswordApi = (data) =>
  postData("/auth/reset-password", data);
export const resendVerificationApi = (data) =>
  postData("/auth/resend-verification-email", data);
export const signupApi = (data) => postData("/auth/signup", data);
export const organizationData = () => getData("/organizationType");
export const updateEmailApi = (data) => postData("/auth/signup", data);
export const verifyEmailApi = (token) =>
  getData(`/auth/verify-email?token=${token}`);
