import { useForm } from "react-hook-form";
import { ChevronLeft } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import CustomLoader from "@/components/common/CustomLoader";
import {
  creatCase,
  saveCaseSubcategoryData,
  getCaseSubcategoryData,
} from "@/Services/CasesManagmentServices";
import { generateDynamicForm } from "@/Services/CreateNewCaseServices";
import { toast } from "react-toastify";
import useAuthStore from "@/store/useAuthStore";
import LoadingButton from "@/components/common/Buttons/CustomButton";
import CaseSuccessModal from "./Components/CaseSuccessModal";
import CreateCaseStepperHeader from "./Components/CreateCaseStepperHeader";
import CreateCaseStepRenderer from "./Components/CreateCaseStepRenderer";
import {
  CREATE_CASE_STEPS,
  getVisibleSteps,
  GENERAL_DETAILS_SUBCATEGORY_ID,
  OTHER_CATEGORY_ID,
} from "./Components/createCaseStepperConfig";
import {
  buildSectionSubmissionPayload,
  getRequiredDynamicFieldPaths,
  getSelectedSubcategoryIds,
  getSubcategoryCacheKey,
  normalizeDynamicSections,
} from "./Components/dynamicFormUtils";

const CREATE_CASE_DRAFT_SESSION_KEY = "create-new-case-draft-v1";
const LOCKED_ADDITIONAL_FIELD_SUBCATEGORY_IDS = [
  GENERAL_DETAILS_SUBCATEGORY_ID,
];

