import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import FormCard from "./FormCard";
import { CreditCard } from "lucide-react";

const FinancialDetails = ({ control, errors }) => {
  return (
    <FormCard title="FINANCIAL DETAILS" icon={<CreditCard size={16} />}>
      <div className="space-y-4">
        {/* PAN */}
        <div>
          <p className="text-xs text-gray-500 mb-1">PAN NUMBER</p>
          <Controller
            name="pan"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="ABCDE1234F" />
            )}
          />
          <p className="text-red-500 text-xs mt-1">{errors.pan?.message}</p>
        </div>

        {/* AADHAAR */}
        <div>
          <p className="text-xs text-gray-500 mb-1">AADHAAR NUMBER</p>
          <Controller
            name="aadhaar"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="XXXX XXXX XXXX" />
            )}
          />
          <p className="text-red-500 text-xs mt-1">{errors.aadhaar?.message}</p>
        </div>

        {/* GST (OPTIONAL) */}
        <div>
          <p className="text-xs text-gray-500 mb-1">GST NUMBER (OPTIONAL)</p>
          <Controller
            name="gst"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="22AAAAA0000A1Z5" />
            )}
          />
          <p className="text-red-500 text-xs mt-1">{errors.gst?.message}</p>
        </div>
      </div>
    </FormCard>
  );
};

export default FinancialDetails;
