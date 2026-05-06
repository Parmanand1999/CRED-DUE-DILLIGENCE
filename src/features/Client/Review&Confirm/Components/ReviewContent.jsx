import CategoryAccordion from "./CategoryAccordion";
import EmptyState from "./EmptyState";

const ReviewContent = ({
  loading,
  serviceGroups,
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
  CategoryAccordionComponent = CategoryAccordion,
  subcategoryPrimaryActionLabel = "Edit",
}) => {
  if (loading) {
    return null;
  }

  if (!serviceGroups.length) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-3">
      {serviceGroups.map((group, groupIndex) => (
        <CategoryAccordionComponent
          key={group.categoryId}
          group={group}
          groupIndex={groupIndex}
          getSubcategoryState={getSubcategoryState}
          getSubcategoryEditState={getSubcategoryEditState}
          getSubcategoryTemplateState={getSubcategoryTemplateState}
          onCategoryToggle={onCategoryToggle}
          onOpenAddSubcategory={onOpenAddSubcategory}
          onOpenAddFieldSubcategory={onOpenAddFieldSubcategory}
          onPrimaryActionSubcategory={onPrimaryActionSubcategory}
          onEditStart={onEditStart}
          onEditCancel={onEditCancel}
          onFieldChange={onFieldChange}
          onSaveSubcategory={onSaveSubcategory}
          subcategoryPrimaryActionLabel={subcategoryPrimaryActionLabel}
        />
      ))}
    </div>
  );
};

export default ReviewContent;
