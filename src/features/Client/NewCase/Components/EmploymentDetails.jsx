import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import FormCard from "./FormCard";
import { Briefcase } from "lucide-react";

const EmploymentDetails = ({ control, errors }) => {
  return (
    <FormCard title="EMPLOYMENT DETAILS" icon={<Briefcase size={16} />}>
      <div className="space-y-4">
        {/* COMPANY NAME */}
        <div>
          <p className="text-xs text-gray-500 mb-1">COMPANY NAME</p>
          <Controller
            name="companyName"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Full legal company name" />
            )}
          />
          <p className="text-red-500 text-xs mt-1">
            {errors.companyName?.message}
          </p>
        </div>

        {/* DESIGNATION */}
        <div>
          <p className="text-xs text-gray-500 mb-1">DESIGNATION</p>
          <Controller
            name="designation"
            control={control}
            render={({ field }) => <Input {...field} placeholder="Job Title" />}
          />
          <p className="text-red-500 text-xs mt-1">
            {errors.designation?.message}
          </p>
        </div>

        {/* SALARY */}
        <div>
          <p className="text-xs text-gray-500 mb-1">SALARY (ANNUAL)</p>
          <Controller
            name="salary"
            control={control}
            render={({ field }) => <Input {...field} placeholder="₹ 0.00" />}
          />
          <p className="text-red-500 text-xs mt-1">{errors.salary?.message}</p>
        </div>
      </div>
    </FormCard>
  );
};

export default EmploymentDetails;
