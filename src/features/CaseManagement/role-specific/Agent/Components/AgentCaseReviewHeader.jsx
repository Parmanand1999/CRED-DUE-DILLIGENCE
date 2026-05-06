import CustomButton from "@/components/common/Buttons/CustomButton";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { markCaseAsComplete } from "@/Services/AgentServices";

import { ChevronLeft } from "lucide-react";
import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";

const AgentCaseReviewHeader = ({ caseId, setLoading }) => {
  console.log(caseId,"caseId in header");
  
  const param = useParams();
  const [markAsCompleteLoading, setMarkAsCompleteLoading] = useState(false);
  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  console.log(openConfirmationModal, "openConfirmationModal");
  const handleConfirmation = async () => {
    try {
      setOpenConfirmationModal(false);
      setLoading(true);
      setMarkAsCompleteLoading(true);
      const res = await markCaseAsComplete(param?.caseId);
      console.log(res, "markCaseAsComplete response");
      if (res?.status === 200) {
        toast.success(
          res.data?.message,
          "Case marked as complete successfully",
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to mark case as complete",
      );
      console.log(error, "Error occurred while marking case as complete");
    } finally {
      setOpenConfirmationModal(false);
      setMarkAsCompleteLoading(false);
      setLoading(false);
    }
  };
  return (
    <div className="flex justify-between">
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
            CASE ID: {caseId || "N/A"}
          </p>
        </div>
      </div>
      <CustomButton
        type="button"
        className="mt-3 sm:mt-0 inline-flex items-center rounded-md bg-emerald-600 px-4 py-4 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
        onClick={() => setOpenConfirmationModal(true)}
        disabled={markAsCompleteLoading}
      >
        {markAsCompleteLoading ? "Initiating..." : "Mark as Complete"}
      </CustomButton>

      <ConfirmationModal
        openConfirmModal={openConfirmationModal}
        handleCancel={() => setOpenConfirmationModal(false)}
        handleConfirmation={handleConfirmation}
        type="warning"
        buttonText="Yes, Mark as Complete"
        confButtonCassName="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600 disabled:hover:bg-emerald-600"
        descText="Are you sure you want to mark this case as complete?"
      />
    </div>
  );
};
export default AgentCaseReviewHeader;
