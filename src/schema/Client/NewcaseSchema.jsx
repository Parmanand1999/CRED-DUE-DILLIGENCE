// schema/caseSchema.js

import { z } from "zod";

export const NewcaseSchema = z.object({
  // service: z.string().min(1, "Service is required"),

  fullName: z.string().min(1, "Full name is required"),
  fatherName: z.string().min(1, "Father name is required"),
  mobile: z.string().min(10, "Valid mobile required"),
  dob: z.string().min(1, "DOB required"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address"),

  currentAddress: z.string().min(1, "Address required"),
  city: z.string().min(1, "City required"),
  state: z.string().min(1, "State required"),
  pincode: z.string().max(6, "Invalid pincode").min(1, "PinCode required"),
  lat: z.string().min(1, "Lat required"),
  long: z.string().min(1, "Long required"),

  companyName: z.string().min(1, "Company name required"),
  designation: z.string().min(1, "Designation required"),
  salary: z
    .string()
    .min(1, "salary required")
    .regex(/^\d+$/, "Salary must be a number"),

  pan: z
    .string()
    .min(1, "Pan No. required")
    .max(10, "Invalid PAN")
    .regex(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, "Invalid PAN"),
  aadhaar: z
    .string()
    .min(1, "Aadhaar No. required")
    .regex(/^\d{12}$/, "Aadhaar must be 12 digits"),
  gst: z
    .string() //.min(1, "GST No. required")
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/,
      "Invalid GST",
    )
    .optional(),
});
