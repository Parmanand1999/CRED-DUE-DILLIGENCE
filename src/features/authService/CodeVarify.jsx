import React, { useState } from "react";
import {
  Button,
  TextField,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Email, Visibility, VisibilityOff } from "@mui/icons-material";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { FaFacebook, FaApple, FaMicrosoft } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import micosoftimg from "../assets/images/microsoftimg.png";
import * as Yup from "yup";
import LoginNav from "./LoginNav";
import { IoIosArrowBack } from "react-icons/io";
import { Link } from "react-router-dom";
import LeftSideBanner from "./LeftSideBanner";

const CodeVarify = () => {
  const [showPassword, setShowPassword] = useState(false);

  // Validation Schema
  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  // Initial Form Values
  const initialValues = {
    email: "",
    password: "",
    rememberMe: false, // Added remember me state
  };

  // Form Submission
  const handleSubmit = (values) => {
    console.log("Form Submitted:", values);
  };

  return (
    <div className="min-h-screen">
      <LoginNav buttontext={"Log In"} />
      <div className="flex items-center justify-center">
        <div className="flex w-[100%] bg-white shadow-lg rounded-lg overflow-hidden p-6">
          {/* Left Side: Banner */}
          <div className="w-1/2 min-h-[80vh] p-2 space-y-1 relative ">
            <div className="w-[90%]">
              <Link to={"/login"}>
                <p className="text-xs ml-14 text-left text-gray-500 p-2 flex items-center">
                  <IoIosArrowBack className="text-center" />{" "}
                  <span>Back to login</span>
                </p>
              </Link>
              <h3 className="text-3xl font-semibold ml-[4rem] text-left">
                Forgot your password?
              </h3>
              <p className=" text-xs ml-14 text-left text-gray-500 p-2">
                Don’t worry, happens to all of us. Enter your email below
                <br /> to recover your password
              </p>

              {/* Formik Form */}
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ values, handleChange, handleBlur, touched, errors }) => (
                  <Form className="w-full max-w-md mx-auto space-y-3 gap-2">
                    {/* Email Field with Icon */}
                    <Field
                      as={TextField}
                      name="email"
                      placeholder="Enter your email"
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": { borderRadius: "5px" },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email />
                          </InputAdornment>
                        ),
                      }}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(errors.email && touched.email)}
                      helperText={touched.email && errors.email}
                    />

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      fullWidth
                      sx={{
                        bgcolor: "#6941C6",
                        color: "white",
                        "&:hover": { bgcolor: "#5a34a1" },
                        marginTop: "5px",
                      }}
                    >
                      Submit
                    </Button>
                  </Form>
                )}
              </Formik>
              {/* Social Login Buttons */}
              <div className="flex items-center justify-center my-2 w-[75%] ml-16">
                <div className="flex-grow border-t border-gray-400"></div>
                <span className="px-4 text-gray-500 text-sm font-medium whitespace-nowrap">
                  or with email
                </span>
                <div className="flex-grow border-t border-gray-400"></div>
              </div>
              <div className="flex justify-center gap-2">
                <div className="border p-4 rounded-lg shadow-md text-xl">
                  <FaApple />
                </div>
                <div className="border p-4 rounded-lg shadow-md text-red-500 text-xl">
                  <FcGoogle />
                </div>
                <div className="border p-4 rounded-lg shadow-md text-blue-700 text-xl">
                  <FaFacebook />
                </div>
                <div className="border p-4 rounded-lg shadow-md text-blue-800 text-xl">
                  <img src={micosoftimg} alt="msf" />
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className=" absolute  bottom-0 left-0 right-0 flex justify-between text-gray-500 text-xs p-2">
              <p>Privacy Policy</p>
              <p>{new Date().getFullYear()} © VETGPT</p>
            </div>
          </div>

          {/* Right Side: Login Form */}
          {/* <div className="flex min-h-[80vh] w-1/2 bg-blue-500 items-center justify-center text-white text-3xl font-bold p-10">
            <p>Welcome to Our Platform</p>
          </div> */}
          <LeftSideBanner />
        </div>
      </div>
    </div>
  );
};

export default CodeVarify;
