import SubcategoryAccordion from "@/features/Client/Review&Confirm/Components/SubcategoryAccordion";

const BackendSubcategoryAccordion = (props) => {
  return (
    <SubcategoryAccordion
      {...props}
      onPrimaryAction={props.onEditStart}
      primaryActionLabel="Edit"
      enableSecondaryAction
      onSecondaryAction={props.onPrimaryAction}
      secondaryActionLabel="Verify"
      enableFieldVerifyAction
      onFieldVerifyAction={(fieldKey) => props.onPrimaryAction?.(fieldKey)}
    />
  );
};

export default BackendSubcategoryAccordion;
