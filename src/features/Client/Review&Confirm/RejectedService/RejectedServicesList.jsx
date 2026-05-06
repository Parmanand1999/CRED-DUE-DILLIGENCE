import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Building2,
  User,
  IndianRupee,
  FileWarning,
} from "lucide-react";
import { toast } from "react-toastify";
import { moveServiceToPhysical, finalCompleteCaseService, initiateCaseAssignment, viewCaseDetails } from "@/Services/CasesManagmentServices";
import CustomButton from "@/components/common/Buttons/CustomButton";
import CommonModal from "@/components/common/CommonModal";
import RemarkRejectedService from "./RemarkRejectedService";
import { useParams } from "react-router-dom";
import CustomLoader from "@/components/common/CustomLoader";

const RejectedServicesList = ({
  setRejectedServicesModalOpen

}) => {
  const param = useParams()
  const [loading, setLoading] = useState(false);
  const [storeMoveData, setStoreMoveData] = useState(null);
  const [markAsCompleteLoading, setMarkAsCompleteLoading] = useState(false);
  const [isOpenRejectRemarkModal, setIsOpenRejectRemarkModal] = useState(false);
  const [caseData, setCaseData] = useState(null);

  useEffect(() => {
    fetchCaseDetails();
  }, []);

  const fetchCaseDetails = async () => {
    setLoading(true);
    try {
      const res = await viewCaseDetails(`${param.id}`);
      if (res.status === 200) {
        setCaseData(res.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsComplete = async () => {
    const caseId = String(param?.id || "");
    if (!caseId || markAsCompleteLoading) {
      return;
    }

    try {
      setLoading(true)
      setMarkAsCompleteLoading(true);
      const response = await initiateCaseAssignment({ caseId });

      if (response.status === 200) {
        toast.success(response?.data?.data?.message);
        setRejectedServicesModalOpen(false)
      } else {
        toast.error(response?.data?.data?.message);
      }

      const pendingServices = Array.isArray(response?.data?.data?.pendingServices)
        ? response?.data?.data?.pendingServices.filter(Boolean)
        : [];

      if (pendingServices.length) {
        toast.info(`Pending services: ${pendingServices.join(", ")}`);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to initiate assignment.",
      );
    } finally {
      setLoading(false)
      setMarkAsCompleteLoading(false);
    }
  };
  // Only FAILED status subcategories
  const failedServices = caseData?.services
    ?.map((service) => ({
      ...service,
      subCategories:
        service?.subCategories?.filter(
          (sub) => sub?.status === "FAILED"
        ) || [],
    }))
    .filter((service) => service?.subCategories?.length > 0);

  return (
    <div className="space-y-6">
      {loading && <CustomLoader />}

      {failedServices?.length === 0 ?
        (<div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <FileWarning className="text-gray-400" size={42} />
            <h2 className="text-lg font-semibold text-gray-700">
              No Rejected Services Found
            </h2>
            <p className="text-sm text-gray-500">
              No subcategory with FAILED status is available.
            </p>
          </div>
        </div>)
        : (

          failedServices?.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border shadow-sm overflow-hidden"
            >
              {/* Category Header */}
              <div className="bg-red-50 border-b px-6 py-4 flex items-center gap-3">
                <Building2 className="text-red-500" size={20} />
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    {service?.category?.name || "-"}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {service?.category?.code || "-"}
                  </p>
                </div>
              </div>

              {/* Failed Subcategories */}
              <div className="p-5 space-y-4">
                {service?.subCategories?.map((sub) => (

                  <div
                    key={sub?._id}
                    className="border rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Left */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle
                            className="text-red-500"
                            size={18}
                          />
                          <h3 className="font-semibold text-gray-800">
                            {sub?.name || "-"}
                          </h3>
                        </div>

                        <p className="text-sm text-gray-500">
                          {sub?.code || "-"}
                        </p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User size={15} />
                            {sub?.assignedTo?.name || "Not Assigned"}
                          </div>

                          <div className="flex items-center gap-1">
                            <IndianRupee size={15} />
                            {sub?.price || 0}
                          </div>
                        </div>
                      </div>

                      {/* Right */}
                      <div className="flex flex-col items-start md:items-end gap-3">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            FAILED
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 max-w-sm text-left md:text-right">
                          {sub?.remarks || "No remarks available"}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <CustomButton
                            onClick={() => {
                              setStoreMoveData({ serviceId: sub?._id, surviseName: sub?.name, remarks: sub?.remarks })
                              setIsOpenRejectRemarkModal(true)
                            }}
                            isLoading={loading}
                          // className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition"
                          >Move</CustomButton>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))

        )}



      {/* {onMarkAsComplete && ( */}
      <div className="mt-8 pt-4 border-t flex justify-end">
        <CustomButton
          onClick={handleMarkAsComplete}
          isLoading={markAsCompleteLoading}
        // className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
        >
          {markAsCompleteLoading ? "Initiating..." : "Final Complete"}
        </CustomButton>
      </div>
      {/* )} */}
      <CommonModal
        isOpen={isOpenRejectRemarkModal}
        onClose={() => setIsOpenRejectRemarkModal(false)}
        title="Move to Physical Verification"
        bgHeaderColor="bg-red-100 rounded-t-md"
      > <RemarkRejectedService storeMoveData={storeMoveData} setIsOpenRejectRemarkModal={setIsOpenRejectRemarkModal} fetchCaseDetails={fetchCaseDetails} />
      </CommonModal>
    </div>
  );
};

export default RejectedServicesList;