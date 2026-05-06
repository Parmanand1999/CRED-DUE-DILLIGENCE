import DynamicFormSection from "./DynamicFormSection";
import { ChevronDown } from "lucide-react";
import { groupSectionsByCategory } from "./dynamicFormUtils";

const DynamicFormStep = ({
  sections = [],
  selectedServicePayload = [],
  includeCategoryIds = [],
  excludeCategoryIds = [],
  priorityCategoryId = "",
  prioritySubcategoryId = "",
  expandFirstGroup = true,
  loadedCategoryIds = [],
  categoryLoadingState = {},
  onCategoryOpen,
  onSaveSection,
  sectionSaveState = {},
  onSectionChange,
  onAddField,
  onEditField,
  onRemoveField,
  lockedAdditionalFieldSubcategoryIds = [],
  register,
  errors,
  setValue,
  getValues,
  clearErrors,
  setLoading,
}) => {
  const includeSet = new Set((includeCategoryIds || []).filter(Boolean));
  const excludeSet = new Set((excludeCategoryIds || []).filter(Boolean));
  const normalizedPriorityCategoryId = String(priorityCategoryId || "");
  const normalizedPrioritySubcategoryId = String(prioritySubcategoryId || "");

  const selectedCategories = (
    Array.isArray(selectedServicePayload) ? selectedServicePayload : []
  ).filter((categoryItem) => {
    const categoryId = categoryItem?.categoryId;

    if (includeSet.size > 0) {
      return includeSet.has(categoryId);
    }

    if (excludeSet.size > 0) {
      return !excludeSet.has(categoryId);
    }

    return true;
  });

  const filteredSections = (sections || []).filter((section) => {
    const categoryId = section?.categoryId;

    if (includeSet.size > 0) {
      return includeSet.has(categoryId);
    }

    if (excludeSet.size > 0) {
      return !excludeSet.has(categoryId);
    }

    return true;
  });

  const groupedLoadedSections = groupSectionsByCategory(
    filteredSections,
    selectedCategories,
  );

  const groupedSectionsById = new Map(
    groupedLoadedSections
      .filter((group) => group?.categoryId)
      .map((group) => [String(group.categoryId), group]),
  );

  const toCategorySubcategoryIds = (categoryItem) => {
    const explicitSubCategoryIds = Array.isArray(categoryItem?.subCategoryIds)
      ? categoryItem.subCategoryIds
      : [];

    const nestedSubCategoryIds = Array.isArray(categoryItem?.subcategories)
      ? categoryItem.subcategories
          .map((subCategory) => subCategory?.subCategoryId || subCategory?._id)
          .filter(Boolean)
      : [];

    return [
      ...new Set(
        [...explicitSubCategoryIds, ...nestedSubCategoryIds].filter(Boolean),
      ),
    ];
  };

  const uniqueCategories = selectedCategories.reduce(
    (acc, categoryItem, index) => {
      const categoryId = String(categoryItem?.categoryId || "");
      if (!categoryId || acc.some((item) => item.categoryId === categoryId)) {
        return acc;
      }

      const loadedGroup = groupedSectionsById.get(categoryId);

      acc.push({
        categoryId,
        categoryName: categoryItem?.categoryName || `Category ${index + 1}`,
        subcategoryIds: toCategorySubcategoryIds(categoryItem),
        sections: loadedGroup?.sections || [],
        isLoaded: loadedCategoryIds.includes(categoryId),
        isLoading: Boolean(categoryLoadingState?.[categoryId]),
      });

      return acc;
    },
    [],
  );

  const sortedCategories = [...uniqueCategories].sort((a, b) => {
    const aIsPriority =
      String(a?.categoryId || "") === normalizedPriorityCategoryId ||
      (Array.isArray(a?.subcategoryIds)
        ? a.subcategoryIds
            .map((subId) => String(subId || ""))
            .includes(normalizedPrioritySubcategoryId)
        : false);
    const bIsPriority =
      String(b?.categoryId || "") === normalizedPriorityCategoryId ||
      (Array.isArray(b?.subcategoryIds)
        ? b.subcategoryIds
            .map((subId) => String(subId || ""))
            .includes(normalizedPrioritySubcategoryId)
        : false);

    if (aIsPriority === bIsPriority) {
      return 0;
    }

    return aIsPriority ? -1 : 1;
  });

  if (!sortedCategories.length) {
    return (
      <div className="bg-white rounded-xl border p-5 text-sm text-gray-500">
        No service category fields are available for this step.
      </div>
    );
  }

  const handleCategoryOpen = (category) => {
    if (!category || category.isLoaded || category.isLoading) {
      return;
    }

    if (typeof onCategoryOpen === "function") {
      onCategoryOpen(category.categoryId, category.subcategoryIds);
    }
  };

  return (
    <div className="space-y-3">
      {sortedCategories.map((group, groupIndex) => {
        const hasSubcategories = Array.isArray(group.subcategoryIds)
          ? group.subcategoryIds.length > 0
          : false;

        return (
          <details
            key={group.categoryId || group.categoryName}
            open={expandFirstGroup && groupIndex === 0}
            className="group bg-white rounded-xl border overflow-hidden"
            onToggle={(event) => {
              if (event.currentTarget.open) {
                handleCategoryOpen(group);
              }
            }}
          >
            <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-3 bg-gray-100 hover:bg-gray-200 transition">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-gray-800 truncate">
                  {group.categoryName}
                </h3>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200 group-open:rotate-180" />
            </summary>

            <div className="p-3 space-y-2 border-t bg-white">
              {group.isLoading && (
                <p className="text-sm text-gray-500">Loading fields...</p>
              )}

              {!group.isLoading &&
                !group.sections.length &&
                group.isLoaded &&
                hasSubcategories && (
                  <DynamicFormSection
                    key={`dynamic-empty-${group.categoryId}`}
                    section={{
                      key: `dynamic-empty-${group.categoryId}`,
                      title: `${group.categoryName} Details`,
                      order: Number.MAX_SAFE_INTEGER,
                      categoryId: group.categoryId,
                      subCategoryId: group.subcategoryIds?.[0] || "",
                      fields: [],
                    }}
                    register={register}
                    errors={errors}
                    setValue={setValue}
                    getValues={getValues}
                    clearErrors={clearErrors}
                    setLoading={setLoading}
                    onSaveSection={onSaveSection}
                    saveStatus={
                      sectionSaveState?.[`dynamic-empty-${group.categoryId}`]
                    }
                    onSectionChange={onSectionChange}
                    onAddField={onAddField}
                    onEditField={onEditField}
                    onRemoveField={onRemoveField}
                    lockedAdditionalFieldSubcategoryIds={
                      lockedAdditionalFieldSubcategoryIds
                    }
                    defaultOpen={expandFirstGroup && groupIndex === 0}
                  />
                )}

              {!group.isLoading &&
                !group.sections.length &&
                group.isLoaded &&
                !hasSubcategories && (
                  <p className="text-sm text-gray-500">
                    No case-registration fields found for this category.
                  </p>
                )}

              {!group.isLoading && !group.isLoaded && (
                <p className="text-sm text-gray-500">
                  Open this category to load its case-registration fields.
                </p>
              )}

              {!group.isLoading &&
                [...group.sections]
                  .sort((a, b) => {
                    const aSubcategoryId = String(
                      a?.subCategoryId || a?.subcategoryId || "",
                    );
                    const bSubcategoryId = String(
                      b?.subCategoryId || b?.subcategoryId || "",
                    );
                    const aIsPriority =
                      aSubcategoryId === normalizedPrioritySubcategoryId;
                    const bIsPriority =
                      bSubcategoryId === normalizedPrioritySubcategoryId;

                    if (aIsPriority === bIsPriority) {
                      return Number(a?.order || 0) - Number(b?.order || 0);
                    }

                    return aIsPriority ? -1 : 1;
                  })
                  .map((section, sectionIndex) => (
                    <DynamicFormSection
                      key={section.key}
                      section={section}
                      register={register}
                      errors={errors}
                      setValue={setValue}
                      getValues={getValues}
                      clearErrors={clearErrors}
                      setLoading={setLoading}
                      onSaveSection={onSaveSection}
                      saveStatus={sectionSaveState?.[section.key]}
                      onSectionChange={onSectionChange}
                      onAddField={onAddField}
                      onEditField={onEditField}
                      onRemoveField={onRemoveField}
                      lockedAdditionalFieldSubcategoryIds={
                        lockedAdditionalFieldSubcategoryIds
                      }
                      defaultOpen={
                        expandFirstGroup &&
                        groupIndex === 0 &&
                        sectionIndex === 0
                      }
                    />
                  ))}
            </div>
          </details>
        );
      })}
    </div>
  );
};

export default DynamicFormStep;
