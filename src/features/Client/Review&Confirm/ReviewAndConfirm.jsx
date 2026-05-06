import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  SubSategoryData,
  generateDynamicForm,
} from "@/Services/CreateNewCaseServices";
import CustomLoader from "@/components/common/CustomLoader";
import { toast } from "react-toastify";
import CaseHeader from "./Components/CaseHeader";
import AddSubcategoryModal from "./Components/AddSubcategoryModal";
import AddAdditionalFieldModal from "./Components/AddAdditionalFieldModal";
import ReviewContent from "./Components/ReviewContent";
import BackendFinalizeVerificationModal from "@/features/Backend/CaseFlow/Components/BackendFinalizeVerificationModal";
import {
  buildSubcategorySubmissionPayload,
  extractCaseServices,
  extractSubcategoryFieldTemplates,
  extractSubcategoryPayload,
  mergeServiceGroups,
} from "./Components/reviewAndConfirmUtils";
import {
  addCaseServiceSubcategory,
  getCaseSubcategoryData,
  finalizeVerifyCaseServiceField,
  initiateCaseAssignment,
  saveCaseSubcategoryData,
  verifyCaseServiceField,
  viewCaseDetails,
} from "@/Services/CasesManagmentServices";

const ReviewAndConfirm = ({
  ReviewContentComponent = ReviewContent,
  primaryActionType = "edit",
  subcategoryPrimaryActionLabel = "Edit",
  enableMarkAsComplete = false,
}) => {
  const param = useParams();
  const [loading, setLoading] = useState(false);
  const [caseData, setCaseData] = useState(null);
  const [categoryLoadingState, setCategoryLoadingState] = useState({});
  const [subcategoryDataState, setSubcategoryDataState] = useState({});
  const [subcategoryEditState, setSubcategoryEditState] = useState({});
  const [subcategoryTemplateState, setSubcategoryTemplateState] = useState({});
  const [subcategoryCatalogState, setSubcategoryCatalogState] = useState({});
  const [addSubcategoryModalState, setAddSubcategoryModalState] = useState({
    isOpen: false,
    categoryId: "",
    categoryName: "",
    existingSubcategoryIds: [],
    saving: false,
  });
  const [addFieldModalState, setAddFieldModalState] = useState({
    isOpen: false,
    subcategoryId: "",
    subcategoryName: "",
    saving: false,
  });
  const [verificationModalState, setVerificationModalState] = useState({
    isOpen: false,
    caseId: "",
    subcategoryId: "",
    subcategoryName: "",
    verificationMode: "subcategory",
    targetKeyName: "",
  });
  console.log(caseData, "caseData");

  const serviceGroups = useMemo(() => {
    return mergeServiceGroups(extractCaseServices(caseData));
  }, [caseData]);

  useEffect(() => {
    fetchCaseDetails();
  }, []);

  const fetchCaseDetails = async () => {
    setLoading(true);
    try {
      const res = await viewCaseDetails(`${param.id}`);
      if (res.status === 200) {
        setCaseData(res.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getSubcategoryState = (subcategoryId) => {
    return subcategoryDataState?.[subcategoryId] || { status: "idle" };
  };

  const getSubcategoryEditState = (subcategoryId) => {
    return (
      subcategoryEditState?.[subcategoryId] || {
        isEditing: false,
        status: "idle",
        draftFormData: {},
        draftCustomizedData: {},
      }
    );
  };

  const loadSingleSubcategoryData = async ({ caseId, subcategoryId }) => {
    try {
      const res = await getCaseSubcategoryData({
        caseId,
        subcategoryId,
      });
      if (res.status === 200) {
        const payload = extractSubcategoryPayload(res);

        setSubcategoryDataState((prev) => ({
          ...prev,
          [subcategoryId]: {
            status: "loaded",
            formData: payload.formData,
            customizedData: payload.customizedData,
            verifiedFields: payload.verifiedFields,
          },
        }));
      }
    } catch (error) {
      console.log(error, "error");
    }
  };

  const getVerificationFieldOptions = (subcategoryId) => {
    const state = getSubcategoryState(subcategoryId);
    const combinedData = {
      ...(state?.formData || {}),
      ...(state?.customizedData || {}),
    };

    return Object.keys(combinedData).filter((keyName) => {
      const value = combinedData?.[keyName];

      if (value === null || value === undefined) {
        return false;
      }

      if (typeof value === "string" && !value.trim()) {
        return false;
      }

      if (Array.isArray(value) && !value.length) {
        return false;
      }

      return true;
    });
  };

  const getSubcategoryTemplateState = (subcategoryId) => {
    return (
      subcategoryTemplateState?.[subcategoryId] || {
        status: "idle",
        fields: [],
      }
    );
  };

  const loadSubcategoryFieldTemplate = async (subcategoryId) => {
    const normalizedSubcategoryId = String(subcategoryId || "");
    if (!normalizedSubcategoryId) {
      return [];
    }

    const cachedTemplate = getSubcategoryTemplateState(normalizedSubcategoryId);
    if (cachedTemplate?.status === "loaded") {
      return cachedTemplate?.fields || [];
    }

    setSubcategoryTemplateState((prev) => ({
      ...prev,
      [normalizedSubcategoryId]: {
        ...(prev?.[normalizedSubcategoryId] || {}),
        status: "loading",
        fields: prev?.[normalizedSubcategoryId]?.fields || [],
      },
    }));

    try {
      const res = await generateDynamicForm([normalizedSubcategoryId]);
      const fields = extractSubcategoryFieldTemplates(
        res,
        normalizedSubcategoryId,
      );

      setSubcategoryTemplateState((prev) => ({
        ...prev,
        [normalizedSubcategoryId]: {
          status: "loaded",
          fields,
        },
      }));

      return fields;
    } catch (error) {
      setSubcategoryTemplateState((prev) => ({
        ...prev,
        [normalizedSubcategoryId]: {
          status: "error",
          fields: [],
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Failed to load subcategory field template.",
        },
      }));
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load subcategory field template.",
      );
      return [];
    }
  };

  const startSubcategoryEdit = async (subcategoryId) => {
    const state = getSubcategoryState(subcategoryId);

    if (state?.status !== "loaded") {
      return;
    }

    setSubcategoryEditState((prev) => ({
      ...prev,
      [subcategoryId]: {
        ...(prev?.[subcategoryId] || {}),
        isEditing: false,
        status: "preparing",
      },
    }));

    const draftFormData = { ...(state?.formData || {}) };
    const draftCustomizedData = { ...(state?.customizedData || {}) };

    const templateFields = await loadSubcategoryFieldTemplate(subcategoryId);

    templateFields.forEach((field) => {
      if (!field?.id) {
        return;
      }

      if (field?.bucket === "customizedData") {
        if (!(field.id in draftCustomizedData)) {
          draftCustomizedData[field.id] = field?.type === "checkbox" ? [] : "";
        }
        return;
      }

      if (!(field.id in draftFormData)) {
        draftFormData[field.id] = field?.type === "checkbox" ? [] : "";
      }
    });

    setSubcategoryEditState((prev) => ({
      ...prev,
      [subcategoryId]: {
        isEditing: true,
        status: "editing",
        draftFormData,
        draftCustomizedData,
      },
    }));
  };

  const cancelSubcategoryEdit = (subcategoryId) => {
    setSubcategoryEditState((prev) => ({
      ...prev,
      [subcategoryId]: {
        ...(prev?.[subcategoryId] || {}),
        isEditing: false,
        status: "idle",
      },
    }));
  };

  const changeSubcategoryFieldValue = ({
    subcategoryId,
    fieldKey,
    bucket,
    value,
  }) => {
    setSubcategoryEditState((prev) => {
      const current = prev?.[subcategoryId] || {
        isEditing: true,
        status: "editing",
        draftFormData: {},
        draftCustomizedData: {},
      };

      if (bucket === "customizedData") {
        return {
          ...prev,
          [subcategoryId]: {
            ...current,
            draftCustomizedData: {
              ...(current?.draftCustomizedData || {}),
              [fieldKey]: value,
            },
          },
        };
      }

      return {
        ...prev,
        [subcategoryId]: {
          ...current,
          draftFormData: {
            ...(current?.draftFormData || {}),
            [fieldKey]: value,
          },
        },
      };
    });
  };

  const saveSubcategoryEdits = async (subcategoryId) => {
    const caseId = String(param?.id || "");
    if (!caseId || !subcategoryId) {
      return;
    }

    const currentEditState = getSubcategoryEditState(subcategoryId);
    if (!currentEditState?.isEditing) {
      return;
    }

    try {
      setSubcategoryEditState((prev) => ({
        ...prev,
        [subcategoryId]: {
          ...(prev?.[subcategoryId] || {}),
          status: "saving",
        },
      }));

      const submissionPayload = buildSubcategorySubmissionPayload({
        subcategoryId,
        draftFormData: currentEditState?.draftFormData,
        draftCustomizedData: currentEditState?.draftCustomizedData,
      });

      const res = await saveCaseSubcategoryData({
        caseId,
        subcategoryId: submissionPayload.subcategoryId,
        formData: submissionPayload.formData,
        customizedData: submissionPayload.customizedData,
      });

      if (res?.status === 200) {
        setSubcategoryDataState((prev) => ({
          ...prev,
          [subcategoryId]: {
            ...(prev?.[subcategoryId] || {}),
            status: "loaded",
            formData: submissionPayload.formData,
            customizedData: submissionPayload.customizedData,
          },
        }));

        setSubcategoryEditState((prev) => ({
          ...prev,
          [subcategoryId]: {
            ...(prev?.[subcategoryId] || {}),
            isEditing: false,
            status: "saved",
          },
        }));

        toast.success(
          res?.data?.message || "Subcategory updated successfully.",
        );
      }
    } catch (error) {
      setSubcategoryEditState((prev) => ({
        ...prev,
        [subcategoryId]: {
          ...(prev?.[subcategoryId] || {}),
          status: "error",
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Failed to update subcategory.",
        },
      }));
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update subcategory.",
      );
    }
  };

  const openVerificationModal = (subCategory, preferredKeyName = "") => {
    const subcategoryId = String(subCategory?.subCategoryId || "");
    if (!subcategoryId) {
      return;
    }

    const state = getSubcategoryState(subcategoryId);
    if (state?.status !== "loaded") {
      toast.info("Load subcategory details before starting verification.");
      return;
    }

    const keyNames = getVerificationFieldOptions(subcategoryId);

    const normalizedPreferredKeyName = String(preferredKeyName || "");
    const isFieldVerification = Boolean(normalizedPreferredKeyName);

    if (isFieldVerification && !keyNames.includes(normalizedPreferredKeyName)) {
      toast.info("Selected field is not available for verification.");
      return;
    }

    setVerificationModalState({
      isOpen: true,
      caseId: String(param?.id || ""),
      subcategoryId,
      subcategoryName: subCategory?.subCategoryName || "Verification",
      verificationMode: isFieldVerification ? "field" : "subcategory",
      targetKeyName: isFieldVerification ? normalizedPreferredKeyName : "",
    });
  };

  const handlePrimaryAction = async (subCategory, fieldKey = "") => {
    const subcategoryId = String(subCategory?.subCategoryId || "");

    if (primaryActionType === "verify") {
      openVerificationModal(subCategory, fieldKey);
      return;
    }

    await startSubcategoryEdit(subcategoryId);
  };

  const closeVerificationModal = () => {
    setVerificationModalState({
      isOpen: false,
      caseId: "",
      subcategoryId: "",
      subcategoryName: "",
      verificationMode: "subcategory",
      targetKeyName: "",
    });
  };

  const startVerificationRequest = async () => {
    const caseId = String(verificationModalState?.caseId || param?.id || "");
    const subcategoryId = String(verificationModalState?.subcategoryId || "");
    const keyName = String(verificationModalState?.targetKeyName || "");
    const isFieldVerification =
      verificationModalState?.verificationMode === "field";

    if (!caseId || !subcategoryId) {
      throw new Error("Missing verification context.");
    }

    if (isFieldVerification && !keyName) {
      throw new Error("Missing field verification context.");
    }

    const payload = {
      caseId,
      subcategoryId,
      ...(isFieldVerification ? { keyName } : {}),
    };

    return verifyCaseServiceField(payload);
  };

  const finalizeVerificationRequest = async ({ status, remarks, files }) => {
    const caseId = String(verificationModalState?.caseId || param?.id || "");
    const subcategoryId = String(verificationModalState?.subcategoryId || "");
    const keyName = String(verificationModalState?.targetKeyName || "");
    const isFieldVerification =
      verificationModalState?.verificationMode === "field";

    if (!caseId || !subcategoryId) {
      throw new Error("Missing verification context.");
    }

    if (isFieldVerification && !keyName) {
      throw new Error("Missing field verification context.");
    }

    const response = await finalizeVerifyCaseServiceField({
      caseId,
      subcategoryId,
      ...(isFieldVerification ? { keyName } : {}),
      status,
      remarks,
      files,
    });

    await loadSingleSubcategoryData({ caseId, subcategoryId });

    return response;
  };

  
  const loadCategorySubcategories = async (category) => {
    const categoryId = String(category?.categoryId || "");
    const caseId = String(param?.id || "");

    if (!categoryId || !caseId || categoryLoadingState?.[categoryId]) {
      return;
    }

    const subcategoriesToLoad = (category?.subcategories || []).filter(
      (subCategory) => {
        const subCategoryId = String(subCategory?.subCategoryId || "");
        if (!subCategoryId) {
          return false;
        }

        const currentStatus = getSubcategoryState(subCategoryId)?.status;
        return currentStatus !== "loaded";
      },
    );

    if (!subcategoriesToLoad.length) {
      return;
    }

    setCategoryLoadingState((prev) => ({
      ...prev,
      [categoryId]: true,
    }));

    try {
      await Promise.all(
        subcategoriesToLoad.map(async (subCategory) => {
          const subCategoryId = String(subCategory?.subCategoryId || "");

          setSubcategoryDataState((prev) => ({
            ...prev,
            [subCategoryId]: { status: "loading" },
          }));

          try {
            await loadSingleSubcategoryData({
              caseId,
              subcategoryId: subCategoryId,
            });
          } catch (error) {
            setSubcategoryDataState((prev) => ({
              ...prev,
              [subCategoryId]: {
                status: "error",
                message:
                  error?.response?.data?.message ||
                  error?.message ||
                  "Failed to load subcategory details.",
              },
            }));
          }
        }),
      );
    } finally {
      setCategoryLoadingState((prev) => ({
        ...prev,
        [categoryId]: false,
      }));
    }
  };

  const loadSubcategoryCatalogForCategory = async (categoryId) => {
    const normalizedCategoryId = String(categoryId || "");
    if (!normalizedCategoryId) {
      return [];
    }

    const cached = subcategoryCatalogState?.[normalizedCategoryId];
    if (cached?.status === "loaded") {
      return cached.options || [];
    }

    setSubcategoryCatalogState((prev) => ({
      ...prev,
      [normalizedCategoryId]: {
        ...(prev?.[normalizedCategoryId] || {}),
        status: "loading",
        options: prev?.[normalizedCategoryId]?.options || [],
      },
    }));

    try {
      const res = await SubSategoryData(normalizedCategoryId);
      const responseData = res?.data?.data || {};
      const candidateLists = [
        responseData?.subcategoriesList,
        responseData?.subCategoriesList,
        responseData?.subcategories,
        responseData?.subCategories,
        responseData?.data?.subcategoriesList,
        responseData?.data?.subCategoriesList,
      ];

      const subcategoryList =
        candidateLists.find((list) => Array.isArray(list)) || [];

      const options = subcategoryList
        .map((item, index) => ({
          subCategoryId: String(
            item?._id || item?.subCategoryId || item?.id || "",
          ),
          subCategoryName:
            item?.name || item?.subCategoryName || `Subcategory ${index + 1}`,
        }))
        .filter((item) => item.subCategoryId);

      setSubcategoryCatalogState((prev) => ({
        ...prev,
        [normalizedCategoryId]: {
          status: "loaded",
          options,
        },
      }));

      return options;
    } catch (error) {
      setSubcategoryCatalogState((prev) => ({
        ...prev,
        [normalizedCategoryId]: {
          status: "error",
          options: [],
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Failed to load subcategory options.",
        },
      }));
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load subcategory options.",
      );
      return [];
    }
  };

  const openAddSubcategoryModal = async (group) => {
    const categoryId = String(group?.categoryId || "");
    if (!categoryId) {
      return;
    }

    const existingSubcategoryIds = (group?.subcategories || [])
      .map((item) => String(item?.subCategoryId || ""))
      .filter(Boolean);

    setAddSubcategoryModalState({
      isOpen: true,
      categoryId,
      categoryName: group?.categoryName || "",
      existingSubcategoryIds,
      saving: false,
    });

    await loadSubcategoryCatalogForCategory(categoryId);
  };

  const openAddFieldModal = (subCategory) => {
    const subcategoryId = String(subCategory?.subCategoryId || "");
    if (!subcategoryId) {
      return;
    }

    setAddFieldModalState({
      isOpen: true,
      subcategoryId,
      subcategoryName: subCategory?.subCategoryName || "Subcategory",
      saving: false,
    });
  };

  const closeAddFieldModal = () => {
    setAddFieldModalState((prev) => ({
      ...prev,
      isOpen: false,
      saving: false,
    }));
  };

  const createEmptyFieldValue = (fieldType) => {
    const normalizedType = String(fieldType || "text").toLowerCase();
    if (normalizedType === "file" || normalizedType === "checkbox") {
      return [];
    }

    return "";
  };

  const handleAddAdditionalField = async ({
    fieldName,
    fieldLabel,
    fieldType,
    required,
  }) => {
    const caseId = String(param?.id || "");
    const subcategoryId = String(addFieldModalState?.subcategoryId || "");
    const normalizedFieldName = String(fieldName || "").trim();
    const normalizedFieldLabel = String(fieldLabel || "").trim();
    const normalizedFieldType = String(fieldType || "text").toLowerCase();
    const camelCasePattern = /^[a-z][a-zA-Z0-9]*$/;

    if (!caseId || !subcategoryId) {
      toast.error("Missing subcategory context.");
      return;
    }

    if (!normalizedFieldName) {
      toast.error("Field name is required.");
      return;
    }

    if (!camelCasePattern.test(normalizedFieldName)) {
      toast.error("Field name must be camelCase (example: emergencyContact).");
      return;
    }

    try {
      setAddFieldModalState((prev) => ({
        ...prev,
        saving: true,
      }));

      const res = await getCaseSubcategoryData({
        caseId,
        subcategoryId,
      });
      const payload = extractSubcategoryPayload(res);

      const existingFieldKeys = new Set([
        ...Object.keys(payload?.formData || {}),
        ...Object.keys(payload?.customizedData || {}),
      ]);

      if (existingFieldKeys.has(normalizedFieldName)) {
        toast.error("Field name already exists. Please use a unique name.");
        setAddFieldModalState((prev) => ({
          ...prev,
          saving: false,
        }));
        return;
      }

      const updatedCustomizedData = {
        ...(payload?.customizedData || {}),
        [normalizedFieldName]: createEmptyFieldValue(normalizedFieldType),
      };

      const saveRes = await saveCaseSubcategoryData({
        caseId,
        subcategoryId,
        formData: payload?.formData || {},
        customizedData: updatedCustomizedData,
      });

      if (saveRes?.status === 200) {
        setSubcategoryDataState((prev) => ({
          ...prev,
          [subcategoryId]: {
            ...(prev?.[subcategoryId] || {}),
            status: "loaded",
            formData: payload?.formData || {},
            customizedData: updatedCustomizedData,
            verifiedFields: payload?.verifiedFields || {},
          },
        }));

        const newFieldDefinition = {
          id: normalizedFieldName,
          label: normalizedFieldLabel || normalizedFieldName,
          type: normalizedFieldType,
          required: Boolean(required),
          placeholder: "",
          options: [],
          isCustomized: true,
          bucket: "customizedData",
          isAdditional: true,
        };

        setSubcategoryTemplateState((prev) => {
          const existingEntry = prev?.[subcategoryId] || {
            status: "loaded",
            fields: [],
          };
          const existingFields = Array.isArray(existingEntry?.fields)
            ? existingEntry.fields
            : [];
          const hasExistingField = existingFields.some(
            (field) => String(field?.id || "") === normalizedFieldName,
          );

          return {
            ...prev,
            [subcategoryId]: {
              ...existingEntry,
              status: "loaded",
              fields: hasExistingField
                ? existingFields
                : [...existingFields, newFieldDefinition],
            },
          };
        });

        toast.success(
          saveRes?.data?.message || "Additional field added successfully.",
        );
        closeAddFieldModal();
      }
    } catch (error) {
      setAddFieldModalState((prev) => ({
        ...prev,
        saving: false,
      }));
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to add additional field.",
      );
    }
  };

  const closeAddSubcategoryModal = () => {
    setAddSubcategoryModalState((prev) => ({
      ...prev,
      isOpen: false,
      saving: false,
    }));
  };

  const handleAddSubcategory = async (
    subCategoryId,
    formDataFromModal = {},
    customizedDataFromModal = {},
  ) => {
    const caseId = String(param?.id || "");
    const categoryId = String(addSubcategoryModalState?.categoryId || "");
    const normalizedSubCategoryId = String(subCategoryId || "");

    if (!caseId || !categoryId || !normalizedSubCategoryId) {
      return;
    }

    const alreadyAdded = (
      addSubcategoryModalState?.existingSubcategoryIds || []
    )
      .map((item) => String(item || ""))
      .includes(normalizedSubCategoryId);

    if (alreadyAdded) {
      toast.info("This subcategory is already added to the case.");
      return;
    }

    try {
      setAddSubcategoryModalState((prev) => ({
        ...prev,
        saving: true,
      }));

      const res = await addCaseServiceSubcategory({
        caseId,
        categoryId,
        subCategoryId: normalizedSubCategoryId,
        formData: formDataFromModal || {},
        customizedData: customizedDataFromModal || {},
      });

      if (res?.status === 200) {
        toast.success(
          res?.data?.message ||
            "Additional service subcategory added successfully.",
        );
        closeAddSubcategoryModal();
        await fetchCaseDetails();
      }
    } catch (error) {
      setAddSubcategoryModalState((prev) => ({
        ...prev,
        saving: false,
      }));
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to add subcategory.",
      );
    }
  };

  const availableSubcategoryOptions = useMemo(() => {
    const categoryId = String(addSubcategoryModalState?.categoryId || "");
    const existingSet = new Set(
      (addSubcategoryModalState?.existingSubcategoryIds || [])
        .map((item) => String(item || ""))
        .filter(Boolean),
    );

    const rawOptions = subcategoryCatalogState?.[categoryId]?.options || [];
    return rawOptions.filter(
      (option) => !existingSet.has(String(option?.subCategoryId || "")),
    );
  }, [addSubcategoryModalState, subcategoryCatalogState]);

  const addSubcategoryEmptyReason = useMemo(() => {
    const categoryId = String(addSubcategoryModalState?.categoryId || "");
    const catalogEntry = subcategoryCatalogState?.[categoryId] || {};
    const rawOptionsCount = Array.isArray(catalogEntry?.options)
      ? catalogEntry.options.length
      : 0;

    if (rawOptionsCount === 0) {
      return "No subcategories are configured for this category.";
    }

    if (availableSubcategoryOptions.length === 0) {
      return "All available subcategories are already added for this category.";
    }

    return "";
  }, [
    addSubcategoryModalState,
    subcategoryCatalogState,
    availableSubcategoryOptions,
  ]);

  return (
    <div className="space-y-3">
      {loading && <CustomLoader />}

      <CaseHeader
        caseId={param?.id}
        showMarkAsComplete={enableMarkAsComplete}
        caseData={caseData}
      />

      <ReviewContentComponent
        loading={loading}
        serviceGroups={serviceGroups}
        getSubcategoryState={getSubcategoryState}
        getSubcategoryEditState={getSubcategoryEditState}
        getSubcategoryTemplateState={getSubcategoryTemplateState}
        onCategoryToggle={loadCategorySubcategories}
        onOpenAddSubcategory={openAddSubcategoryModal}
        onOpenAddFieldSubcategory={openAddFieldModal}
        onPrimaryActionSubcategory={handlePrimaryAction}
        onEditStart={startSubcategoryEdit}
        onEditCancel={cancelSubcategoryEdit}
        onFieldChange={changeSubcategoryFieldValue}
        onSaveSubcategory={saveSubcategoryEdits}
        subcategoryPrimaryActionLabel={subcategoryPrimaryActionLabel}
      />

      <BackendFinalizeVerificationModal
        isOpen={verificationModalState?.isOpen}
        onClose={closeVerificationModal}
        subcategoryName={verificationModalState?.subcategoryName}
        verificationMode={verificationModalState?.verificationMode}
        targetKeyName={verificationModalState?.targetKeyName}
        onStartVerification={startVerificationRequest}
        onFinalizeVerification={finalizeVerificationRequest}
      />

      <AddAdditionalFieldModal
        isOpen={addFieldModalState?.isOpen}
        onClose={closeAddFieldModal}
        subcategoryName={addFieldModalState?.subcategoryName}
        saveLoading={addFieldModalState?.saving}
        onSubmit={handleAddAdditionalField}
      />

      <AddSubcategoryModal
        isOpen={addSubcategoryModalState?.isOpen}
        onClose={closeAddSubcategoryModal}
        categoryName={addSubcategoryModalState?.categoryName}
        options={availableSubcategoryOptions}
        emptyReason={addSubcategoryEmptyReason}
        loadingOptions={
          subcategoryCatalogState?.[addSubcategoryModalState?.categoryId]
            ?.status === "loading"
        }
        saveLoading={addSubcategoryModalState?.saving}
        onSubmit={handleAddSubcategory}
      />
    </div>
  );
};

export default ReviewAndConfirm;
