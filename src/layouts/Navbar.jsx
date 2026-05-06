import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomButton from "@/components/common/Buttons/CustomButton";
import BulkCaseUpload from "@/features/BulkCaseUpload/BulkCaseUpload";
import { useState } from "react";
import CommonModal from "@/components/common/CommonModal";
import useAuthStore from "@/store/useAuthStore";

const Navbar = () => {
  const [openBulkRequestModal, setOpenBulkRequestModal] = useState(false);
  const roleName = useAuthStore((state) => state?.user?.roleName);
  
  return (
    <div className=" relative w-full h-18 bg-white border-b px-6 py-3 md:flex items-center justify-between">
      {/* Left Section */}
      <div>
        
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notification Icon */}
        <div className="relative cursor-pointer">
          <Bell className="text-gray-600" size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

       {(roleName !== "Agent" && roleName !== "QC team") && (
          <CustomButton
            className="bg-primary text-white "
            onClick={() => setOpenBulkRequestModal(true)}
          >
            + Bulk Request
          </CustomButton>
        )}

        {/* Button */}
       {(roleName !== "Agent" && roleName !== "QC team") && (
          <CustomButton
            className="bg-primary text-white"
            onClick={() => {
              window.location.assign("/createnewcase?new=true");
            }}
          >
            + Create New Case
          </CustomButton>
       )}
        <CommonModal
          isOpen={openBulkRequestModal}
          onClose={() => setOpenBulkRequestModal(false)}
          title="Bulk Case Upload"
        >
          <BulkCaseUpload
            setValue={() => {}}
            setUploadedDocPayload={() => {}}
            setLoading={() => {}}
          />
        </CommonModal>
      </div>
    </div>
  );
};

export default Navbar;
