import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import CommonModal from "@/components/common/CommonModal";

const BulkUploadSuccessModal = ({ isOpen, onClose, summary = {} }) => {
  const navigate = useNavigate();

  const formattedId = useMemo(() => {
    if (summary?.uploadId) return summary.uploadId;
    if (summary?.fileUrl)
      return `#BULK-${Math.floor(10000 + Math.random() * 90000)}`;
    return "#BULK-00000";
  }, [summary]);

  return (
    <CommonModal isOpen={isOpen} onClose={onClose} title="">
      <div className="w-full  text-center px-5 ">
        {/* ✅ ICON */}
        <div className="mx-auto w-16 h-16 rounded-full bg-[#f3e6c5] flex items-center justify-center mb-4">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white text-sm font-bold">✓</span>
          </div>
        </div>

        {/* ✅ TITLE */}
        <h2 className="text-xl md:text-2xl font-bold text-[#1f2937] mb-2">
          Bulk Upload Successful
        </h2>

        {/* ✅ DESC */}
        <p className="text-sm text-[#64748b] mb-4 leading-relaxed">
          Your files have been securely transmitted to the Super Admin for bulk
          processing and compliance audit.
        </p>

        {/* ✅ SUMMARY */}
        <div className="bg-white border border-gray-200 rounded-xl px-4 py-4 shadow-sm text-left">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 bg-[#f3e6c5] text-primary rounded flex items-center justify-center text-xs font-bold">
              ≡
            </div>
            <p className="text-[11px] font-semibold tracking-widest text-gray-600 uppercase">
              Upload Summary
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Upload ID</span>
              <span className="font-semibold">{formattedId}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Total Files</span>
              <span className="font-semibold">
                {summary?.totalFiles ?? 1} Files
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Processing Time</span>
              <span className="font-semibold">
                {summary?.processingTime ?? "2-4 Business Hours"}
              </span>
            </div>
          </div>

          {/* PROGRESS */}
          <div className="mt-3">
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-primary rounded-full" />
            </div>

            <p className="text-[10px] text-center mt-1 font-semibold text-primary tracking-widest uppercase">
              Awaiting Verification
            </p>
          </div>
        </div>

        {/* ✅ BUTTONS */}
        <div className="flex flex-col gap-2 mt-4">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-[#c49622] transition"
          >
            Upload More Files
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full py-2.5 rounded-lg border border-[#0b1f3a] text-[#0b1f3a] font-semibold text-sm hover:bg-gray-50 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </CommonModal>
  );
};

export default BulkUploadSuccessModal;
