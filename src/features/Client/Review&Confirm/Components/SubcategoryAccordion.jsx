import { useMemo, useState } from "react";
import { postData } from "@/Services/apiServices";
import { toast } from "react-toastify";
import FieldDisplay from "./FieldDisplay";
import { getDynamicFieldValidationMessage } from "./reviewAndConfirmUtils";
import useAuthStore from "@/store/useAuthStore";

import { getStatusBadgeConfig } from "@/utils/statusUtils";
import { CanAccessVerificationType } from "@/features/CaseManagement/components/CanAccessVerificationType";

const SubcategoryAccordion = ({
  subCategory,
  subCategoryState,
  subCategoryEditState,
  subCategoryTemplateState,
  onPrimaryAction,
  onSecondaryAction,
  onAddAction,
  onFieldVerifyAction,
  onEditStart,
  onEditCancel,
  onFieldChange,
  onSave,
  primaryActionLabel = "Edit",
  addActionLabel = "Add",
  secondaryActionLabel = "",
  enableAddAction = false,
  enableSecondaryAction = false,
  enableFieldVerifyAction = false,
}) => {
  const roleName = useAuthStore((state) => state?.user?.roleName);

  const [uploadingFieldKey, setUploadingFieldKey] = useState("");
  const subCategoryId = String(subCategory?.subCategoryId || "");
  const isEditing = Boolean(subCategoryEditState?.isEditing);
  const isSaving = subCategoryEditState?.status === "saving";
  const isPreparing = subCategoryEditState?.status === "preparing";
  const combinedData = {
    ...(isEditing
      ? subCategoryEditState?.draftFormData
      : subCategoryState?.formData),
    ...(isEditing
      ? subCategoryEditState?.draftCustomizedData
      : subCategoryState?.customizedData),
  };
  const verifiedFields = subCategoryState?.verifiedFields || {};
  const fieldEntries = Object.entries(combinedData);
  const templateFields = Array.isArray(subCategoryTemplateState?.fields)
    ? subCategoryTemplateState.fields
    : [];
  const validationErrors = useMemo(() => {
    if (!isEditing) {
      return {};
    }

    const nextErrors = {};

    templateFields.forEach((field) => {
      const fieldId = String(field?.id || "");
      if (!fieldId) {
        return;
      }

      const fieldBucket = field?.bucket || "formData";
      const currentValue =
        fieldBucket === "customizedData"
          ? subCategoryEditState?.draftCustomizedData?.[fieldId]
          : subCategoryEditState?.draftFormData?.[fieldId];

      const validationMessage = getDynamicFieldValidationMessage(
        field,
        currentValue,
      );

      if (validationMessage) {
        nextErrors[fieldId] = validationMessage;
      }
    });

    return nextErrors;
  }, [
    isEditing,
    templateFields,
    subCategoryEditState?.draftFormData,
    subCategoryEditState?.draftCustomizedData,
  ]);

  const hasValidationErrors = Object.keys(validationErrors).length > 0;
  const templateFieldMap = new Map(
    templateFields.map((field) => [String(field?.id || ""), field]),
  );

  const getFieldMeta = (key) => {
    const templateField = templateFieldMap.get(String(key || ""));
    if (templateField) {
      return templateField;
    }

    return {
      id: key,
      label: key,
      type: "text",
      options: [],
      placeholder: "",
      required: false,
      bucket:
        key in (subCategoryEditState?.draftFormData || {}) ||
        key in (subCategoryState?.formData || {})
          ? "formData"
          : "customizedData",
    };
  };

  const toStringValue = (value) => {
    if (value === undefined || value === null) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    return String(value);
  };

  const normalizeCheckboxValue = (value) => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item));
    }

    if (typeof value === "string" && value.trim()) {
      return [value.trim()];
    }

    return [];
  };

  const normalizeUploadedValues = (value) => {
    if (Array.isArray(value)) {
      return value.filter(Boolean).map((item) => String(item));
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) {
        return [];
      }

      if (trimmed.includes(",")) {
        return trimmed
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }

      return [trimmed];
    }

    return [];
  };

  const uploadFilesForField = async (fieldKey, bucket, files = []) => {
    if (!Array.isArray(files) || !files.length) {
      return;
    }

    const currentValue =
      bucket === "customizedData"
        ? subCategoryEditState?.draftCustomizedData?.[fieldKey]
        : subCategoryEditState?.draftFormData?.[fieldKey];

    const existingFiles = normalizeUploadedValues(currentValue);

    try {
      setUploadingFieldKey(fieldKey);

      const uploadedUrls = [];
      const failedFiles = [];

      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("folder", "case-document");

          const res = await postData("/upload", formData);
          const fileUrl =
            res?.data?.data?.url || res?.data?.data?.fileUrl || "";

          if (!fileUrl) {
            throw new Error("Uploaded file URL missing in response");
          }

          uploadedUrls.push(fileUrl);
        } catch (error) {
          failedFiles.push(file?.name || "File");
        }
      }

      const nextFiles = [...existingFiles, ...uploadedUrls];
      onFieldChange(fieldKey, bucket, nextFiles);

      if (uploadedUrls.length) {
        toast.success(`${uploadedUrls.length} file(s) uploaded successfully`);
      }

      if (failedFiles.length) {
        toast.error(`${failedFiles.length} file(s) failed to upload`);
      }
    } finally {
      setUploadingFieldKey("");
    }
  };

  const removeUploadedFile = (fieldKey, bucket, fileUrlToRemove) => {
    const currentValue =
      bucket === "customizedData"
        ? subCategoryEditState?.draftCustomizedData?.[fieldKey]
        : subCategoryEditState?.draftFormData?.[fieldKey];

    const existingFiles = normalizeUploadedValues(currentValue);
    const nextFiles = existingFiles.filter(
      (fileUrl) => fileUrl !== fileUrlToRemove,
    );
    onFieldChange(fieldKey, bucket, nextFiles);
  };

  const renderEditableField = (key, value) => {
    const fieldMeta = getFieldMeta(key);
    const fieldType = String(fieldMeta?.type || "text").toLowerCase();
    const fieldBucket = fieldMeta?.bucket || "formData";
    const fieldLabel = fieldMeta?.label || key;
    const options = Array.isArray(fieldMeta?.options) ? fieldMeta.options : [];
    const fieldError = validationErrors?.[key] || "";

    const currentValue =
      fieldBucket === "customizedData"
        ? subCategoryEditState?.draftCustomizedData?.[key]
        : subCategoryEditState?.draftFormData?.[key];

    if (fieldType === "textarea") {
      return (
        <div className="space-y-1">
          <label className="text-xs text-gray-500">
            {fieldLabel}
            {fieldMeta?.required ? " *" : ""}
          </label>
          <textarea
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 ${fieldError ? "border-red-500" : "border-gray-300"}`}
            placeholder={fieldMeta?.placeholder || "Enter value"}
            value={toStringValue(currentValue)}
            onChange={(event) =>
              onFieldChange(key, fieldBucket, event.target.value)
            }
          />
          {fieldError && <p className="text-xs text-red-500">{fieldError}</p>}
        </div>
      );
    }

    if (fieldType === "select") {
      return (
        <div className="space-y-1">
          <label className="text-xs text-gray-500">
            {fieldLabel}
            {fieldMeta?.required ? " *" : ""}
          </label>
          <select
            className={`w-full rounded-md border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 ${fieldError ? "border-red-500" : "border-gray-300"}`}
            value={toStringValue(currentValue)}
            onChange={(event) =>
              onFieldChange(key, fieldBucket, event.target.value)
            }
          >
            <option value="">Select an option</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldError && <p className="text-xs text-red-500">{fieldError}</p>}
        </div>
      );
    }

    if (fieldType === "radio") {
      return (
        <div className="space-y-2">
          <label className="text-xs text-gray-500">
            {fieldLabel}
            {fieldMeta?.required ? " *" : ""}
          </label>
          <div className="flex flex-wrap gap-3">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="radio"
                  name={`${subCategoryId}-${key}`}
                  value={option.value}
                  checked={toStringValue(currentValue) === String(option.value)}
                  onChange={(event) =>
                    onFieldChange(key, fieldBucket, event.target.value)
                  }
                />
                {option.label}
              </label>
            ))}
          </div>
          {fieldError && <p className="text-xs text-red-500">{fieldError}</p>}
        </div>
      );
    }

    if (fieldType === "checkbox") {
      const checkedValues = normalizeCheckboxValue(currentValue);

      return (
        <div className="space-y-2">
          <label className="text-xs text-gray-500">
            {fieldLabel}
            {fieldMeta?.required ? " *" : ""}
          </label>
          <div className="flex flex-wrap gap-3">
            {options.map((option) => {
              const optionValue = String(option.value);
              const isChecked = checkedValues.includes(optionValue);

              return (
                <label
                  key={optionValue}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(event) => {
                      const nextValues = event.target.checked
                        ? [...checkedValues, optionValue]
                        : checkedValues.filter((item) => item !== optionValue);

                      onFieldChange(key, fieldBucket, nextValues);
                    }}
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
          {fieldError && <p className="text-xs text-red-500">{fieldError}</p>}
        </div>
      );
    }

    if (fieldType === "file") {
      const uploadedFiles = normalizeUploadedValues(currentValue);
      const isUploadingCurrentField = uploadingFieldKey === key;

      return (
        <div className="space-y-2">
          <label className="text-xs text-gray-500">
            {fieldLabel}
            {fieldMeta?.required ? " *" : ""}
          </label>
          <input
            type="file"
            multiple
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-2 file:py-1"
            onChange={async (event) => {
              const selectedFiles = Array.from(event.target.files || []);
              await uploadFilesForField(key, fieldBucket, selectedFiles);
              event.target.value = "";
            }}
            disabled={isUploadingCurrentField}
          />

          {isUploadingCurrentField && (
            <p className="text-xs text-gray-500">Uploading files...</p>
          )}

          {fieldError && <p className="text-xs text-red-500">{fieldError}</p>}

          {!!uploadedFiles.length && (
            <div className="space-y-1">
              {uploadedFiles.map((fileUrl) => (
                <div
                  key={fileUrl}
                  className="flex items-center justify-between gap-2 rounded border border-gray-200 px-2 py-1"
                >
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 break-all hover:underline"
                  >
                    {fileUrl}
                  </a>
                  <button
                    type="button"
                    className="text-xs text-red-600 hover:underline"
                    onClick={() =>
                      removeUploadedFile(key, fieldBucket, fileUrl)
                    }
                    disabled={isUploadingCurrentField}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <label className="text-xs text-gray-500">
          {fieldLabel}
          {fieldMeta?.required ? " *" : ""}
        </label>
        <input
          type={
            fieldType === "number"
              ? "number"
              : fieldType === "date"
                ? "date"
                : "text"
          }
          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 ${fieldError ? "border-red-500" : "border-gray-300"}`}
          placeholder={fieldMeta?.placeholder || "Enter value"}
          value={toStringValue(currentValue)}
          onChange={(event) =>
            onFieldChange(key, fieldBucket, event.target.value)
          }
        />
        {fieldError && <p className="text-xs text-red-500">{fieldError}</p>}
      </div>
    );
  };

  const canAccessVerification = CanAccessVerificationType(
    roleName,
    subCategory?.verificationType,
  );
  const status = getStatusBadgeConfig(subCategory?.status);
  return (
    <details
      key={subCategoryId}
      className={`group bg-white rounded-xl border overflow-hidden `}
    >
      <summary
        className={`cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-1 border-l-4 rounded-lg ${subCategory?.status === "COMPLETED" ? "border-l-green-500" : subCategory?.status === "PENDING" || subCategory?.status === "IN_PROGRESS" ? "border-l-yellow-500" : "border-l-red-500"} hover:bg-gray-100 transition`}
      >
        <div className="items-center gap-2">
          <h4 className="font-semibold text-sm sm:text-base truncate">
            {subCategory?.subCategoryName || "Subcategory"}
          </h4>
          <p className="text-xs text-gray-500 ml-2">
            Status:{" "}
            <span
              className={`capitalize px-2 py-0.5 text-xs rounded-full ${status?.className}`}
            >
              {status?.text}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isEditing &&
            subCategoryState?.status === "loaded" &&
            enableAddAction &&
            typeof onAddAction === "function" && (
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onAddAction();
                }}
                disabled={isPreparing}
              >
                {addActionLabel}
              </button>
            )}

          {!isEditing &&
            subCategoryState?.status === "loaded" &&
            enableSecondaryAction &&
            typeof onSecondaryAction === "function" &&
            Boolean(secondaryActionLabel) &&
            subCategory?.status !== "COMPLETED" &&
            canAccessVerification && (
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onSecondaryAction();
                }}
                disabled={isPreparing}
              >
                {secondaryActionLabel}
              </button>
            )}

          {!isEditing && subCategoryState?.status === "loaded" && (
            <button
              type="button"
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-900 text-white hover:bg-black disabled:opacity-50  cursor-pointer"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (typeof onPrimaryAction === "function") {
                  onPrimaryAction();
                } else {
                  onEditStart();
                }
              }}
              disabled={isPreparing}
            >
              {isPreparing ? "Preparing..." : primaryActionLabel}
            </button>
          )}

          {isEditing && (
            <>
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-900 text-white hover:bg-black disabled:opacity-50"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onSave();
                }}
                disabled={isSaving || hasValidationErrors}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onEditCancel();
                }}
                disabled={isSaving}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </summary>

      <div className="p-4 space-y-3 border-t">
        {subCategoryEditState?.status === "error" && (
          <p className="text-sm text-red-500">
            {subCategoryEditState?.message || "Failed to update subcategory."}
          </p>
        )}

        {subCategoryState?.status === "loading" && (
          <p className="text-sm text-gray-500">Loading details...</p>
        )}

        {subCategoryEditState?.status === "preparing" && (
          <p className="text-sm text-gray-500">Loading editable fields...</p>
        )}

        {subCategoryTemplateState?.status === "error" &&
          !fieldEntries.length && (
            <p className="text-sm text-red-500">
              {subCategoryTemplateState?.message ||
                "Unable to load field template for this subcategory."}
            </p>
          )}

        {subCategoryState?.status === "error" && (
          <p className="text-sm text-red-500">
            {subCategoryState?.message || "Failed to load details."}
          </p>
        )}

        {subCategoryState?.status === "loaded" &&
          !fieldEntries.length &&
          !isEditing && (
            <p className="text-sm text-gray-500">
              No saved data found for this subcategory.
            </p>
          )}

        {subCategoryState?.status === "loaded" &&
          !fieldEntries.length &&
          isEditing && (
            <p className="text-sm text-gray-500">
              No configured fields found for this subcategory.
            </p>
          )}

        {subCategoryState?.status === "loaded" && !!fieldEntries.length && (
          <div className="grid md:grid-cols-2 gap-3">
            {fieldEntries.map(([key, value]) => (
              <div key={key}>
                {isEditing ? (
                  renderEditableField(key, value)
                ) : (
                  <FieldDisplay
                    fieldKey={key}
                    value={value}
                    isVerified={verifiedFields?.[key]}
                    showVerifyButton={
                      enableFieldVerifyAction &&
                      typeof onFieldVerifyAction === "function"
                    }
                    onVerify={() => {
                      const status = String(
                        subCategory?.status || "",
                      ).toUpperCase();
                      if (status !== "COMPLETED") {
                        toast.error("Please verify the subcategory first.");
                        return;
                      }

                      onFieldVerifyAction?.(key);
                    }}
                    hasVerificationStatus={Object.prototype.hasOwnProperty.call(
                      verifiedFields,
                      key,
                    )}
                    canAccessVerification={canAccessVerification}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {subCategoryState?.status === "idle" && (
          <p className="text-sm text-gray-500">
            Open this category to load details.
          </p>
        )}
      </div>
    </details>
  );
};

export default SubcategoryAccordion;
