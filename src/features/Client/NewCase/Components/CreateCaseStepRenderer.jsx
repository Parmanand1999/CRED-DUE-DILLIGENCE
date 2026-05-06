import SelectService from "./SelectService";
import DynamicFormStep from "./DynamicFormStep";
import {
  OTHER_CATEGORY_ID,
  GENERAL_DETAILS_CATEGORY_ID,
  GENERAL_DETAILS_SUBCATEGORY_ID,
} from "./createCaseStepperConfig";

const CreateCaseStepRenderer = ({
  stepId,
  register,
  errors,
  setValue,
  getValues,
  clearErrors,
  setLoading,
  resetKey,
  dynamicSections,
  loadedCategoryIds,
  categoryLoadingState,
  onCategoryOpen,
  onSaveSection,
  sectionSaveState,
  onSectionChange,
  onAddField,
  onEditField,
  onRemoveField,
  lockedAdditionalFieldSubcategoryIds,
  selectedServicePayload,
  selectedServiceTypeId,
  uploadedDocPayload,
  setSelectedServiceTypeId,
  setSelectedServicePayload,
  setUploadedDocPayload,
}) => {
  const stepComponentMap = {
    service: (
      <SelectService
        selectedServicePayload={selectedServicePayload}
        selectedServiceTypeId={selectedServiceTypeId}
        setSelectedServiceTypeId={setSelectedServiceTypeId}
        setSelectedServicePayload={setSelectedServicePayload}
        setLoading={setLoading}
        resetKey={resetKey}
      />
    ),
    dynamicMain: (
      <DynamicFormStep
        sections={dynamicSections}
        selectedServicePayload={selectedServicePayload}
        excludeCategoryIds={[OTHER_CATEGORY_ID]}
        priorityCategoryId={GENERAL_DETAILS_CATEGORY_ID}
        prioritySubcategoryId={GENERAL_DETAILS_SUBCATEGORY_ID}
        expandFirstGroup={false}
        loadedCategoryIds={loadedCategoryIds}
        categoryLoadingState={categoryLoadingState}
        onCategoryOpen={onCategoryOpen}
        onSaveSection={onSaveSection}
        sectionSaveState={sectionSaveState}
        onSectionChange={onSectionChange}
        onAddField={onAddField}
        onEditField={onEditField}
        onRemoveField={onRemoveField}
        lockedAdditionalFieldSubcategoryIds={
          lockedAdditionalFieldSubcategoryIds
        }
        register={register}
        errors={errors}
        setValue={setValue}
        getValues={getValues}
        clearErrors={clearErrors}
        setLoading={setLoading}
      />
    ),
    dynamicOther: (
      <DynamicFormStep
        sections={dynamicSections}
        selectedServicePayload={selectedServicePayload}
        includeCategoryIds={[OTHER_CATEGORY_ID]}
        loadedCategoryIds={loadedCategoryIds}
        categoryLoadingState={categoryLoadingState}
        onCategoryOpen={onCategoryOpen}
        onSaveSection={onSaveSection}
        sectionSaveState={sectionSaveState}
        onSectionChange={onSectionChange}
        onAddField={onAddField}
        onEditField={onEditField}
        onRemoveField={onRemoveField}
        lockedAdditionalFieldSubcategoryIds={
          lockedAdditionalFieldSubcategoryIds
        }
        register={register}
        errors={errors}
        setValue={setValue}
        getValues={getValues}
        clearErrors={clearErrors}
        setLoading={setLoading}
      />
    ),
  };

  return stepComponentMap[stepId] || null;
};

export default CreateCaseStepRenderer;