const CreateNewCase = () => {
  const user = useAuthStore((state) => state.user);
  const userRole = user?.roleName;

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get filtered steps based on role
  const visibleSteps = useMemo(() => getVisibleSteps(userRole));
  const [loading, setLoading] = useState(false);
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState("");
  const [selectedServicePayload, setSelectedServicePayload] = useState();
  const [uploadedDocPayload, setUploadedDocPayload] = useState();
  const [resetKey, setResetKey] = useState(0);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [caseId, setCaseId] = useState();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [dynamicSections, setDynamicSections] = useState([]);
  const [loadedCategoryIds, setLoadedCategoryIds] = useState([]);
  const [categoryLoadingState, setCategoryLoadingState] = useState({});
  const [sectionSaveState, setSectionSaveState] = useState({});
  const [isDraftHydrated, setIsDraftHydrated] = useState(false);
  const generateFormCacheRef = useRef({});
  const inFlightGenerateRef = useRef({});
  const hydratedSubcategoriesRef = useRef(new Set());

  const form = useForm({
    mode: "onChange",
    defaultValues: {
      dynamicFields: {},
    },
  });

  const {
    handleSubmit,
    register,
    setValue,
    getValues,
    trigger,
    clearErrors,
    formState: { errors },
  } = form;
  const watchedFormValues = form.watch();

  const resetStepperState = () => {
    setCurrentStep(0);
    setCompletedSteps([]);
    setSelectedServiceTypeId("");
    setSelectedServicePayload(undefined);
    setUploadedDocPayload(undefined);
    setCaseId(undefined);
    setDynamicSections([]);
    setLoadedCategoryIds([]);
    setCategoryLoadingState({});
    setSectionSaveState({});
    generateFormCacheRef.current = {};
    inFlightGenerateRef.current = {};
    hydratedSubcategoriesRef.current.clear();
    sessionStorage.removeItem(CREATE_CASE_DRAFT_SESSION_KEY);
  };

  const buildSanitizedServices = () => {
    return (Array.isArray(selectedServicePayload) ? selectedServicePayload : [])
      .map((serviceItem) => {
        const explicitSubCategoryIds = Array.isArray(
          serviceItem?.subCategoryIds,
        )
          ? serviceItem.subCategoryIds
          : [];
        const nestedSubCategoryIds = Array.isArray(serviceItem?.subcategories)
          ? serviceItem.subcategories
              .map(
                (subCategory) => subCategory?.subCategoryId || subCategory?._id,
              )
              .filter(Boolean)
          : [];

        return {
          categoryId: serviceItem?.categoryId,
          subCategoryIds: [
            ...new Set(
              [...explicitSubCategoryIds, ...nestedSubCategoryIds].filter(
                Boolean,
              ),
            ),
          ],
        };
      })
      .filter(
        (serviceItem) =>
          serviceItem.categoryId && serviceItem.subCategoryIds.length,
      );
  };

  const ensureCaseDraft = async () => {
    if (caseId) {
      return caseId;
    }

    const normalizedServiceTypeId = String(selectedServiceTypeId || "");
    const services = buildSanitizedServices();

    if (!normalizedServiceTypeId) {
      throw new Error("Please select a service type.");
    }

    if (!services.length) {
      throw new Error("Please select at least one service with subcategory.");
    }

    const res = await creatCase({
      clientId: user._id,
      serviceTypeId: normalizedServiceTypeId,
      services,
    });

    const draftCaseId = res?.data?.data?.id;

    if (!draftCaseId) {
      throw new Error("Case id not returned by create API.");
    }

    setCaseId(draftCaseId);
    return draftCaseId;
  };

  const getCategorySubcategoryIds = (categoryItem) => {
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

  const mergeDynamicSections = (
    existingSections = [],
    incomingSections = [],
  ) => {
    const mergedSectionsMap = new Map();

    [...existingSections, ...incomingSections].forEach((section, index) => {
      const dedupeKey =
        section?.key ||
        `${section?.categoryId || ""}:${section?.subCategoryId || ""}:${section?.title || ""}:${index}`;
      mergedSectionsMap.set(dedupeKey, section);
    });

    return Array.from(mergedSectionsMap.values()).sort(
      (a, b) => Number(a?.order || 0) - Number(b?.order || 0),
    );
  };

  const hydrateSavedSectionValues = async (sections = []) => {
    if (!caseId || !Array.isArray(sections) || !sections.length) {
      return;
    }

    const sectionsToHydrate = sections.filter((section) => {
      const subcategoryId = section?.subCategoryId || section?.subcategoryId;
      return (
        subcategoryId &&
        !hydratedSubcategoriesRef.current.has(String(subcategoryId))
      );
    });

    if (!sectionsToHydrate.length) {
      return;
    }

    const results = await Promise.allSettled(
      sectionsToHydrate.map(async (section) => {
        const subcategoryId = section?.subCategoryId || section?.subcategoryId;
        const res = await getCaseSubcategoryData({
          caseId,
          subcategoryId,
        });

        const savedData = res?.data?.data;
        if (!savedData) {
          return;
        }

        const mergedData = {
          ...(savedData?.formData || {}),
          ...(savedData?.customizedData || {}),
        };

        Object.entries(mergedData).forEach(([fieldId, value]) => {
          setValue(`dynamicFields.${fieldId}`, value, {
            shouldDirty: false,
            shouldValidate: false,
          });
        });

        hydratedSubcategoriesRef.current.add(String(subcategoryId));
      }),
    );

    const failedCount = results.filter(
      (result) => result.status === "rejected",
    ).length;

    if (failedCount) {
      toast.error("Some saved subcategories could not be reloaded.");
    }
  };

  const loadDynamicSectionsForCategory = async (
    categoryId,
    categorySubcategoryIds = [],
  ) => {
    const normalizedCategoryId = String(categoryId || "");
    if (!normalizedCategoryId) {
      return [];
    }

    const subcategoryIds = [
      ...new Set((categorySubcategoryIds || []).filter(Boolean)),
    ];

    if (!subcategoryIds.length) {
      setLoadedCategoryIds((prev) =>
        prev.includes(normalizedCategoryId)
          ? prev
          : [...prev, normalizedCategoryId],
      );
      return [];
    }

    const cacheKey = getSubcategoryCacheKey(subcategoryIds);

    try {
      setCategoryLoadingState((prev) => ({
        ...prev,
        [normalizedCategoryId]: true,
      }));

      let generatedSections = generateFormCacheRef.current[cacheKey];

      if (!generatedSections) {
        if (!inFlightGenerateRef.current[cacheKey]) {
          inFlightGenerateRef.current[cacheKey] = generateDynamicForm(
            subcategoryIds,
          )
            .then((res) =>
              normalizeDynamicSections(res?.data?.data?.sections || []),
            )
            .finally(() => {
              delete inFlightGenerateRef.current[cacheKey];
            });
        }

        generatedSections = await inFlightGenerateRef.current[cacheKey];
        generateFormCacheRef.current[cacheKey] = generatedSections;
      }

      setDynamicSections((prev) =>
        mergeDynamicSections(prev, generatedSections),
      );
      setLoadedCategoryIds((prev) =>
        prev.includes(normalizedCategoryId)
          ? prev
          : [...prev, normalizedCategoryId],
      );

      await hydrateSavedSectionValues(generatedSections);

      return generatedSections;
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load category fields.",
      );
      throw error;
    } finally {
      setCategoryLoadingState((prev) => ({
        ...prev,
        [normalizedCategoryId]: false,
      }));
    }
  };

  const totalSteps = visibleSteps.length;
  const isLastStep = currentStep === totalSteps - 1;
  const hasAtLeastOneUserSelectedService = useMemo(() => {
    return (Array.isArray(selectedServicePayload) ? selectedServicePayload : [])
      .filter((serviceItem) => !Boolean(serviceItem?.isHiddenService))
      .some((serviceItem) => Boolean(serviceItem?.categoryId));
  }, [selectedServicePayload]);

  useEffect(() => {
    if (searchParams.get("new") === "true") {
      sessionStorage.removeItem(CREATE_CASE_DRAFT_SESSION_KEY);
      window.history.replaceState(null, "", "/createnewcase");
    }
  }, [searchParams]);

  useEffect(() => {
    try {
      const rawDraft = sessionStorage.getItem(CREATE_CASE_DRAFT_SESSION_KEY);

      if (!rawDraft) {
        return;
      }

      const parsedDraft = JSON.parse(rawDraft);
      const draftStep = Number(parsedDraft?.currentStep);
      const draftCompletedSteps = Array.isArray(parsedDraft?.completedSteps)
        ? parsedDraft.completedSteps
        : [];

      const restoredStep = Number.isFinite(draftStep)
        ? Math.max(0, Math.min(draftStep, totalSteps - 1))
        : 0;

      setCurrentStep(restoredStep);
      setCompletedSteps(draftCompletedSteps);

      const shouldRestoreServices = draftCompletedSteps.includes(0);
      const shouldRestoreDynamicMainValues = draftCompletedSteps.includes(1);
      const shouldRestoreDynamicOtherValues = draftCompletedSteps.includes(2);

      if (shouldRestoreServices) {
        setSelectedServiceTypeId(
          String(parsedDraft?.selectedServiceTypeId || ""),
        );
        setSelectedServicePayload(
          Array.isArray(parsedDraft?.selectedServicePayload)
            ? parsedDraft.selectedServicePayload
            : undefined,
        );
      }

      if (parsedDraft?.caseId) {
        setCaseId(parsedDraft.caseId);
      }

      setDynamicSections(
        Array.isArray(parsedDraft?.dynamicSections)
          ? parsedDraft.dynamicSections
          : [],
      );
      setLoadedCategoryIds(
        Array.isArray(parsedDraft?.loadedCategoryIds)
          ? parsedDraft.loadedCategoryIds
          : [],
      );

      const shouldRestoreAnyDynamicValues =
        shouldRestoreDynamicMainValues || shouldRestoreDynamicOtherValues;

      const formValues = shouldRestoreAnyDynamicValues
        ? parsedDraft?.formValues?.dynamicFields ||
          parsedDraft?.dynamicFields ||
          {}
        : {};

      form.reset({
        dynamicFields: formValues,
      });
    } catch (error) {
      sessionStorage.removeItem(CREATE_CASE_DRAFT_SESSION_KEY);
    } finally {
      setIsDraftHydrated(true);
    }
  }, [form, totalSteps]);

  useEffect(() => {
    if (!isDraftHydrated) {
      return;
    }

    const draftData = {
      currentStep,
      completedSteps,
      selectedServiceTypeId: selectedServiceTypeId || "",
      selectedServicePayload: selectedServicePayload || [],
      uploadedDocPayload: uploadedDocPayload || [],
      dynamicSections: dynamicSections || [],
      loadedCategoryIds: loadedCategoryIds || [],
      caseId: caseId || "",
      formValues: {
        dynamicFields: watchedFormValues?.dynamicFields || {},
      },
    };

    sessionStorage.setItem(
      CREATE_CASE_DRAFT_SESSION_KEY,
      JSON.stringify(draftData),
    );
  }, [
    isDraftHydrated,
    currentStep,
    completedSteps,
    selectedServiceTypeId,
    selectedServicePayload,
    uploadedDocPayload,
    dynamicSections,
    loadedCategoryIds,
    caseId,
    watchedFormValues,
  ]);

  const handleSaveSection = async (section) => {
    if (!section?.subCategoryId && !section?.subcategoryId) {
      toast.error("Unable to identify the subcategory for this section.");
      return;
    }

    const sectionKey =
      section.key || section.subCategoryId || section.subcategoryId;

    try {
      setSectionSaveState((prev) => ({
        ...prev,
        [sectionKey]: { status: "saving" },
      }));

      const requiredFieldPaths = getRequiredDynamicFieldPaths([section]);
      if (requiredFieldPaths.length) {
        const isSectionValid = await trigger(requiredFieldPaths);

        if (!isSectionValid) {
          setSectionSaveState((prev) => ({
            ...prev,
            [sectionKey]: { status: "dirty" },
          }));
          return;
        }
      }

      const draftCaseId = await ensureCaseDraft();
      const submissionPayload = buildSectionSubmissionPayload({
        section,
        values: watchedFormValues?.dynamicFields || {},
        customizedCategoryIds: [OTHER_CATEGORY_ID],
      });

      const res = await saveCaseSubcategoryData({
        caseId: draftCaseId,
        subcategoryId: submissionPayload.subcategoryId,
        formData: submissionPayload.formData,
        customizedData: submissionPayload.customizedData,
      });

      if (res.status === 200) {
        setSectionSaveState((prev) => ({
          ...prev,
          [sectionKey]: { status: "saved" },
        }));
        toast.success(
          res?.data?.message ||
            `${section.title || "Section"} saved successfully.`,
        );
      }
    } catch (error) {
      setSectionSaveState((prev) => ({
        ...prev,
        [sectionKey]: {
          status: "error",
          message:
            error?.response?.data?.message || error?.message || "Save failed",
        },
      }));
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save section.",
      );
    }
  };

  const handleSectionChange = (section) => {
    const sectionKey =
      section?.key || section?.subCategoryId || section?.subcategoryId;

    if (!sectionKey) {
      return;
    }

    setSectionSaveState((prev) => {
      const currentState = prev?.[sectionKey];

      if (currentState?.status === "saving") {
        return prev;
      }

      return {
        ...prev,
        [sectionKey]: { status: "dirty" },
      };
    });
  };

  const handleAddField = (section, fieldDefinition) => {
    const sectionSubcategoryId = String(
      section?.subCategoryId || section?.subcategoryId || "",
    );

    if (
      LOCKED_ADDITIONAL_FIELD_SUBCATEGORY_IDS.includes(sectionSubcategoryId)
    ) {
      return {
        success: false,
        message: "Additional fields are disabled for General Details.",
      };
    }

    const sectionKey =
      section?.key || section?.subCategoryId || section?.subcategoryId;

    if (!sectionKey || !fieldDefinition?.id) {
      return {
        success: false,
        message: "Unable to add field to this section.",
      };
    }

    const alreadyExists = (
      Array.isArray(dynamicSections) ? dynamicSections : []
    )
      .flatMap((dynamicSection) => dynamicSection?.fields || [])
      .some((field) => String(field?.id || "") === String(fieldDefinition.id));

    if (alreadyExists) {
      return {
        success: false,
        message: "Field name already exists. Please use a unique name.",
      };
    }

    setDynamicSections((prev) => {
      const safeSections = Array.isArray(prev) ? prev : [];
      let sectionExists = false;

      const nextSections = safeSections.map((dynamicSection) => {
        const dynamicSectionKey =
          dynamicSection?.key ||
          dynamicSection?.subCategoryId ||
          dynamicSection?.subcategoryId;

        if (String(dynamicSectionKey) !== String(sectionKey)) {
          return dynamicSection;
        }

        sectionExists = true;
        return {
          ...dynamicSection,
          fields: [...(dynamicSection.fields || []), fieldDefinition],
        };
      });

      if (sectionExists) {
        return nextSections;
      }

      return [
        ...nextSections,
        {
          key: sectionKey,
          title: section?.title || "Additional Fields",
          order: Number(section?.order || nextSections.length),
          categoryId: section?.categoryId || "",
          subCategoryId: section?.subCategoryId || section?.subcategoryId || "",
          fields: [fieldDefinition],
        },
      ];
    });

    if (fieldDefinition.type === "file") {
      setValue(`dynamicFields.${fieldDefinition.id}`, [], {
        shouldDirty: false,
      });
    }

    handleSectionChange(section);

    return { success: true };
  };

  const handleEditField = (section, fieldId, updatedFieldDefinition) => {
    const sectionSubcategoryId = String(
      section?.subCategoryId || section?.subcategoryId || "",
    );

    if (
      LOCKED_ADDITIONAL_FIELD_SUBCATEGORY_IDS.includes(sectionSubcategoryId)
    ) {
      return {
        success: false,
        message: "Additional fields are disabled for General Details.",
      };
    }

    const sectionKey =
      section?.key || section?.subCategoryId || section?.subcategoryId;

    if (!sectionKey || !fieldId || !updatedFieldDefinition) {
      return {
        success: false,
        message: "Unable to update field.",
      };
    }

    const currentField = (Array.isArray(dynamicSections) ? dynamicSections : [])
      .flatMap((dynamicSection) => dynamicSection?.fields || [])
      .find((field) => String(field?.id || "") === String(fieldId));

    const hasTypeChanged =
      String(currentField?.type || "") !==
      String(updatedFieldDefinition?.type || "");

    setDynamicSections((prev) =>
      (Array.isArray(prev) ? prev : []).map((dynamicSection) => {
        const dynamicSectionKey =
          dynamicSection?.key ||
          dynamicSection?.subCategoryId ||
          dynamicSection?.subcategoryId;

        if (String(dynamicSectionKey) !== String(sectionKey)) {
          return dynamicSection;
        }

        return {
          ...dynamicSection,
          fields: (dynamicSection.fields || []).map((field) =>
            String(field?.id || "") === String(fieldId)
              ? {
                  ...field,
                  ...updatedFieldDefinition,
                  id: field.id,
                  isAdditional: true,
                  bucket: "customizedData",
                }
              : field,
          ),
        };
      }),
    );

    if (hasTypeChanged) {
      setValue(
        `dynamicFields.${fieldId}`,
        updatedFieldDefinition?.type === "file" ? [] : "",
        {
          shouldDirty: true,
          shouldValidate: true,
        },
      );
    }

    setSectionSaveState((prev) => ({
      ...prev,
      [sectionKey]: { status: "dirty" },
    }));

    return { success: true };
  };

  const handleRemoveField = (section, fieldId) => {
    const sectionSubcategoryId = String(
      section?.subCategoryId || section?.subcategoryId || "",
    );

    if (
      LOCKED_ADDITIONAL_FIELD_SUBCATEGORY_IDS.includes(sectionSubcategoryId)
    ) {
      return {
        success: false,
        message: "Additional fields are disabled for General Details.",
      };
    }

    const sectionKey =
      section?.key || section?.subCategoryId || section?.subcategoryId;

    if (!sectionKey || !fieldId) {
      return {
        success: false,
        message: "Unable to remove field.",
      };
    }

    setDynamicSections((prev) =>
      (Array.isArray(prev) ? prev : []).map((dynamicSection) => {
        const dynamicSectionKey =
          dynamicSection?.key ||
          dynamicSection?.subCategoryId ||
          dynamicSection?.subcategoryId;

        if (String(dynamicSectionKey) !== String(sectionKey)) {
          return dynamicSection;
        }

        return {
          ...dynamicSection,
          fields: (dynamicSection.fields || []).filter(
            (field) => String(field?.id || "") !== String(fieldId),
          ),
        };
      }),
    );

    setValue(`dynamicFields.${fieldId}`, undefined, {
      shouldDirty: true,
      shouldValidate: false,
    });

    clearErrors(`dynamicFields.${fieldId}`);

    setSectionSaveState((prev) => ({
      ...prev,
      [sectionKey]: { status: "dirty" },
    }));

    return { success: true };
  };

  const saveAllLoadedSections = async (activeCaseId) => {
    if (!Array.isArray(dynamicSections) || !dynamicSections.length) {
      return [];
    }

    const results = await Promise.allSettled(
      dynamicSections
        .filter((section) => section?.subCategoryId || section?.subcategoryId)
        .map((section) => {
          const submissionPayload = buildSectionSubmissionPayload({
            section,
            values: watchedFormValues?.dynamicFields || {},
            customizedCategoryIds: [OTHER_CATEGORY_ID],
          });

          return saveCaseSubcategoryData({
            caseId: activeCaseId,
            subcategoryId: submissionPayload.subcategoryId,
            formData: submissionPayload.formData,
            customizedData: submissionPayload.customizedData,
          });
        }),
    );

    const failedResults = results.filter(
      (result) => result.status === "rejected",
    );

    if (failedResults.length) {
      throw new Error("One or more subcategory saves failed.");
    }

    return results;
  };

  useEffect(() => {
    const selectedCategoryIds = new Set(
      (Array.isArray(selectedServicePayload) ? selectedServicePayload : [])
        .map((categoryItem) => String(categoryItem?.categoryId || ""))
        .filter(Boolean),
    );

    if (!selectedCategoryIds.size) {
      setDynamicSections([]);
      setLoadedCategoryIds([]);
      setCategoryLoadingState({});
      return;
    }

    setDynamicSections((prev) =>
      (Array.isArray(prev) ? prev : []).filter((section) =>
        selectedCategoryIds.has(String(section?.categoryId || "")),
      ),
    );
    setLoadedCategoryIds((prev) =>
      (Array.isArray(prev) ? prev : []).filter((categoryId) =>
        selectedCategoryIds.has(String(categoryId || "")),
      ),
    );
    setCategoryLoadingState((prev) => {
      const nextState = {};
      Object.entries(prev || {}).forEach(([categoryId, isLoading]) => {
        if (selectedCategoryIds.has(String(categoryId || ""))) {
          nextState[categoryId] = isLoading;
        }
      });
      return nextState;
    });
  }, [selectedServicePayload]);

  const handleNext = async () => {
    const stepConfig = visibleSteps[currentStep];

    if (
      stepConfig.validationType === "service" &&
      !hasAtLeastOneUserSelectedService
    ) {
      if (!selectedServiceTypeId) {
        toast.error("Please select a service type.");
        return;
      }

      toast.error("Please select at least one service.");
      return;
    }

    if (stepConfig.validationType === "service") {
      const subcategoryIds = getSelectedSubcategoryIds(selectedServicePayload);

      if (!subcategoryIds.length) {
        toast.error("Please select at least one subcategory.");
        return;
      }

      setDynamicSections([]);
      setLoadedCategoryIds([]);
      setCategoryLoadingState({});
    }

    if (
      stepConfig.validationType === "dynamicMain" ||
      stepConfig.validationType === "dynamicOther"
    ) {
      if (stepConfig.validationType === "dynamicMain") {
        const requiredMainCategoryIds = (
          Array.isArray(selectedServicePayload) ? selectedServicePayload : []
        )
          .filter(
            (categoryItem) => categoryItem?.categoryId !== OTHER_CATEGORY_ID,
          )
          .map((categoryItem) => ({
            categoryId: categoryItem?.categoryId,
            subcategoryIds: getCategorySubcategoryIds(categoryItem),
          }))
          .filter(
            (categoryItem) =>
              categoryItem.categoryId && categoryItem.subcategoryIds.length,
          )
          .map((categoryItem) => String(categoryItem.categoryId));

        const unopenedMainCategoryIds = requiredMainCategoryIds.filter(
          (categoryId) => !loadedCategoryIds.includes(categoryId),
        );

        if (unopenedMainCategoryIds.length) {
          toast.error(
            "Please open all selected service categories in this step.",
          );
          return;
        }
      }
    }

    setCompletedSteps((prev) => {
      if (!prev.includes(currentStep)) {
        return [...prev, currentStep];
      }
      return prev;
    });
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const activeCaseId = await ensureCaseDraft();
      setCaseId(activeCaseId);

      const saveResults = await saveAllLoadedSections(activeCaseId);

      if (saveResults.some((result) => result.status === "rejected")) {
        toast.error("Some subcategory data could not be saved.");
        return;
      }

      toast.success("All subcategory data saved successfully.");
      setResetKey((prev) => prev + 1);
      form.reset();
      resetStepperState();
      setCaseId(activeCaseId);
      setOpenSuccessModal(true);
    } catch (error) {
      console.log(error, "error");
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save case.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-2 space-y-2 relative"
      >
        {loading && <CustomLoader className="fixed" />}
        {/* HEADER */}
        <div className="flex justify-between">
          <div>
            <Link to={"/"} className="flex">
              <p className="font-bold text-textsecondary flex hover:text-primary ">
                {" "}
                <span>
                  {" "}
                  <ChevronLeft />
                </span>{" "}
                Back to Dashboard
              </p>
            </Link>
            <h2 className="text-xl font-bold">New Case Details</h2>
          </div>
        </div>

        <CreateCaseStepperHeader
          steps={visibleSteps}
          currentStep={currentStep}
        />

        <CreateCaseStepRenderer
          stepId={visibleSteps[currentStep]?.id}
          register={register}
          errors={errors}
          setValue={setValue}
          getValues={getValues}
          clearErrors={clearErrors}
          setLoading={setLoading}
          resetKey={resetKey}
          dynamicSections={dynamicSections}
          loadedCategoryIds={loadedCategoryIds}
          categoryLoadingState={categoryLoadingState}
          onCategoryOpen={loadDynamicSectionsForCategory}
          onSaveSection={handleSaveSection}
          sectionSaveState={sectionSaveState}
          onSectionChange={handleSectionChange}
          onAddField={handleAddField}
          onEditField={handleEditField}
          onRemoveField={handleRemoveField}
          lockedAdditionalFieldSubcategoryIds={
            LOCKED_ADDITIONAL_FIELD_SUBCATEGORY_IDS
          }
          selectedServiceTypeId={selectedServiceTypeId}
          selectedServicePayload={selectedServicePayload}
          uploadedDocPayload={uploadedDocPayload}
          setSelectedServiceTypeId={setSelectedServiceTypeId}
          setSelectedServicePayload={setSelectedServicePayload}
          setUploadedDocPayload={setUploadedDocPayload}
        />

        <div className="flex items-center justify-end gap-2 pt-2">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="border border-gray-300 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-100"
            >
              Back
            </button>
          )}

          {!isLastStep && (
            <button
              type="button"
              onClick={handleNext}
              disabled={
                visibleSteps[currentStep]?.validationType === "service" &&
                !hasAtLeastOneUserSelectedService
              }
              className="bg-primary text-white px-6 py-2 rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          )}

          {isLastStep && (
            <LoadingButton
              loading={loading}
              type="submit"
              className="bg-primary text-white px-8 py-2"
            >
              Submit Case
            </LoadingButton>
          )}
        </div>
      </form>

      <CaseSuccessModal
        open={openSuccessModal}
        caseId={caseId}
        onCreateNew={() => {
          setOpenSuccessModal(false);
          navigate("/createnewcase?new=true");
        }}
        onGoHome={() => {
          navigate("/");
        }}
      />
    </>
  );
};

export default CreateNewCase;
