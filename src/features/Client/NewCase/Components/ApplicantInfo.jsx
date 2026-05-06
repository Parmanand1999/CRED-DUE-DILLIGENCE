import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import FormCard from "./FormCard";
import { User } from "lucide-react";

const ApplicantInfo = ({ control, errors }) => {
  return (
    <FormCard title="APPLICANT INFORMATION" icon={<User size={16} />}>
      <div className="space-y-4">
        {/* FULL NAME */}
        <div>
          <p className="text-xs text-gray-500 mb-1">APPLICANT NAME</p>
          <Controller
            name="fullName"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Enter full name" />
            )}
          />
          <p className="text-red-500 text-xs mt-1">
            {errors.fullName?.message}
          </p>
        </div>

        {/* FATHER NAME + MOBILE */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">FATHER'S NAME</p>
            <Controller
              name="fatherName"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="Enter father's name" />
              )}
            />
            <p className="text-red-500 text-xs mt-1">
              {errors.fatherName?.message}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">MOBILE NUMBER</p>
            <Controller
              name="mobile"
              control={control}
              render={({ field }) => <Input {...field} placeholder="+91" />}
            />
            <p className="text-red-500 text-xs mt-1">
              {errors.mobile?.message}
            </p>
          </div>
        </div>

        {/* DOB + EMAIL */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">DOB</p>
            <Controller
              name="dob"
              control={control}
              render={({ field }) => <Input type="date" {...field} />}
            />
            <p className="text-red-500 text-xs mt-1">{errors.dob?.message}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">EMAIL</p>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="example@company.com" />
              )}
            />
            <p className="text-red-500 text-xs mt-1">{errors.email?.message}</p>
          </div>
        </div>
      </div>
    </FormCard>
  );
};

export default ApplicantInfo;
