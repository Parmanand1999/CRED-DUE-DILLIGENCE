import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/common/Buttons/CustomButton";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { organizationData, signupApi } from "@/Services/authService";
import { Eye, EyeOff } from "lucide-react";

//////////////////////////////////////////////////////////
// 🔥 VALIDATION SCHEMA
//////////////////////////////////////////////////////////
const schema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .regex(/^[A-Za-z\s]+$/, "Only letters allowed"),

    lastName: z
      .string()
      .min(1, "Last name is required")
      .regex(/^[A-Za-z\s]+$/, "Only letters allowed"),

    email: z.string().min(1, "Email is required").email("Enter valid email"),

    mobileNumber: z
      .string()
      .min(10, "Enter valid number")
      .max(10, "Enter valid number")
      .regex(/^[0-9]+$/, "Only numbers allowed"),

    gender: z.string().min(1, "Select gender"),

    organizationName: z.string().min(1, "Organization is required"),
    organizationTypeId: z.string().min(1, "Select organization type"),
    password: z
      .string()
      .min(6, "Minimum 6 characters")
      .regex(/[A-Z]/, "At least one uppercase letter")
      .regex(/[0-9]/, "At least one number")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "At least one special character"),

    confirmPassword: z.string(),
    branchCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

//////////////////////////////////////////////////////////
// 🔥 COMPONENT
//////////////////////////////////////////////////////////
const SignUp = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [organizationDataList, setOrganizationDataList] = useState([]);
  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    try {
      setLoading(true);
      const res = await organizationData();
      if (res.status === 200) {
        console.log(res.data.data, "organization list");
        setOrganizationDataList(res.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch organizations");
    } finally {
      setLoading(false);
    }
  };

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobileNumber: "",
      gender: "",
      organizationName: "",
      organizationTypeId: "",
      password: "",
      confirmPassword: "",

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
    console.log(data, "data");

    try {
      setLoading(true);

      const res = await signupApi({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        mobileNumber: data.mobileNumber,
        gender: data.gender,
        organizationName: data.organizationName,
        password: data.password,
        organizationTypeId: data.organizationTypeId,
        ...(data.branchCode && { branchCode: data.branchCode }),
      });

      if (res.status === 200) {
        toast.success(res.data.message || "Signup successful");

        navigate("/sendverification-mail", {
          state: { email: data.email },
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
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
        <h1 className="mt-2 text-sm font-semibold tracking-wide text-[#0B1F3A]">
          CREDUBLANCE
        </h1>
        <p className="text-[10px] text-gray-400 tracking-widest">
          ROLE-BASED ACCESS CONTROL
        </p>
      </div>

      {/* CARD */}
      <div className="bg-white w-[380px] rounded-2xl shadow-sm p-5">
        <div className="text-center">
          <h2 className="text-sm font-semibold text-[#0B1F3A]">
            Create Account
          </h2>
          <p className="text-[11px] text-gray-400 mb-4">
            Sign up to get started
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {/* NAME */}
          <div className="flex gap-2">
            <Input
              placeholder="First Name"
              {...register("firstName")}
              className="h-8 text-xs"
            />
            <Input
              placeholder="Last Name"
              {...register("lastName")}
              className="h-8 text-xs"
            />
          </div>

          {(errors.firstName || errors.lastName) && (
            <p className="text-red-500 text-[10px]">
              {errors.firstName?.message || errors.lastName?.message}
            </p>
          )}

          {/* EMAIL */}
          <div>
            <Input
              placeholder="Email"
              {...register("email")}
              className="h-8 text-xs"
            />
            {errors.email && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* MOBILE */}
          <div>
            <Input
              placeholder="Mobile Number"
              {...register("mobileNumber")}
              className="h-8 text-xs"
            />
            {errors.mobileNumber && (
              <p className="text-red-500 text-[10px] mt-1">
                {errors.mobileNumber.message}
              </p>
            )}
          </div>
          <div className="flex gap-2 w-full">
            {/* GENDER */}
            <div className="w-full">
              <select
                {...register("gender")}
                className="w-full h-8 text-xs border rounded px-2"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>

              {errors.gender && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errors.gender.message}
                </p>
              )}
            </div>
            <div className="w-full">
              <select
                {...register("organizationTypeId")}
                className="w-full h-8 text-xs border rounded px-2 line-clamp-1"
              >
                <option value="" disabled>
                  Select Organization Type
                </option>
                {organizationDataList.map((org) => (
                  <option key={org._id} value={org._id}>
                    {org.name}
                  </option>
                ))}
              </select>

              {errors.organizationTypeId && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errors.organizationTypeId.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex  gap-2">
            <div>
              <Input
                placeholder="Branch Code (Optional)"
                {...register("branchCode")}
                className="h-8 text-xs"
              />
            </div>
            {/* ORGANIZATION */}
            <div >
              <Input
                placeholder="Organization Name"
                {...register("organizationName")}
                className="h-8 text-sm"
              />
              {errors.organizationName && (
                <p className="text-red-500 text-[10px] mt-1">
                  {errors.organizationName.message}
                </p>
              )}
            </div>
          </div>





          <div className="flex gap-2">
            {/* PASSWORD */}
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                {...register("password")}
                className="h-8 text-xs pr-8"
              />
              <div
                className="absolute right-2 top-2 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </div>
            </div>

            {errors.password && (
              <p className="text-red-500 text-[10px]">
                {errors.password.message}
              </p>
            )}

            {/* CONFIRM PASSWORD */}
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                {...register("confirmPassword")}
                className="h-8 text-xs pr-8"
              />
              <div
                className="absolute right-2 top-2 cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </div>
            </div>

            {errors.confirmPassword && (
              <p className="text-red-500 text-[10px]">
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
            Sign Up
          </LoadingButton>
        </form>

        {/* LOGIN LINK */}
        <div className="text-center mt-3 text-[10px] text-gray-400">
          Already have an account?{" "}
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

export default SignUp;
