import CustomButton from '@/components/common/Buttons/CustomButton';
import CustomLoader from "@/components/common/CustomLoader";
import { Input } from '@/components/ui/input';
import { moveServiceToPhysical } from '@/Services/CasesManagmentServices';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';

const RemarkRejectedService = ({ storeMoveData, setIsOpenRejectRemarkModal, fetchCaseDetails }) => {
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setRemark(storeMoveData?.remarks)
  }, [storeMoveData])
  const moveToPhysical = async (serviceId, remarks) => {
    try {
      setLoading(true);
      const payload = {
        serviceId: serviceId,
        remarks: remarks,
      };
      const res = await moveServiceToPhysical(payload);


      if (res.status === 200) {
        toast.success(res?.data?.message || `Service moved to physical successfully`);
        setIsOpenRejectRemarkModal(false);
        fetchCaseDetails()
      }
    } catch (error) {
      console.log(error, "error");
      toast.error(error?.response?.data?.message || `Failed to move service to physical`);
    } finally {
      // setIsOpenRejectRemarkModal(false);
      setLoading(false);
    }
  };



  return (
    <div className=" items-center">
      {loading && <CustomLoader />}
      <p className="text-lg font-bold  text-[#0f172a] mb-2">{storeMoveData?.surviseName}</p>
      <label htmlFor="remark" className="block text-sm font-medium text-gray-700">
        Remark <span className="text-red-500">*</span>
      </label>
      <Input
        type="text"
        id="remark"
        value={remark}
        onChange={(e) => setRemark(e.target.value)}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
      />
      <div className="mt-6 flex justify-end gap-3">
        <CustomButton
          variant="outline"
          onClick={() => setIsOpenRejectRemarkModal(false)}

          className="rounded-lg px-5 py-2 text-sm"
        >
          Cancel
        </CustomButton>
        <CustomButton
          onClick={() => moveToPhysical(storeMoveData.serviceId, remark)}
          // disabled={!remark.trim()}
          isLoading={loading}
          className="rounded-lg px-5 py-2 text-sm bg-[#f59e0b] hover:bg-[#f59e0b]/80 "
        >
          Move to Physical
        </CustomButton>
      </div>
    </div>
  )
}

export default RemarkRejectedService