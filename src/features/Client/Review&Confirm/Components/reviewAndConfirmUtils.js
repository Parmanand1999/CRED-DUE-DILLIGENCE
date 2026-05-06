/**
 * Normalize subcategories from different API response formats
 */
export const normalizeSubcategories = (serviceItem = {}) => {
  console.log(serviceItem, "serviceItem");

  if (Array.isArray(serviceItem?.subCategories)) {
    return serviceItem.subCategories
      .map((subCategory, index) => ({
        subCategoryId: String(
          subCategory?.subCategoryId || subCategory?._id || "",
        ),
        subCategoryName:
          subCategory?.subCategoryName ||
          subCategory?.name ||
          `Subcategory ${index + 1}`,
        order: Number(subCategory?.order || index),
        status: subCategory?.status,
        verificationType: subCategory?.verificationType,
      }))
      .filter((subCategory) => subCategory.subCategoryId)
      .sort((a, b) => a.order - b.order);
  }

  if (Array.isArray(serviceItem?.subcategories)) {
    return serviceItem.subcategories
      .map((subCategory, index) => ({
        subCategoryId: String(
          subCategory?.subCategoryId || subCategory?._id || "",
        ),
        subCategoryName:
          subCategory?.subCategoryName ||
          subCategory?.name ||
          `Subcategory ${index + 1}`,
      }))
      .filter((subCategory) => subCategory.subCategoryId);
  }

  if (Array.isArray(serviceItem?.serviceSubcategories)) {
    return serviceItem.serviceSubcategories
      .map((subCategory, index) => ({
        subCategoryId: String(
          subCategory?.subCategoryId || subCategory?._id || "",
        ),
        subCategoryName:
          subCategory?.subCategoryName ||
          subCategory?.name ||
          `Subcategory ${index + 1}`,
      }))
      .filter((subCategory) => subCategory.subCategoryId);
  }

  if (Array.isArray(serviceItem?.subCategoryIds)) {
    return serviceItem.subCategoryIds
      .map((subCategoryId, index) => ({
        subCategoryId: String(subCategoryId || ""),
        subCategoryName: `Subcategory ${index + 1}`,
      }))
      .filter((subCategory) => subCategory.subCategoryId);
  }

  if (Array.isArray(serviceItem?.subcategoryIds)) {
    return serviceItem.subcategoryIds
      .map((subCategoryId, index) => ({
        subCategoryId: String(subCategoryId || ""),
        subCategoryName: `Subcategory ${index + 1}`,
      }))
      .filter((subCategory) => subCategory.subCategoryId);
  }

  return [];
};

/**
 * Extract case services from different API response formats
 */
export const extractCaseServices = (casePayload) => {
  const candidateArrays = [
    casePayload?.services,
    casePayload?.case?.services,
    casePayload?.caseDetails?.services,
    casePayload?.serviceDetails,
    casePayload?.case?.serviceDetails,
  ];

  const firstArray = candidateArrays.find((item) => Array.isArray(item));
  if (Array.isArray(firstArray)) {
    return firstArray;
  }

  const candidateObjects = [
    casePayload?.services,
    casePayload?.case?.services,
    casePayload?.serviceDetails,
  ];

  for (const candidate of candidateObjects) {
    if (candidate && typeof candidate === "object") {
      const values = Object.values(candidate).filter(Boolean);
      if (values.length) {
        return values;
      }
    }
  }

  return [];
};

/**
 * Merge and group services by category with deduplication
 */
export const mergeServiceGroups = (services = []) => {
  const groupedMap = new Map();

  (Array.isArray(services) ? services : []).forEach((serviceItem, index) => {
    const categoryId = String(
      serviceItem?.categoryId ||
      serviceItem?.serviceCategoryId ||
      serviceItem?.category?._id ||
      serviceItem?._id ||
      "",
    );

    if (!categoryId) {
      return;
    }

    const existingGroup = groupedMap.get(categoryId) || {
      categoryId,
      categoryName:
        serviceItem?.categoryName ||
        serviceItem?.serviceCategoryName ||
        serviceItem?.category?.name ||
        serviceItem?.name ||
        `Category ${index + 1}`,
      subcategories: [],
    };

    existingGroup.subcategories = [
      ...existingGroup.subcategories,
      ...normalizeSubcategories(serviceItem),
    ];

    groupedMap.set(categoryId, existingGroup);
  });

  return Array.from(groupedMap.values()).map((group) => {
    const dedupedSubcategories = [];
    const dedupeSet = new Set();

    group.subcategories.forEach((subCategory) => {
      const subCategoryId = String(subCategory?.subCategoryId || "");
      if (!subCategoryId || dedupeSet.has(subCategoryId)) {
        return;
      }

      dedupeSet.add(subCategoryId);
      dedupedSubcategories.push(subCategory);
    });

    return {
      ...group,
      subcategories: dedupedSubcategories,
    };
  });
};

/**
 * Format field value for display
 */
export const formatFieldValue = (value) => {
  if (Array.isArray(value)) {
    if (!value.length) {
      return "-";
    }

    return value
      .map((item) => (typeof item === "string" ? item : JSON.stringify(item)))
      .join(", ");
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }

  if (value === undefined || value === null || value === "") {
    return "-";
  }

  return String(value);
};

