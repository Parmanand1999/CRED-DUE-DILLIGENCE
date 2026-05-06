import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import CustomLoader from "../CustomLoader";


const DataTable = ({
  columns,
  data,
  pagination = { pageIndex: 1, pageSize: 5 },
  setPagination,
  isPagination = true,
  totalCount,
  loading = false
}) => {

  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    // onPaginationChange: setPagination,
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pagination?.pageSize),
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="bg-white rounded-xl border shadow-sm w-full">
      <div className="w-full overflow-x-auto max-h-[400px] overflow-y-auto">
        <Table className="min-w-[800px]">
          <TableHeader className="sticky top-0 z-10 bg-white border-b-2 border-primary ">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => (
                  <TableHead
                    key={header.id}
                    className="relative text-primary font-semibold text-sm rounded-t-2xl "
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {/* Resize */}
                    {index !== headerGroup.headers.length - 1 && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        className="absolute right-0 top-2 bottom-2 w-[2px] cursor-col-resize bg-primary"
                      />
                    )}{" "}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-6">
                  <CustomLoader className=" " />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-6 text-gray-500">
                  No data found
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

      </div>
      {/* 🔥 Footer */}
      {
        isPagination && (
          <div className="flex justify-between items-center px-4 py-3 border-t">
            <div>
              Page {pagination.pageIndex} of {table.getPageCount()}
            </div>

            <div className="flex items-center gap-4">
              Rows per page:
              {/* Page Size */}
              <select
                value={pagination?.pageSize}
                onChange={(e) =>
                  setPagination((prev) => ({
                    ...prev,
                    pageSize: Number(e.target.value),
                    pageIndex: 1, // reset page
                  }))
                }
                className="border cursor-pointer rounded-sm "
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              {/* Buttons */}
              <div className="flex gap-2">
                {/* Previous */}
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      pageIndex: prev.pageIndex - 1,
                    }))
                  }
                  disabled={pagination.pageIndex === 1}
                  className="p-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Next */}
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      pageIndex: prev.pageIndex + 1,
                    }))
                  }
                  disabled={pagination.pageIndex >= table.getPageCount()}
                  className="p-1 border rounded-md hover:bg-gray-100 disabled:opacity-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default DataTable;
