import ReviewAndConfirm from "@/features/Client/Review&Confirm/ReviewAndConfirm";
import BackendReviewContent from "./Components/BackendReviewContent";

const BackendReviewAndConfirm = () => {
  return (
    <ReviewAndConfirm
      ReviewContentComponent={BackendReviewContent}
      primaryActionType="verify"
      subcategoryPrimaryActionLabel="Verify"
      enableMarkAsComplete
    />
  );
};

export default BackendReviewAndConfirm;