import React, { useEffect, useState } from "react";
import { Search, Filter, Loader2, CheckCircle, Clock, Info, Loader } from "lucide-react";
import useDebounce from "@/hooks/useDebounceHook";
import CustomPagination from "@/components/common/CustomPagination";
import { CaseList } from "@/Services/CasesManagmentServices";
import { formatDate } from "@/utils/formatDate";
import { IoClose } from "react-icons/io5";
import { Tooltip } from "@/components/common/Tooltip";
import CustomButton from "@/components/common/Buttons/CustomButton";
import { useNavigate } from "react-router-dom";
import CustomLoader from "@/components/common/CustomLoader";

const TABS = ["ALL CASES", "IN_PROGRESS", "COMPLETED", "PENDING"];

const statusConfig = {
  PENDING: {
    label: "Pending",
    style: "bg-gray-100 text-gray-600",
    icon: <Clock size={12} />,
  },
  IN_PROGRESS: {
    label: "In Progress",
    style: "bg-blue-100 text-blue-600",
    icon: <Loader size={12} className="animate-spin" />,
  },
  COMPLETED: {
    label: "Completed",
    style: "bg-green-100 text-green-600",
    icon: <CheckCircle size={12} />,
  },
  QC_PENDING: {
    label: "QC Pending",
    style: "bg-yellow-100 text-yellow-600",
    icon: <Clock size={12} />,
  },
  PARTIAL: {
    label: "Partial",
    style: "bg-yellow-100 text-yellow-600",
    icon: <Info size={12} />,
  },
};

const VerificationCases = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ALL CASES");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 10,
  });
  const [totalCount, setTotalCount] = useState(100);
  const [loading, setLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(search.trim(), 500);
  const [allCaseData, setAllCaseData] = useState();

  useEffect(() => {
    fetchAllCase();
  }, [activeTab, pagination, debouncedSearchTerm]);

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (activeTab === "ALL CASES" ? false : activeTab)
      params.append("status", activeTab);

    params.append("pageNo", pagination.pageIndex);
    params.append("limit", pagination.pageSize);
    params.append("search", debouncedSearchTerm);
    return params.toString();
  };

  const fetchAllCase = async () => {
    setLoading(true);
    try {
      const params = buildQueryParams();
      const res = await CaseList(params);
      if (res.status === 200) {
        console.log(res, "res CaseList");
        setAllCaseData(res.data.data.casesList);
      }
    } catch (error) {
      console.log(error, "error fetchAllCase");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 relative">
      {loading && <CustomLoader />}
      {/* HEADER */}
      <h2 className="text-xl font-extrabold  text-textprimary mb-4">
        Verification Cases
      </h2>

      {/* SEARCH + FILTER */}
      <div className="flex gap-3 mb-4">
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 flex-1">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search cases..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="outline-none w-full text-sm"
          />
          {search && (
            <IoClose
              className="hover:bg-gray-300 rounded-2xl "
              onClick={() => setSearch("")}
            />
          )}
        </div>

        {/* <button className="border rounded-lg px-3 flex items-center justify-center">
                    <Filter size={16} />
                </button> */}
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition duration-800 ease-in-out hover:shadow-lg hover:-translate-y-0.5 hover:border-black
                        ${activeTab === tab
                ? "bg-[#1A237E] text-white"
                : "bg-gray-100 text-textsecondary  "
              }
                        `}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="border p-3 rounded-2xl ">
        {/* CARDS */}
        <div className="space-y-4 ">
          {allCaseData?.length > 0 ? (
            allCaseData.map((item, index) => (
              <div
                key={index}
                className="bg-white border rounded-xl p-4 shadow-sm 
                 transition-all duration-800 ease-in-out 
                 hover:shadow-lg hover:-translate-y-1 hover:border-primary/40"
              >
                {/* TOP */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    {/* AVATAR */}
                    <div
                      className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-primary
                          transition-all duration-300 group-hover:bg-primary/10"
                    >
                      {item?.subjectName.slice(0, 1)}
                    </div>

                    {/* NAME */}
                    <div>
                      <p className="text-sm font-semibold text-textprimary">
                        {item?.subjectName}
                      </p>
                      <p className="text-xs text-textsecondary">
                        ID: {item.caseId}
                      </p>
                    </div>
                  </div>
                  <div className="flex  flex-wrap items-center gap-2">
                    {!item?.isFormCompleted && (<span
                      className={`flex items-center gap-1 text-[10px] px-3 py-1 border border-red-600 text-red-600 bg-red-100 rounded-full font-semibold
                `}
                    >
                      <Info size={12} />
                      Your form is not complete yet.
                    </span>)}
                    {/* STATUS */}
                    <span
                      className={`flex items-center gap-1 text-[10px] px-3 py-1 rounded-full font-semibold ${statusConfig[item.status]?.style ||
                        "bg-gray-100 text-gray-500"
                        }`}
                    >
                      {statusConfig[item.status]?.icon}
                      {statusConfig[item.status]?.label || item.status}
                    </span>
                    <Tooltip title={"View Details"}>
                      <CustomButton
                        className="text-xs bg-white text-textprimary font-semibold h-6 hover:bg-primary hover:text-white hover:border-none px-3 shadow-sm "
                        onClick={() => navigate(`/review-confirm/${item._id}`)}
                      >
                        View
                      </CustomButton>
                    </Tooltip>
                  </div>
                </div>

                {/* BOTTOM */}
                <div className="flex justify-between text-xs text-gray-500">
                  <div>
                    <p className="uppercase text-[10px]">Type </p>

                    <div className="text-textprimary font-medium">
                      {(() => {
                        // Flatten all subCategories from all services
                        const allSubCategories =
                          item.services?.flatMap(
                            (service) => service.subCategories || [],
                          ) || [];

                        const totalSubCategories = allSubCategories.length;
                        const firstSubCategoryName =
                          allSubCategories[0]?.name || "N/A";

                        return (
                          <div>
                            <span className="text-xs font-medium">
                              {firstSubCategoryName}
                            </span>
                            {totalSubCategories > 1 && (
                              <span className="text-gray-500 ml-1 border rounded-full px-1 py-0.5 text-[8px]">
                                +{totalSubCategories - 1}
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className=" flex gap-2 items-center text-right">
                    <p className="uppercase text-[12px] font-semibold">
                      Submitted :
                    </p>
                    <p className="text-textprimary font-medium">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center py-10 text-gray-400 text-sm">
              No data available
            </div>
          )}
        </div>
        <CustomPagination
          pagination={pagination}
          setPagination={setPagination}
          totalCount={totalCount}
          isLoading={loading}
        />
      </div>
    </div>
  );
};

export default VerificationCases;
