import ReviewContent from "@/features/Client/Review&Confirm/Components/ReviewContent";
import BackendCategoryAccordion from "./BackendCategoryAccordion";

const BackendReviewContent = (props) => {
  return (
    <ReviewContent
      {...props}
      CategoryAccordionComponent={BackendCategoryAccordion}
      subcategoryPrimaryActionLabel="Verify"
    />
  );
};

export default BackendReviewContent;
