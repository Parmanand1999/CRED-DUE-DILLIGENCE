import React, { useState } from "react";
import {
  Button,
  TextField,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

import LoginNav from "./LoginNav";
import { IoMailOutline } from "react-icons/io5";

import { MdArrowBack } from "react-icons/md";
import { FaRegCircleCheck } from "react-icons/fa6";
import { Link } from "react-router-dom";
import LeftSideBanner from "./LeftSideBanner";

const ResetSuccPassword = () => {
  return (
    <div className="min-h-screen">
      <LoginNav buttontext={"Log In"} />
      <div className="flex items-center justify-center">
        <div className="flex w-[100%] bg-white shadow-lg rounded-lg overflow-hidden p-6">
          {/* Right Side: Login Form */}

          <div className="w-1/2 min-h-[80vh] p-2 flex flex-col justify-center items-center relative">
            <div className="w-[90%] text-center flex flex-col items-center">
              <p className="text-xs text-gray-500 p-2 flex justify-center items-center rounded-full w-16 h-16 bg-green-100">
                <p className="text-xs text-gray-500 p-2 flex justify-center items-center rounded-full w-12 h-12 bg-green-200">
                  <FaRegCircleCheck className="w-6 h-6 text-[#039855]" />
                </p>
              </p>
              <h3 className="text-3xl font-semibold">Password reset</h3>
              <p className="text-xs text-gray-500 p-2">
                Your password has been successfully reset.
                <br /> Click below to log in magically.
              </p>

              <div className="w-full max-w-md mx-auto space-y-3">
                <Button
                  type="submit"
                  fullWidth
                  sx={{
                    bgcolor: "#6941C6",
                    color: "white",
                    "&:hover": { bgcolor: "#5a34a1" },
                  }}
                >
                  Continue
                </Button>
              </div>

              <Link to={"/login"}>
                <p className="text-sm  text-left  p-2 flex items-center">
                  <MdArrowBack className="text-center" />{" "}
                  <span>Back to log in</span>
                </p>
              </Link>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-gray-500 text-xs p-2">
              <p>Privacy Policy</p>
              <p>{new Date().getFullYear()} © VETGPT</p>
            </div>
          </div>

          {/* Left Side: Banner */}
          {/* <div className="flex min-h-[80vh] w-1/2 bg-blue-500 items-center justify-center text-white text-3xl font-bold p-10">
                        <p>Welcome to Our Platform</p>
                    </div> */}

          <LeftSideBanner />
        </div>
      </div>
    </div>
  );
};

export default ResetSuccPassword;
