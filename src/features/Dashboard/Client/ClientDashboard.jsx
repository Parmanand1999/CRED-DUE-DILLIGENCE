import React, { useEffect, useState } from "react";

import { RefreshCw, CheckCircle, AlertCircle, Wallet } from "lucide-react";
import DashboardCard from "./Components/DashboardCard";
import RecentSubmissions from "./Components/RecentSubmissions";
import { DashboardDataList } from "@/Services/clientDashboardServices";
import { toast } from "react-toastify";
import CustomLoader from "@/components/common/CustomLoader";
const ClientDashboard = () => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const cards = [
    {
      key: "inProgress",
      title: "IN-PROGRESS",
      icon: <RefreshCw size={18} />,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      key: "completed",
      title: "COMPLETED",
      icon: <CheckCircle size={18} />,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      key: "reverify",
      title: "REVERIFY",
      icon: <AlertCircle size={18} />,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      key: "pendingPayment",
      title: "PENDING PAYMENT",
      icon: <Wallet size={18} />,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
  ];

  const data1 = [
    {
      subjectName: "Real Estate Portfolio A",
      caseId: "CRD-82910",
      status: "IN PROGRESS",
    },
    {
      subjectName: "Equity Holdings Q3",
      caseId: "CRD-82915",
      status: "VERIFIED",
    },
    {
      subjectName: "Cash Reserves Statement",
      caseId: "CRD-82921",
      status: "PENDING",
    },
    {
      subjectName: "Asset Valuation Report",
      caseId: "CRD-82894",
      status: "REJECTED",
    },
  ];

  useEffect(() => {
    fetchDashData();
  }, []);

  const fetchDashData = async () => {
    try {
      setLoading(true);
      const res = await DashboardDataList();
      if (res.status === 200) {
        console.log(res.data.data, "res.data.data");

        setData(res.data.data);
      }
    } catch (error) {
      toast.error(error.res.data.message || "somthing went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <CustomLoader />}
      <div>
        <h2 className="font-bold text-3xl text-textprimary">
          Welcome back, Sarah
        </h2>
        <p className="font-semibold text-textsecondary ">
          Here's what's happening with your portfolio today.
        </p>
      </div>
      <div className="flex gap-4 flex-wrap">
        {cards.map((card, index) => (
          <DashboardCard
            key={index}
            {...card}
            value={(data?.stats?.[card.key] || 0).toString().padStart(2, "0")}
          />
        ))}
      </div>
      <div className="flex p-2">
        <RecentSubmissions data={data?.recentSubmissions} />
      </div>
    </>
  );
};

export default ClientDashboard;
