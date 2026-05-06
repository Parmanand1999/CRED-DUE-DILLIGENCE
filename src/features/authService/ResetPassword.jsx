import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/common/Buttons/CustomButton";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPasswordApi } from "../../Services/authService";
import { Eye, EyeOff } from "lucide-react";

const schema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = async (data) => {
    if (!token) {
      toast.error("Invalid or expired reset link");
      return;
    }

    try {
      setLoading(true);

      const res = await resetPasswordApi({
        token,
        newPassword: data.password,
      });

      if (res.status === 200) {
        toast.success(res.data.message || "Password reset successful");
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      {/* LOGO */}
      <div className="text-center mb-6">
        <div className="w-14 h-10 mx-auto rounded-md bg-[#0B1F3A] text-yellow-400 flex items-center justify-center text-sm font-bold shadow-lg shadow-yellow-500/50">
          CB
        </div>
        <h1 className="mt-2 text-sm font-semibold tracking-wide text-[#0B1F3A]">
          CREDUBLANCE
        </h1>
        <p className="text-[10px] text-gray-400 tracking-widest">
          ROLE-BASED ACCESS CONTROL
        </p>
      </div>

      {/* CARD */}
      <div className="bg-white w-[320px] rounded-2xl shadow-sm p-5">
        <div className="text-center">
          <h2 className="text-sm font-semibold text-[#0B1F3A]">
            Set New Password
          </h2>
          <p className="text-[11px] text-gray-400 mb-4">
            Please enter your new password
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* PASSWORD */}
          <div>
            <label className="text-[10px] text-gray-500">Password</label>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="mt-1 h-8 text-xs pr-8"
              />

              <div
                className="absolute right-2 top-2 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </div>
            </div>

            {errors.password && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="text-[10px] text-gray-500">
              Confirm Password
            </label>

            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className="mt-1 h-8 text-xs pr-8"
              />

              <div
                className="absolute right-2 top-2 cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </div>
            </div>

            {errors.confirmPassword && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* BUTTON */}
          <LoadingButton
            type="submit"
            loading={loading}
            className="w-full h-9 bg-primary text-xs"
          >
            Set Password
          </LoadingButton>
        </form>

        {/* BACK */}
        <div className="text-center mt-3 text-[10px] text-gray-400">
          Back to{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-yellow-500 cursor-pointer"
          >
            Login
          </span>
        </div>
      </div>

      {/* FOOTER */}
      <p className="text-[9px] text-gray-400 mt-5 text-center max-w-xs">
        AUTHORIZED ACCESS ONLY. ALL ACTIVITIES ARE MONITORED AND LOGGED FOR
        SECURITY COMPLIANCE.
      </p>
    </div>
  );
};

export default ResetPassword;
