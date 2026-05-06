import React, { useState } from "react";

import DataTable from "@/components/common/TableComponents/DataTable";
import { DashboardColumn } from "@/components/common/TableComponents/TablefieldsColumns";
import DashboardCard from "../Components/DashboardCard";
import TATChart from "../Components/TATChart";
import ThroughputChart from "../Components/ThroughputChart";

const Dashboard = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });
  const [lineChartFilter, setLineChartFilter] = useState("7");

  const dashboardData = [
    { title: "NEW", value: 142, change: "+12%", color: "#3B82F6" },
    { title: "IN PROGRESS", value: 389, change: "Stable", color: "#000000" },
    { title: "ON HOLD", value: 56, change: "-4%", color: "#F59E0B" },
    { title: "SENT TO FIELD", value: 214, change: "+8%", color: "#64748B" },
    { title: "RETURNED", value: 23, change: "-2%", color: "#F97316" },
    { title: "SLA BREACH", value: 8, change: "-2", color: "#EF4444" },
  ];

  const handleEdit = () => {};
  const data = [
    {
      caseId: "#CRD-90210",
      clientName: "HDFC Bank Ltd.",
      verificationType: "Address Verification",
      aging: 5,
      assignedTo: "Rahul Sharma",
    },
    {
      caseId: "#CRD-90215",
      clientName: "ICICI Direct",
      verificationType: "Background Check",
      aging: 3,
      assignedTo: "Anita Desai",
    },
    {
      caseId: "#CRD-90301",
      clientName: "Axis Finance",
      verificationType: "Employment History",
      aging: 4,
      assignedTo: "Vikas Khanna",
    },
  ];
  console.log("Dashboard Rendered");
  return (
    <div className="flex gap-4 flex-wrap">
      {dashboardData.map((item, index) => (
        <DashboardCard
          key={index}
          title={item.title}
          value={item.value}
          change={item.change}
          color={item.color}
        />
      ))}
      <div className="sm:flex w-full gap-3">
        <TATChart />
        <ThroughputChart />
      </div>
      <div className="w-full">
        <DataTable
          columns={DashboardColumn(handleEdit)}
          data={data}
          isPagination={true}
          pagination={pagination}
          setPagination={setPagination}
          totalCount={50}
        />
      </div>
    </div>
  );
};

export default Dashboard;
