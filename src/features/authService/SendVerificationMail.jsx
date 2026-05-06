import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IoMailOutline } from "react-icons/io5";

const SendVerificationMail = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { email } = location.state || {};

  //   useEffect(() => {
  //     if (!email) {
  //       navigate("/login");
  //     }
  //   }, [email]);

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
      <div className="bg-white w-[320px] rounded-2xl shadow-sm p-5 text-center">
        {/* ICON */}
        <div className="flex justify-center mb-3">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <IoMailOutline className="text-3xl text-primary" />
          </div>
        </div>

        {/* TITLE */}
        <h2 className="text-sm font-semibold text-[#0B1F3A]">
          Check your email
        </h2>

        <p className="text-[11px] text-gray-400 mt-1">
          We’ve sent a verification link to:
        </p>

        {/* EMAIL */}
        <p className="text-xs font-medium text-primary mt-1">{email}</p>

        {/* RESEND */}
        <p className="text-[10px] text-gray-400 mt-3">
          Didn’t receive the email?{" "}
          <span
            onClick={() => navigate("/resend-verification-email")}
            className="text-yellow-500 cursor-pointer underline"
          >
            Resend
          </span>
        </p>

        {/* ACTIONS */}
        <div className="flex justify-between mt-4 text-[10px]">
          <span
            onClick={() => navigate("/login")}
            className="cursor-pointer text-gray-400 underline"
          >
            Back to login
          </span>

          <span
            onClick={() => navigate("/update-email")}
            className="cursor-pointer text-gray-400 underline"
          >
            Update Email
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

export default SendVerificationMail;