/**
 * Extract subcategory payload from API response
 */
export const extractSubcategoryPayload = (responseData) => {
  const rawData = responseData?.data?.data || {};
  const formData = rawData?.formData || rawData?.data?.formData || {};
  const customizedData =
    rawData?.customizedData || rawData?.data?.customizedData || {};
  const verifiedFields =
    rawData?.verifiedFields || rawData?.data?.verifiedFields || {};

  return {
    formData: formData && typeof formData === "object" ? formData : {},
    customizedData:
      customizedData && typeof customizedData === "object"
        ? customizedData
        : {},
    verifiedFields:
      verifiedFields && typeof verifiedFields === "object"
        ? verifiedFields
        : {},
  };
};

export const isDynamicValueEmpty = (value) => {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim() === "";
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return false;
};

export const getDynamicFieldValidationMessage = (field = {}, value) => {
  const fieldLabel = field?.label || field?.id || "Field";

  if (field?.required && isDynamicValueEmpty(value)) {
    return `${fieldLabel} is required`;
  }

  if (isDynamicValueEmpty(value)) {
    return "";
  }

  const validation =
    field?.validation && typeof field.validation === "object"
      ? field.validation
      : null;

  if (!validation) {
    return "";
  }

  const validationType = String(validation?.type || "").toLowerCase();
  const validationMessage = validation?.message || "Invalid value";
  const normalizedValue =
    typeof value === "string"
      ? value
      : Array.isArray(value)
        ? value.join(",")
        : String(value ?? "");

  if (validation?.pattern && (!validationType || validationType === "regex")) {
    try {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(normalizedValue)) {
        return validationMessage;
      }
    } catch (error) {
      // Keep field usable if API regex is malformed.
    }
  }

  if (
    typeof validation?.minLength === "number" &&
    normalizedValue.length < validation.minLength
  ) {
    return (
      validationMessage ||
      `${fieldLabel} must be at least ${validation.minLength} characters`
    );
  }

  if (
    typeof validation?.maxLength === "number" &&
    normalizedValue.length > validation.maxLength
  ) {
    return (
      validationMessage ||
      `${fieldLabel} must be at most ${validation.maxLength} characters`
    );
  }

  return "";
};

export const buildSubcategorySubmissionPayload = ({
  subcategoryId,
  draftFormData = {},
  draftCustomizedData = {},
}) => {
  const formData = {};
  const customizedData = {};

  Object.entries(draftFormData || {}).forEach(([key, value]) => {
    if (!isDynamicValueEmpty(value)) {
      formData[key] = value;
    }
  });

  Object.entries(draftCustomizedData || {}).forEach(([key, value]) => {
    if (!isDynamicValueEmpty(value)) {
      customizedData[key] = value;
    }
  });

  return {
    subcategoryId,
    formData,
    customizedData,
  };
};

const HIDDEN_DYNAMIC_FIELD_IDS = new Set(["customTextInfo"]);

export const extractSubcategoryFieldTemplates = (
  responseData,
  targetSubcategoryId = "",
) => {
  const normalizedTargetSubcategoryId = String(targetSubcategoryId || "");
  const sections =
    responseData?.data?.data?.sections ||
    responseData?.data?.sections ||
    responseData?.sections ||
    [];

  if (!Array.isArray(sections)) {
    return [];
  }

  const fieldMap = new Map();

  sections.forEach((section) => {
    const sectionSubcategoryId = String(
      section?.subcategoryId || section?.subCategoryId || "",
    );

    if (
      normalizedTargetSubcategoryId &&
      sectionSubcategoryId &&
      sectionSubcategoryId !== normalizedTargetSubcategoryId
    ) {
      return;
    }

    const rawFields = Array.isArray(section?.formData)
      ? section.formData
      : Array.isArray(section?.fields)
        ? section.fields
        : section?.id
          ? [section]
          : [];

    rawFields.forEach((field) => {
      const fieldId = String(field?.id || "");
      if (!fieldId || HIDDEN_DYNAMIC_FIELD_IDS.has(fieldId)) {
        return;
      }

      if (!fieldMap.has(fieldId)) {
        const explicitBucket = String(
          field?.bucket || field?.dataBucket || field?.targetBucket || "",
        ).trim();

        const normalizedType = String(field?.type || "text").toLowerCase();
        const normalizedOptions = Array.isArray(field?.options)
          ? field.options.map((option) => {
            if (typeof option === "string") {
              return { label: option, value: option };
            }

            return {
              label:
                option?.label || option?.name || option?.value || "Option",
              value:
                option?.value ||
                option?.id ||
                option?.name ||
                option?.label ||
                "",
            };
          })
          : [];

        fieldMap.set(fieldId, {
          id: fieldId,
          label: field?.label || fieldId,
          type: normalizedType,
          placeholder: field?.placeholder || "",
          required: Boolean(field?.required),
          validation:
            field?.validation && typeof field.validation === "object"
              ? field.validation
              : null,
          options: normalizedOptions.filter((option) => option.value !== ""),
          bucket:
            explicitBucket === "customizedData" || field?.isCustomized
              ? "customizedData"
              : "formData",
        });
      }
    });
  });

  return Array.from(fieldMap.values());
};
