import React from "react";
import { Check } from "lucide-react";
import CustomButton from "@/components/common/Buttons/CustomButton";

const CaseSuccessModal = ({
  open,
  onClose,
  onCreateNew,
  onGoHome,
  caseId = "CRD-82910",
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* MODAL BOX */}
      <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6 text-center">
        {/* ICON */}
        <div className="flex justify-center mb-4">
          <div className="bg-orange-100 p-4 rounded-full">
            <div className="bg-primary  text-white p-3 rounded-full">
              <Check size={24} />
            </div>
          </div>
        </div>

        {/* TITLE */}
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Case Created Successfully
        </h2>

        {/* DESCRIPTION */}
        <p className="text-gray-500 text-sm mb-6">
          Your verification case (ID: {caseId}) has been submitted.
        </p>

        {/* BUTTONS */}
        <div className="space-y-3">
          {/* CREATE NEW */}
          <CustomButton
            onClick={onCreateNew}
            className="w-full bg-primary hover:bg-[#d97706] text-white font-semibold py-2 rounded-lg transition"
          >
            CREATE NEW CASE
          </CustomButton>

          {/* GO HOME */}
          <CustomButton
            onClick={onGoHome}
            className="w-full border border-textprimary  hover:bg-[#0f172a]  bg-white font-bold text-textprimary hover:text-white"
          >
            GO TO HOME
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default CaseSuccessModal;
