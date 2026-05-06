import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/common/Buttons/CustomButton";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import useAuthStore from "@/store/useAuthStore";
import { updateEmailApi } from "@/Services/authService";

//////////////////////////////////////////////////////////
// 🔥 VALIDATION
//////////////////////////////////////////////////////////
const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter valid email"),
});

//////////////////////////////////////////////////////////
// 🔥 COMPONENT
//////////////////////////////////////////////////////////
const UpdateEmail = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 👉 Zustand se user lo (Redux hata diya)
  const user = useAuthStore((state) => state.userDetails);

  //////////////////////////////////////////////////////////
  // 🔥 REDIRECT CHECK
  //////////////////////////////////////////////////////////
  //   useEffect(() => {
  //     if (!user?._id) {
  //       navigate("/signup");
  //     }
  //   }, [user, navigate]);

  //////////////////////////////////////////////////////////
  // 🔥 FORM
  //////////////////////////////////////////////////////////
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

  //////////////////////////////////////////////////////////
  // 🔥 SUBMIT
  //////////////////////////////////////////////////////////
  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const res = await updateEmailApi({
        email: data.email,
        tenantId: user._id,
      });

      if (res.status === 200) {
        toast.success(res.data.message || "Email updated");

        navigate("/sendverification-mail", {
          state: { email: data.email },
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  //////////////////////////////////////////////////////////
  // 🔥 UI
  //////////////////////////////////////////////////////////
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      {/* LOGO */}
      <div className="text-center mb-6">
        <div className="w-14 h-10 mx-auto rounded-md bg-[#0B1F3A] text-yellow-400 flex items-center justify-center text-sm font-bold shadow-lg shadow-yellow-500/50">
          CB
        </div>
        <h1 className="mt-2 text-sm font-semibold text-[#0B1F3A]">
          CREDUBLANCE
        </h1>
        <p className="text-[10px] text-gray-400">ROLE-BASED ACCESS CONTROL</p>
      </div>

      {/* CARD */}
      <div className="bg-white w-[320px] rounded-2xl shadow-sm p-5">
        <div className="text-center">
          <h2 className="text-sm font-semibold text-[#0B1F3A]">Update Email</h2>
          <p className="text-[11px] text-gray-400 mb-4">
            Enter your new email address
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* EMAIL */}
          <div>
            <Input
              placeholder="Enter your email"
              {...register("email")}
              className="h-8 text-xs"
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
            loading={loading}
            className="w-full h-9 bg-primary text-xs"
          >
            Update Email
          </LoadingButton>
        </form>

        {/* BACK */}
        <div className="text-center mt-3 text-[10px] text-gray-400">
          <span
            onClick={() => navigate("/login")}
            className="text-yellow-500 cursor-pointer hover:underline"
          >
            Back to Login
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

export default UpdateEmail;
