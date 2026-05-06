import CommonModal from "@/components/common/CommonModal";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import RejectedServicesList from "../RejectedService/RejectedServicesList";

const CaseHeader = ({
  showMarkAsComplete = false,
  markAsCompleteLoading = false,
  caseData,
}) => {
  const [rejectedServicesModalOpen, setRejectedServicesModalOpen] = useState(false);
  console.log(caseData, "caseData in header");

  return (
    <div className="sm:flex items-center justify-between">
      <div>
        <div className="flex items-center">
          <Link to={"/"} className="flex">
            <span>
              <ChevronLeft />
            </span>
          </Link>
          <div>
            <p className="font-bold text-textprimary xs:text-md sm:text-2xl">
              Review & Confirm
            </p>
            <p className="text-xs sm:text-sm text-textsecondary">
              CASE ID: {caseData?.case?.caseId}
            </p>
          </div>
        </div>
      </div>

      {/* {showMarkAsComplete && (
        <button
          type="button"
          className="mt-3 sm:mt-0 inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleMarkAsComplete}
          disabled={markAsCompleteLoading}
        >
          {markAsCompleteLoading ? "Initiating..." : "Mark as Complete"}
        </button>
      )} */}



      {showMarkAsComplete && (
        <button
          type="button"
          className="mt-3 sm:mt-0 inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          onClick={() => setRejectedServicesModalOpen(true)}
          disabled={markAsCompleteLoading}
        >
          {markAsCompleteLoading ? "Initiating..." : "Mark as Complete"}
        </button>
      )}
      <CommonModal
        isOpen={rejectedServicesModalOpen}
        onClose={() => setRejectedServicesModalOpen(false)}
        title="Rejected List Services"
      >
        <RejectedServicesList
          caseData={caseData}
          markAsCompleteLoading={markAsCompleteLoading}
          setRejectedServicesModalOpen={setRejectedServicesModalOpen}
        />
      </CommonModal>


    </div>
  );
};

export default CaseHeader;
