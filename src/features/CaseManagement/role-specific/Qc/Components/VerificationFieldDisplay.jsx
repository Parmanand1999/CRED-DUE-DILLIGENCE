import { useState } from "react";

import FinalizeVerificationModal from "@/features/CaseManagement/components/FinalizeVerificationModal";
import { finalizeAgentVerifyCaseService, getPrevverifyData } from "@/Services/AgentServices";
import { formatFieldValue } from "@/features/CaseManagement/components/reviewAndConfirmUtils";

const verificationStatusList = [
  {
    key: "PENDING",
    label: "Pending",
    styles: "bg-amber-100 text-amber-700",
  },
  {
    key: "VERIFIED",
    label: "Verified",
    styles: "bg-green-100 text-green-700",
  },
  {
    key: "REJECTED",
    label: "Rejected",
    styles: "bg-red-100 text-red-700",
  },
  {
    key: "PARTIAL",
    label: "Partial",
    styles: "bg-blue-100 text-blue-700",
  },
];

const getVerificationStatusMeta = (status) => {
  return (
    verificationStatusList.find(
      (item) => item.key === status
    ) || {
      key: "UNKNOWN",
      label: "Unknown",
      styles: "bg-gray-100 text-gray-700",
    }
  );
};

const VerificationFieldDisplay = ({
  fieldKey,
  value,
  verificationStatus,
  subCategoryData,
  fetchCaseDetails,
  fetchVerificationData,
}) => {
  const statusMeta =
    getVerificationStatusMeta(verificationStatus);
  const [isVeryficationModalOpen, setIsVerificationModalOpen] = useState(false);
  const handleStartVerification = (payload) => {
    return getPrevverifyData(payload);
  };

  const handleFinalizeVerification = (payload) => {
    return finalizeAgentVerifyCaseService(payload);
  };
  return (
    <div className="space-y-1">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-xs text-gray-500 line-clamp-1">
            {fieldKey}
          </p>

          <span
            className={`text-[10px] px-2 py-0.5 font-bold rounded-full ${statusMeta.styles}`}
          >
            {statusMeta.label}
          </span>
        </div>

        {/* {statusMeta.key !== "COMPLETED" && (
          <button
            type="button"
            className="shrink-0 rounded-md border border-gray-300 px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
            onClick={() => setIsVerificationModalOpen(true)}
          >
            Verify
          </button>
        )} */}
      </div>

      <p className="text-sm text-gray-800 break-all">
        {formatFieldValue(value)}
      </p>

      <FinalizeVerificationModal
        isOpen={isVeryficationModalOpen}
        onClose={() => { setIsVerificationModalOpen(false); }}
        subCategoryData={subCategoryData}
        verificationMode="field"
        targetKeyName={fieldKey}
        fetchCaseDetails={fetchCaseDetails}
        fetchVerificationData={fetchVerificationData}
        handleStartVerification={handleStartVerification}
        handleFinalizeVerification={handleFinalizeVerification}
      />
    </div>
  );
};

export default VerificationFieldDisplay;