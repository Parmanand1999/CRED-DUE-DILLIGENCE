import React from "react";
import { FileText, MoreVertical } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import CustomButton from "@/components/common/Buttons/CustomButton";
import { Tooltip } from "@/components/common/Tooltip";
import { Clock, Loader2, CheckCircle } from "lucide-react";

const statusConfig = {
  PENDING: {
    label: "Pending",
    style: "bg-gray-100 text-gray-600",
    icon: <Clock size={12} />,
  },
  IN_PROGRESS: {
    label: "In Progress",
    style: "bg-blue-100 text-blue-600",
    icon: <Loader2 size={12} className="animate-spin" />,
  },
  COMPLETED: {
    label: "Completed",
    style: "bg-green-100 text-green-600",
    icon: <CheckCircle size={12} />,
  },
};

const RecentSubmissions = ({ data = [] }) => {
  const navagate = useNavigate();
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 w-full">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-textprimary">
          RECENT SUBMISSIONS
        </h2>

        <button className="text-xs text-primary font-medium hover:underline">
          <Link to={"/verification-cases"}>View All →</Link>
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition"
          >
            {/* LEFT */}
            <div className="flex items-center gap-3">
              {/* ICON */}
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100">
                <FileText size={18} className="text-orange-500" />
              </div>

              {/* TEXT */}
              <div>
                <p className="text-sm font-semibold text-textprimary">
                  {item.subjectName}
                </p>
                <p className="text-xs text-textsecondary">{item.caseId}</p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
              {/* STATUS */}
              <span
                className={`flex items-center gap-1 text-[10px] px-3 py-1 rounded-full font-semibold ${
                  statusConfig[item.status]?.style ||
                  "bg-gray-100 text-gray-500"
                }`}
              >
                {/* {statusConfig[item.status]?.icon} */}
                {statusConfig[item.status]?.label || item.status}
              </span>

              {/* MENU */}
              <Tooltip title={"View Details"}>
                <CustomButton
                  className="text-xs"
                  onClick={() => navagate(`/review-confirm/${item._id}`)}
                >
                  View
                </CustomButton>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentSubmissions;
