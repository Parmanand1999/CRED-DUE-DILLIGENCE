
import React, { useEffect, useState } from "react";
import { RefreshCw, CheckCircle, AlertCircle, Wallet } from "lucide-react";
import { toast } from "react-toastify";
import CustomLoader from "@/components/common/CustomLoader";
import useAuthStore from "@/store/useAuthStore";

import RecentSubmissions from "./Components/RecentSubmissions";
import { QCDashboardData } from "@/Services/QCService";
import DashboardCard from "../Components/DashboardCard";

const QCDashboard = () => {
    const userName = useAuthStore((state) => state?.user?.name);
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    const cards = [
        {
            key: "totalAssigned",
            title: "Total Assigned Cases",
            icon: <RefreshCw size={18} />,
            iconBg: "bg-yellow-100",
            iconColor: "text-yellow-600",
        },
        {
            key: "pending",
            title: "Pending Cases",
            icon: <AlertCircle size={18} />,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
        },
        {
            key: "completed",
            title: "Completed",
            icon: <CheckCircle size={18} />,
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
        },
        {
            key: "inProgress",
            title: "In Progress",
            icon: <RefreshCw size={18} />,
            iconBg: "bg-yellow-100",
            iconColor: "text-yellow-600",
        },
        {
            key: "rejected",
            title: "Rejected Cases",
            icon: <AlertCircle size={18} />,
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
        },
        {
            key: "reverify",
            title: "Re-verification",
            icon: <Wallet size={18} />,
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
        },
        // {
        //     key: "todayAssigned",
        //     title: "Today's Assignments",
        //     icon: <RefreshCw size={18} />,
        //     iconBg: "bg-red-100",
        //     iconColor: "text-red-600",
        // },
    ];

    useEffect(() => {
        fetchDashData();
    }, []);

    const fetchDashData = async () => {
        try {
            setLoading(true);
            const res = await QCDashboardData();
            if (res.status === 200) {
                console.log(res, "hhhhhhhhhhhh");

                setData(res.data.data);
            }
        } catch (error) {
            toast.error(
                error?.response?.data?.message || error?.message || "Something went wrong",
            );
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            {loading && <CustomLoader />}
            <div>
                <h2 className="font-bold text-3xl text-textprimary">
                    Welcome back{userName ? `, ${userName}` : ""}
                </h2>
                <p className="font-semibold text-textsecondary ">
                    Here's what's happening with your assigned queue today.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                {cards.map((card, index) => {

                    return (
                        <DashboardCard
                            key={index}
                            {...card}
                            value={data?.stats?.[card.key]?.toString().padStart(2, "0")}
                        />
                    );
                })}
            </div>

            <div className="flex p-2">
                <RecentSubmissions data={data?.recentCases} />
            </div>
        </>
    );
};

export default QCDashboard;
