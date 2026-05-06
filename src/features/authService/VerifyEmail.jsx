import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { IoMailOutline } from "react-icons/io5";
import { verifyEmailApi } from "@/Services/authService";


const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const level = searchParams.get("level");
  console.log(searchParams, "searchParams");

  console.log(token, "token");
  console.log(level, "level");

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  //////////////////////////////////////////////////////////
  // 🔥 VERIFY API CALL
  //////////////////////////////////////////////////////////
  useEffect(() => {
    if (!token) {
      setIsError(true);
      setMessage("Invalid verification link");
      setLoading(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await verifyEmailApi(token);

        if (res.status === 200) {
          setMessage(res.data.message || "Email verified successfully!");
          toast.success("Email verified successfully");
        }
      } catch (error) {
        setIsError(true);
        setMessage(
          error.response?.data?.message ||
            "Invalid or expired verification link",
        );
        toast.error("Verification failed");
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token]);

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
      <div className="bg-white w-[320px] rounded-2xl shadow-sm p-5 text-center">
        <div
          className={`mx-auto flex items-center justify-center rounded-full w-16 h-16 ${
            isError ? "bg-red-100" : "bg-green-100"
          }`}
        >
          <div
            className={`rounded-full w-12 h-12 flex items-center justify-center ${
              isError ? "bg-red-200" : "bg-green-200"
            }`}
          >
            <IoMailOutline
              className={`w-6 h-6 ${
                isError ? "text-red-600" : "text-green-600"
              }`}
            />
          </div>
        </div>

        {/* MESSAGE */}
        <h3
          className={`mt-4 text-sm font-semibold ${
            isError ? "text-red-500" : "text-green-600"
          }`}
        >
          {loading ? "Please wait..." : message}
        </h3>

        {/* BUTTON */}
        <button
          onClick={() => navigate("/login")}
          className="mt-4 text-xs text-yellow-500 hover:underline"
        >
          Back to Login
        </button>
      </div>

      {/* FOOTER */}
      <p className="text-[9px] text-gray-400 mt-5 text-center max-w-xs">
        AUTHORIZED ACCESS ONLY. ALL ACTIVITIES ARE MONITORED AND LOGGED FOR
        SECURITY COMPLIANCE.
      </p>
    </div>
  );
};

export default VerifyEmail;
