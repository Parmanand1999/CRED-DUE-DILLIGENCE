import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import SubcategoryAccordion from "./SubcategoryAccordion";


const CategoryAccordion = ({ caseDetail, fetchCaseDetails }) => {

  const categoryName = caseDetail?.category?.name || "";

  return (
    <>
      <details className="group bg-white rounded-xl border overflow-hidden ">
        <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-3 bg-gray-100 hover:bg-gray-200 transition">
          <h3 className="text-sm font-semibold text-gray-800 truncate">
            {categoryName}
          </h3>

        </summary>

        <div className="p-3 space-y-2 border-t bg-white">
          {caseDetail?.subCategories?.map((subCategory) => {
            const subCategoryId = String(subCategory?.subCategoryId || "");
            return (
              <SubcategoryAccordion
                key={subCategoryId}
                subCategory={subCategory}
                fetchCaseDetails={fetchCaseDetails}
              />
            );
          })}
        </div>
      </details>

    </>
  );
};

export default CategoryAccordion;
