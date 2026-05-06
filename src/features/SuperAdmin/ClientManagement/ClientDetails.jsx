import React from "react";
import CommonModal from "@/components/common/CommonModal";
import {
  Mail,
  Phone,
  Building2,
  Calendar,
  ShieldCheck,
  User,
  BadgeCheck,
} from "lucide-react";

const ClientDetails = ({ isOpen, onClose, client }) => {
  if (!client) return null;

  const {
    name,
    email,
    mobileNumber,
    branchCode,
    organization,
    status,
    createdAt,
    updatedAt,
    gender,
    roleName,
    isEmailVerified,
    isMobileVerified,
  } = client;

  const formattedDate = (date) =>
    date ? new Date(date).toLocaleDateString() : "-";

  return (
    <CommonModal isOpen={isOpen} onClose={onClose} title="Client Details">
      <div className="p-6 space-y-6">

        {/* 🔹 Header */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-semibold text-gray-800">{name || "-"}</h2>
          <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
            <Mail size={14} /> {email || "-"}
          </p>
        </div>

        {/* 🔹 Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Mobile */}
          <div className="flex items-start gap-3">
            <Phone className="text-gray-400 mt-1" size={18} />
            <div>
              <p className="text-xs text-gray-500">Mobile</p>
              <p className="text-sm font-medium">{mobileNumber || "-"}</p>
            </div>
          </div>

          {/* Branch Code */}
          <div className="flex items-start gap-3">
            <BadgeCheck className="text-gray-400 mt-1" size={18} />
            <div>
              <p className="text-xs text-gray-500">Branch Code</p>
              <p className="text-sm font-medium">{branchCode || "-"}</p>
            </div>
          </div>

          {/* Organization */}
          <div className="flex items-start gap-3">
            <Building2 className="text-gray-400 mt-1" size={18} />
            <div>
              <p className="text-xs text-gray-500">Organization</p>
              <p className="text-sm font-medium">
                {organization?.organizationName || "-"}
              </p>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-start gap-3">
            <User className="text-gray-400 mt-1" size={18} />
            <div>
              <p className="text-xs text-gray-500">Role</p>
              <p className="text-sm font-medium">{roleName || "-"}</p>
            </div>
          </div>

          {/* Gender */}
          <div className="flex items-start gap-3">
            <User className="text-gray-400 mt-1" size={18} />
            <div>
              <p className="text-xs text-gray-500">Gender</p>
              <p className="text-sm font-medium">{gender || "-"}</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-start gap-3">
            <ShieldCheck className="text-gray-400 mt-1" size={18} />
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                  }`}
              >
                {status}
              </span>
            </div>
          </div>

          {/* Created At */}
          <div className="flex items-start gap-3">
            <Calendar className="text-gray-400 mt-1" size={18} />
            <div>
              <p className="text-xs text-gray-500">Created At</p>
              <p className="text-sm font-medium">{formattedDate(createdAt)}</p>
            </div>
          </div>

          {/* Updated At */}
          <div className="flex items-start gap-3">
            <Calendar className="text-gray-400 mt-1" size={18} />
            <div>
              <p className="text-xs text-gray-500">Updated At</p>
              <p className="text-sm font-medium">{formattedDate(updatedAt)}</p>
            </div>
          </div>

        </div>
      </div>
    </CommonModal>
  );
};

export default ClientDetails;