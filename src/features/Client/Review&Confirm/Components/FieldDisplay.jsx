import { formatFieldValue } from "./reviewAndConfirmUtils";

const FieldDisplay = ({
  fieldKey,
  value,
  isVerified,
  hasVerificationStatus,
  showVerifyButton = false,
  onVerify,
  canAccessVerification,
}) => {
  const verified = [
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

  const appyVerificationStyles = (status) => {
    const statusObj = verified.find((item) => item.key === status);
    return statusObj || {
      key: "UNKNOWN",
      label: "Unknown",
      styles: "bg-gray-100 text-gray-700",
    };
  };

  const verificationStatusMeta = appyVerificationStyles(isVerified);

  return (
    <div key={fieldKey} className="space-y-1">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-xs text-gray-500 line-clamp-1 ">{fieldKey}</p>
          {hasVerificationStatus && (
            <span
              className={`text-[10px] px-2 py-0.5 font-bold rounded-full ${verificationStatusMeta.styles}`}
            >
              {verificationStatusMeta.label}
            </span>
          )}
        </div>

        {showVerifyButton && canAccessVerification && (
          <button
            type="button"
            className="shrink-0 rounded-md border border-gray-300 px-2 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-100 cursor-pointer"
            onClick={onVerify}
          >
            Verify
          </button>
        )}
      </div>
      <p className="text-sm text-gray-800 break-all">
        {formatFieldValue(value)}
      </p>
    </div>
  );
};

export default FieldDisplay;
