import { Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import FormCard from "./FormCard";
import { MapPin } from "lucide-react";

const AddressDetails = ({ control, errors }) => {
  return (
    <FormCard title="ADDRESS DETAILS" icon={<MapPin size={16} />}>
      <div className="space-y-4">
        {/* ADDRESS */}
        <div>
          <p className="text-xs text-gray-500 mb-1">CURRENT ADDRESS</p>
          <Controller
            name="currentAddress"
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder="Street, Apartment, Landmark" />
            )}
          />
          <p className="text-red-500 text-xs mt-1">
            {errors.currentAddress?.message}
          </p>
        </div>

        {/* CITY + STATE */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">CITY</p>
            <Controller
              name="city"
              control={control}
              render={({ field }) => <Input {...field} placeholder="City" />}
            />
            <p className="text-red-500 text-xs mt-1">{errors.city?.message}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">STATE</p>
            <Controller
              name="state"
              control={control}
              render={({ field }) => <Input {...field} placeholder="State" />}
            />
            <p className="text-red-500 text-xs mt-1">{errors.state?.message}</p>
          </div>
        </div>

        {/* PINCODE + LAT + LONG */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">PINCODE</p>
            <Controller
              name="pincode"
              control={control}
              render={({ field }) => <Input {...field} placeholder="000000" />}
            />
            <p className="text-red-500 text-xs mt-1">
              {errors.pincode?.message}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">LAT</p>
            <Controller
              name="lat"
              control={control}
              render={({ field }) => <Input {...field} placeholder="0.000" />}
            />
            <p className="text-red-500 text-xs mt-1">{errors.lat?.message}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">LONG</p>
            <Controller
              name="long"
              control={control}
              render={({ field }) => <Input {...field} placeholder="0.000" />}
            />
            <p className="text-red-500 text-xs mt-1">{errors.long?.message}</p>
          </div>
        </div>
      </div>
    </FormCard>
  );
};

export default AddressDetails;
