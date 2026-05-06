import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/common/Buttons/CustomButton";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { resendVerificationApi } from "../../Services/authService";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter valid email"),
});

const ResendVerificationEmail = () => {
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = async (data) => {
    try {
      const res = await resendVerificationApi({
        email: data.email,
      });

      if (res.status === 200) {
        toast.success(res.data.message || "Verification email sent");

        navigate("/sendverification-mail", {
          state: { email: data.email },
        });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to resend verification email",
      );
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
            Resend Verification
          </h2>
          <p className="text-[11px] text-gray-400 mb-4">
            Enter your email to resend verification link
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="text-[10px] text-gray-500">Email Id</label>

            <Input
              placeholder="Enter your email"
              {...register("email")}
              className="mt-1 h-8 text-xs"
            />

            {errors.email && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* BUTTON */}
          <LoadingButton
            type="submit"
            className="w-full h-9 bg-primary text-xs"
          >
            Resend Email
          </LoadingButton>
        </form>

        {/* BACK */}
        <div className="text-center mt-3 text-[10px] text-gray-400">
          Back to{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-yellow-500 cursor-pointer hover:underline"
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

export default ResendVerificationEmail;
