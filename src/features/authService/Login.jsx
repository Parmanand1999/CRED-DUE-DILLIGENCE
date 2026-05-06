import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/common/Buttons/CustomButton";
import {
  loginWithEmail,
  loginWithMobile,
  loginWithotp,
} from "../../Services/authService";
import useAuthStore from "@/store/useAuthStore";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [tab, setTab] = useState("email");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  console.log(login, "login data");

  const schema = z
    .object({
      email: z.string().optional(),
      password: z.string().optional(),
      phone: z.string().optional(),
      otp: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      // EMAIL LOGIN
      if (tab === "email") {
        if (!data.email || data.email === "") {
          ctx.addIssue({
            path: ["email"],
            message: "Email is required",
          });
        } else if (!/\S+@\S+\.\S+/.test(data.email)) {
          ctx.addIssue({
            path: ["email"],
            message: "Enter valid email",
          });
        }

        if (!data.password || data.password === "") {
          ctx.addIssue({
            path: ["password"],
            message: "Password is required",
          });
        } else if (data.password.length < 6) {
          ctx.addIssue({
            path: ["password"],
            message: "Minimum 6 characters",
          });
        }
      }

      // PHONE LOGIN
      if (tab === "phone") {
        if (!data.phone || data.phone === "") {
          ctx.addIssue({
            path: ["phone"],
            message: "Phone number is required",
          });
        } else if (data.phone.length !== 10) {
          ctx.addIssue({
            path: ["phone"],
            message: "Enter valid 10 digit number",
          });
        }

        if (otpSent) {
          if (!data.otp || data.otp === "") {
            ctx.addIssue({
              path: ["otp"],
              message: "OTP is required",
            });
          } else if (data.otp.length !== 6) {
            ctx.addIssue({
              path: ["otp"],
              message: "Enter valid OTP",
            });
          }
        }
      }
    });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
      phone: "",
      otp: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = form;

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      if (tab === "email") {
        // ✅ Email validation
        const valid = await trigger(["email", "password"]);
        if (!valid) return;

        // ✅ Email login API
        const res = await loginWithEmail({
          email: data.email,
          password: data.password,
        });
        console.log(res.data, "login with email");
        if (res.status === 200) {
          login(res.data.data);
          navigate("/");
          const role = res.data.data?.userDetails?.roleName?.toLowerCase();
          // if (role === "backend team") {
          //   navigate("/backend-dashboard");
          // } else if (role === "client") {
          //   navigate("/verification-cases");
          // } else if (role === "admin") {
          //   navigate("/");
          // } else {
          //   navigate("/");
          // }
        }
      } else {
        // 📱 PHONE FLOW
        if (!otpSent) {
          const valid = await trigger("phone");
          if (!valid) return;

          // ✅ Send OTP API
          await loginWithMobile({
            mobile: data.phone,
          });

          setOtpSent(true);
        } else {
          const valid = await trigger("otp");
          if (!valid) return;

          // ✅ Verify OTP API
          const res = await loginWithotp({
            mobile: data.phone,
            otp: data.otp,
          });
          if (res.status === 200) {
            login(res.data.data);
            navigate("/");
            const role = res.data.data?.roleName?.toLowerCase();
            // if (role === "backend team") {
            //   navigate("/backend-dashboard");
            // } else if (role === "client") {
            //   navigate("/verification-cases");
            // } else if (role === "admin") {
            //   navigate("/");
            // } else {
            //   navigate("/");
            // }
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch usage data", error);
      toast.error(error.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      {/* LOGO */}
      <div className="text-center mb-6">
        <div className="w-14 h-10 mx-auto rounded-md bg-[#0B1F3A] text-yellow-400 flex items-center justify-center text-sm font-bold   shadow-lg shadow-yellow-500/50 ">
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
      <div className="bg-white w-[320px] items-center  justify-center rounded-2xl shadow-sm p-5">
        <div className=" flex items-center flex-col">
          <h2 className="text-sm font-semibold items-center justify-center text-[#0B1F3A]">
            Login
          </h2>
          <p className="text-[11px] text-gray-400 mb-4">
            Please authenticate to access the portal.
          </p>
        </div>

        {/* TOGGLE */}
        <div className="flex bg-gray-100 rounded-md p-1 mb-4 text-xs">
          <button
            onClick={() => {
              setTab("email");
              setOtpSent(false);
            }}
            className={`w-1/2 py-1 rounded ${
              tab === "email"
                ? "bg-white shadow text-[#0B1F3A]"
                : "text-gray-400"
            }`}
          >
            Email
          </button>
          <button
            onClick={() => {
              setTab("phone");
              setOtpSent(false);
            }}
            className={`w-1/2 py-1 rounded ${
              tab === "phone"
                ? "bg-white shadow text-[#0B1F3A]"
                : "text-gray-400"
            }`}
          >
            Phone
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={(e) => {
            console.log("FORM SUBMIT");
            handleSubmit(onSubmit)(e);
          }}
          className="space-y-3"
        >
          {/* EMAIL */}
          {tab === "email" && (
            <>
              <div>
                <label className="text-[10px] text-gray-500">Email Id</label>
                <Input
                  placeholder="Enter Your Email"
                  {...register("email")}
                  className="mt-1 h-8 text-xs"
                />
                {errors.email && (
                  <p className="text-red-500 text-[10px] mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[10px] text-gray-500">PASSWORD</label>
                <Input
                  type="password"
                  placeholder="Enter Your Password"
                  {...register("password")}
                  className="mt-1 h-8 text-xs"
                />
                {errors.password && (
                  <p className="text-red-500 text-[10px] mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </>
          )}

          {/* PHONE */}
          {tab === "phone" && (
            <>
              <div>
                <label className="text-[10px] text-gray-500">
                  PHONE NUMBER
                </label>
                <Input
                  type="number"
                  placeholder="Enter phone number"
                  {...register("phone")}
                  className="mt-1 h-8 text-xs"
                  disabled={otpSent}
                />
                {errors.phone && (
                  <p className="text-red-500 text-[10px] mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {otpSent && (
                <div>
                  <label className="text-[10px] text-gray-500">OTP</label>
                  <Input
                    type="number"
                    placeholder="Enter OTP"
                    {...register("otp")}
                    className="mt-1 h-8 text-xs"
                  />
                  {errors.otp && (
                    <p className="text-red-500 text-[10px] mt-1">
                      {errors.otp.message}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* BUTTON */}
          <LoadingButton
            type="submit"
            loading={loading}
            className="w-full h-9 bg-primary hover:bg-[#091a30] text-xs cursor-pointer"
          >
            {tab === "phone"
              ? otpSent
                ? "Verify OTP"
                : "Send OTP"
              : "Sign In"}
          </LoadingButton>
        </form>

        {/* FOOTER */}
        <div className="text-center mt-3 text-[10px] text-gray-400">
          <div className="flex justify-between">
            <Link to={"/forgot-password"} className=" hover:underline ">
              Forgot Password?{" "}
            </Link>
            <Link
              to={"/resend-verification-email"}
              className=" hover:underline "
            >
              Resend Verification Email?{" "}
            </Link>
          </div>
          <div>
            <p className="text-primary">
              Don’t have an account?{" "}
              <Link to={"/signup"}>
                {" "}
                <span className="bg-gradient-to-r from-[#8350DF] to-[#FF3BFF] bg-clip-text text-transparent font-semibold cursor-pointer hover:underline">
                  Get Started
                </span>
              </Link>
            </p>
            <span className="text-yellow-500 cursor-pointer">
              Contact IT Support
            </span>
          </div>
        </div>
      </div>

      {/* BOTTOM TEXT */}
      <p className="text-[9px] text-gray-400 mt-5 text-center max-w-xs">
        AUTHORIZED ACCESS ONLY. ALL ACTIVITIES ARE MONITORED AND LOGGED FOR
        SECURITY COMPLIANCE.
      </p>
    </div>
  );
};

export default Login;
