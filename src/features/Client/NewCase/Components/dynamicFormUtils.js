const HIDDEN_DYNAMIC_FIELD_IDS = new Set(["customTextInfo"]);

export const isHiddenDynamicFieldId = (fieldId) => {
  return HIDDEN_DYNAMIC_FIELD_IDS.has(String(fieldId || ""));
};

export const normalizeDynamicSections = (sections = []) => {
  if (!Array.isArray(sections)) {
    return [];
  }

  return sections
    .map((section, index) => {
      const sectionTitle =
        section?.section || section?.title || `Section ${index + 1}`;

      const rawFields = Array.isArray(section?.formData)
        ? section.formData
        : Array.isArray(section?.fields)
          ? section.fields
          : section?.id
            ? [section]
            : [];

      const fields = rawFields
        .filter((field) => field?.id)
        .filter((field) => !isHiddenDynamicFieldId(field?.id))
        .map((field) => ({
          id: field.id,
          type: (field.type || "text").toLowerCase(),
          label: field.label || field.id,
          required: Boolean(field.required),
          validation:
            field?.validation && typeof field.validation === "object"
              ? field.validation
              : null,
          placeholder: field.placeholder || "",
          options: Array.isArray(field.options) ? field.options : [],
          bucket:
            field.bucket ||
            field.dataBucket ||
            field.targetBucket ||
            (field.isCustomized ? "customizedData" : ""),
        }));

      if (!fields.length) {
        return null;
      }

      return {
        key: section?._id || sectionTitle || `dynamic-section-${index}`,
        title: sectionTitle,
        order: Number(section?.order || index),
        categoryId: section?.categoryId || "",
        subCategoryId: section?.subcategoryId || section?.subCategoryId || "",
        fields,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.order - b.order);
};

const normalizeId = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value);
};

export const groupSectionsByCategory = (
  sections = [],
  selectedServicePayload = [],
) => {
  if (!Array.isArray(sections) || !sections.length) {
    return [];
  }

  const categoryGroups = (
    Array.isArray(selectedServicePayload) ? selectedServicePayload : []
  ).map((categoryItem, index) => {
    const explicitSubCategoryIds = Array.isArray(categoryItem?.subCategoryIds)
      ? categoryItem.subCategoryIds
      : [];

    const nestedSubCategoryIds = Array.isArray(categoryItem?.subcategories)
      ? categoryItem.subcategories.map(
          (subCategory) => subCategory?.subCategoryId,
        )
      : [];

    return {
      categoryId: normalizeId(categoryItem?.categoryId),
      categoryName: categoryItem?.categoryName || `Category ${index + 1}`,
      order: index,
      subCategoryIds: new Set(
        [...explicitSubCategoryIds, ...nestedSubCategoryIds]
          .map(normalizeId)
          .filter(Boolean),
      ),
      sections: [],
    };
  });

  const categoryById = new Map(
    categoryGroups
      .filter((group) => group.categoryId)
      .map((group) => [group.categoryId, group]),
  );

  const fallbackGroup = {
    categoryId: "__other__",
    categoryName: "Other Services",
    order: Number.MAX_SAFE_INTEGER,
    sections: [],
  };

  sections.forEach((section) => {
    const sectionCategoryId = normalizeId(section?.categoryId);
    const sectionSubCategoryId = normalizeId(section?.subCategoryId);

    let matchedCategory = sectionCategoryId
      ? categoryById.get(sectionCategoryId)
      : undefined;

    if (!matchedCategory && sectionSubCategoryId) {
      matchedCategory = categoryGroups.find((group) =>
        group.subCategoryIds.has(sectionSubCategoryId),
      );
    }

    if (!matchedCategory) {
      fallbackGroup.sections.push(section);
      return;
    }

    matchedCategory.sections.push(section);
  });

  return [
    ...categoryGroups.filter((group) => group.sections.length),
    ...(fallbackGroup.sections.length ? [fallbackGroup] : []),
  ].sort((a, b) => a.order - b.order);
};

export const getSelectedSubcategoryIds = (selectedServicePayload = []) => {
  return selectedServicePayload
    .flatMap((item) => item?.subCategoryIds || [])
    .filter(Boolean);
};

export const getSubcategoryCacheKey = (subcategoryIds = []) => {
  return [...subcategoryIds].sort().join("|");
};

export const getRequiredDynamicFieldPaths = (sections = []) => {
  return sections
    .flatMap((section) => section.fields || [])
    .filter((field) => !isHiddenDynamicFieldId(field?.id))
    .filter((field) => field.required)
    .map((field) => `dynamicFields.${field.id}`);
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

export const getFieldSubmissionBucket = (
  field,
  section,
  customizedCategoryIds = [],
) => {
  const explicitBucket = String(
    field?.bucket || field?.dataBucket || field?.targetBucket || "",
  ).trim();

  if (explicitBucket === "formData" || explicitBucket === "customizedData") {
    return explicitBucket;
  }

  if (field?.isCustomized) {
    return "customizedData";
  }

  const sectionCategoryId = normalizeId(section?.categoryId);
  const customizedSet = new Set(
    (Array.isArray(customizedCategoryIds) ? customizedCategoryIds : [])
      .map(normalizeId)
      .filter(Boolean),
  );

  if (sectionCategoryId && customizedSet.has(sectionCategoryId)) {
    return "customizedData";
  }

  return "formData";
};

export const buildSectionSubmissionPayload = ({
  section,
  values = {},
  customizedCategoryIds = [],
}) => {
  const formData = {};
  const customizedData = {};

  (Array.isArray(section?.fields) ? section.fields : []).forEach((field) => {
    if (!field?.id) {
      return;
    }

    if (isHiddenDynamicFieldId(field.id)) {
      return;
    }

    const value = values?.[field.id];

    if (isDynamicValueEmpty(value)) {
      return;
    }

    const bucket = getFieldSubmissionBucket(
      field,
      section,
      customizedCategoryIds,
    );

    if (bucket === "customizedData") {
      customizedData[field.id] = value;
      return;
    }

    formData[field.id] = value;
  });

  return {
    subcategoryId:
      section?.subCategoryId || section?.subcategoryId || section?.categoryId,
    formData,
    customizedData,
  };
};
