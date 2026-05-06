import SubcategoryAccordion from "./SubcategoryAccordion";

const CategoryAccordion = ({
  group,
  groupIndex,
  getSubcategoryState,
  getSubcategoryEditState,
  getSubcategoryTemplateState,
  onCategoryToggle,
  onOpenAddSubcategory,
  onOpenAddFieldSubcategory,
  onPrimaryActionSubcategory,
  onEditStart,
  onEditCancel,
  onFieldChange,
  onSaveSubcategory,
  SubcategoryAccordionComponent = SubcategoryAccordion,
  subcategoryPrimaryActionLabel = "Edit",
}) => {
  return (
    <details
      key={group.categoryId}
      open={groupIndex === 0}
      className="group bg-white rounded-xl border overflow-hidden "
      onToggle={(event) => {
        if (event.currentTarget.open) {
          onCategoryToggle(group);
        }
      }}
    >
      <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-3 bg-gray-100 hover:bg-gray-200 transition">
        <h3 className="text-sm font-semibold text-gray-800 truncate">
          {group.categoryName}
        </h3>
        <button
          type="button"
          className="shrink-0 px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onOpenAddSubcategory(group);
          }}
        >
          Add Subcategory
        </button>
      </summary>

      <div className="p-3 space-y-2 border-t bg-white">
        {group.subcategories.map((subCategory) => {
          const subCategoryId = String(subCategory?.subCategoryId || "");
          const subCategoryState = getSubcategoryState(subCategoryId);
          const subCategoryEditState = getSubcategoryEditState(subCategoryId);
          const subCategoryTemplateState =
            getSubcategoryTemplateState(subCategoryId);

          return (
            <SubcategoryAccordionComponent
              key={subCategoryId}
              subCategory={subCategory}
              subCategoryState={subCategoryState}
              subCategoryEditState={subCategoryEditState}
              subCategoryTemplateState={subCategoryTemplateState}
              onAddAction={() => onOpenAddFieldSubcategory?.(subCategory)}
              onPrimaryAction={(fieldKey) =>
                onPrimaryActionSubcategory?.(subCategory, fieldKey)
              }
              onEditStart={() => onEditStart(subCategoryId)}
              onEditCancel={() => onEditCancel(subCategoryId)}
              onFieldChange={(fieldKey, bucket, value) =>
                onFieldChange({
                  subcategoryId: subCategoryId,
                  fieldKey,
                  bucket,
                  value,
                })
              }
              onSave={() => onSaveSubcategory(subCategoryId)}
              enableAddAction
              primaryActionLabel={subcategoryPrimaryActionLabel}
            />
          );
        })}
      </div>
    </details>
  );
};

export default CategoryAccordion;
