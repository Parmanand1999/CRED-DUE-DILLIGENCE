import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip } from "./Tooltip";

const CustomPagination = ({
  pagination,
  setPagination,
  totalCount,
  isLoading,
}) => {
  const { pageIndex, pageSize } = pagination;
  const totalPages = Math.ceil(totalCount / pageSize);

  const goToPage = (page) => {
    if (page < 0 || page >= totalPages) return;

    setPagination((prev) => ({
      ...prev,
      pageIndex: page,
    }));
  };

  return (
    <div className=" sm:flex justify-between items-center px-4 py-3 border rounded-2xl mt-2 bg-white sticky">
      {/* LEFT */}
      <div className="text-sm text-gray-600">
        Page <span className="font-semibold">{pageIndex}</span> of{" "}
        <span className="font-semibold">{totalPages}</span>
      </div>

      {/* RIGHT */}
      <div className="md:flex items-center gap-4">
        {/* PAGE SIZE */}
        <div className="flex items-center gap-2 text-sm ">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            disabled={isLoading}
            onChange={(e) =>
              setPagination((prev) => ({
                ...prev,
                pageSize: Number(e.target.value),
                pageIndex: 0,
              }))
            }
            className="border rounded-md px-2 py-1 cursor-pointer"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        {/* BUTTONS */}
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <Tooltip title={"First Page"}>
            <button
              onClick={() => goToPage(0)}
              disabled={pageIndex === 0 || isLoading}
              className="px-2 py-1 border rounded-md disabled:opacity-50"
            >
              ⏮
            </button>
          </Tooltip>
          <button
            onClick={() => goToPage(pageIndex - 1)}
            disabled={pageIndex === 0 || isLoading}
            className="p-1 border rounded-md disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            onClick={() => goToPage(pageIndex + 1)}
            disabled={pageIndex >= totalPages - 1 || isLoading}
            className="p-1 border rounded-md disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
          <Tooltip title={"Last Page"}>
            <button
              onClick={() => goToPage(totalPages - 1)}
              disabled={pageIndex >= totalPages - 1 || isLoading}
              className="px-2 py-1 border rounded-md disabled:opacity-50"
            >
              ⏭
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default CustomPagination;
