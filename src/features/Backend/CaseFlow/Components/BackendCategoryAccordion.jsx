import CategoryAccordion from "@/features/Client/Review&Confirm/Components/CategoryAccordion";
import BackendSubcategoryAccordion from "./BackendSubcategoryAccordion";

const BackendCategoryAccordion = (props) => {
  return (
    <CategoryAccordion
      {...props}
      SubcategoryAccordionComponent={BackendSubcategoryAccordion}
      subcategoryPrimaryActionLabel="Verify"
    />
  );
};

export default BackendCategoryAccordion;
