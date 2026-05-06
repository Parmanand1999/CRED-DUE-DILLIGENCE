import React from "react";

const DashboardCard = ({
  title,
  value,
  icon,
  iconBg = "bg-gray-100",
  iconColor = "text-gray-600",
}) => {
  return (
    <div className="flex items-center justify-between p-4 mt-3 bg-white rounded-xl shadow-sm border w-[260px]">
      {/* LEFT CONTENT */}
      <div>
        <p className="text-[10px] tracking-widest text-textsecondary   font-semibold uppercase">
          {title}
        </p>
        <h2 className="text-2xl font-bold text-textprimary  mt-1">{value}</h2>
      </div>

      {/* RIGHT ICON */}
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-lg ${iconBg}`}
      >
        <div className={`${iconColor}`}>{icon}</div>
      </div>
    </div>
  );
};

export default DashboardCard;
