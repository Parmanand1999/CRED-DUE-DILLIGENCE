import { useEffect, useMemo, useRef, useState } from "react";
import CommonModal from "@/components/common/CommonModal";
import CustomButton from "@/components/common/Buttons/CustomButton";
import { generateDynamicForm } from "@/Services/CreateNewCaseServices";
import {
  extractSubcategoryFieldTemplates,
  getDynamicFieldValidationMessage,
} from "./reviewAndConfirmUtils";
import { toast } from "react-toastify";
import { postData } from "@/Services/apiServices";

const AddSubcategoryModal = ({
  isOpen,
  onClose,
  categoryName,
  options = [],
  emptyReason = "",
  loadingOptions = false,
  saveLoading = false,
  onSubmit,
}) => {
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateFields, setTemplateFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [customizedData, setCustomizedData] = useState({});
  const [additionalFields, setAdditionalFields] = useState([]);
  const [showAddFieldForm, setShowAddFieldForm] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [uploadingFieldKey, setUploadingFieldKey] = useState("");
  const activeTemplateRequestRef = useRef(0);
  const camelCasePattern = /^[a-z][a-zA-Z0-9]*$/;

  useEffect(() => {
    if (!isOpen) {
      setSelectedSubcategoryId("");
      setTemplateFields([]);
      setFormData({});
      setCustomizedData({});
      setAdditionalFields([]);
      setShowAddFieldForm(false);
      setNewFieldName("");
      setNewFieldLabel("");
      setNewFieldType("text");
      setNewFieldRequired(false);
      setUploadingFieldKey("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedSubcategoryId) {
      loadTemplateForSelectedSubcategory();
    } else {
      setTemplateFields([]);
      setFormData({});
      setCustomizedData({});
      setAdditionalFields([]);
      setShowAddFieldForm(false);
    }
  }, [selectedSubcategoryId]);

  const createEmptyFieldValue = (fieldType) => {
    const normalizedType = String(fieldType || "text").toLowerCase();

    if (normalizedType === "file" || normalizedType === "checkbox") {
      return [];
    }

    return "";
  };

  const getAllFieldIds = () => {
    return new Set(
      [...templateFields, ...additionalFields]
        .map((field) => String(field?.id || ""))
        .filter(Boolean),
    );
  };

  const loadTemplateForSelectedSubcategory = async () => {
    const requestId = activeTemplateRequestRef.current + 1;
    activeTemplateRequestRef.current = requestId;

    try {
      setTemplateLoading(true);
      const normalizedSubcategoryId = String(selectedSubcategoryId);
      const response = await generateDynamicForm([normalizedSubcategoryId]);
      const fields = extractSubcategoryFieldTemplates(
        response,
        normalizedSubcategoryId,
      );

      if (activeTemplateRequestRef.current !== requestId) {
        return;
      }

      setTemplateFields(fields);

      // Initialize formData and customizedData with empty values based on field type
      const newFormData = {};
      const newCustomizedData = {};

      fields.forEach((field) => {
        const fieldValue = createEmptyFieldValue(field.type);
        if (field.bucket === "customizedData") {
          newCustomizedData[field.id] = fieldValue;
        } else {
          newFormData[field.id] = fieldValue;
        }
      });

      setFormData(newFormData);
      setCustomizedData(newCustomizedData);
    } catch (error) {
      if (activeTemplateRequestRef.current !== requestId) {
        return;
      }

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load form template",
      );
      setTemplateFields([]);
      setFormData({});
      setCustomizedData({});
    } finally {
      if (activeTemplateRequestRef.current === requestId) {
        setTemplateLoading(false);
      }
    }
  };

  const handleFieldChange = (fieldId, bucket, value) => {
    if (bucket === "customizedData") {
      setCustomizedData((prev) => ({
        ...prev,
        [fieldId]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [fieldId]: value,
      }));
    }
  };

  const handleAddAdditionalField = () => {
    const trimmedFieldName = newFieldName.trim();
    const trimmedFieldLabel = newFieldLabel.trim() || trimmedFieldName;

    if (!trimmedFieldName) {
      toast.error("Field name is required.");
      return;
    }

    if (!camelCasePattern.test(trimmedFieldName)) {
      toast.error("Field name must be camelCase (example: emergencyContact).");
      return;
    }

    if (getAllFieldIds().has(trimmedFieldName)) {
      toast.error("Field name already exists. Please use a unique name.");
      return;
    }

    const newFieldDefinition = {
      id: trimmedFieldName,
      label: trimmedFieldLabel,
      type: newFieldType,
      required: newFieldRequired,
      placeholder: "",
      options: [],
      isCustomized: true,
      bucket: "customizedData",
      isAdditional: true,
    };

    setAdditionalFields((prev) => [...prev, newFieldDefinition]);
    setCustomizedData((prev) => ({
      ...prev,
      [trimmedFieldName]: createEmptyFieldValue(newFieldType),
    }));
    setShowAddFieldForm(false);
    setNewFieldName("");
    setNewFieldLabel("");
    setNewFieldType("text");
    setNewFieldRequired(false);
    toast.success("Additional field added.");
  };

  const handleRemoveAdditionalField = (fieldId) => {
    const normalizedFieldId = String(fieldId || "");
    if (!normalizedFieldId) {
      return;
    }

    setAdditionalFields((prev) =>
      prev.filter((field) => String(field?.id || "") !== normalizedFieldId),
    );
    setCustomizedData((prev) => {
      const nextData = { ...prev };
      delete nextData[normalizedFieldId];
      return nextData;
    });
    toast.success("Additional field removed.");
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

  const validationErrors = useMemo(() => {
    const nextErrors = {};

    [...templateFields, ...additionalFields].forEach((field) => {
      const fieldId = String(field?.id || "");
      if (!fieldId) {
        return;
      }

      const fieldBucket = field?.bucket || "formData";
      const currentValue =
        fieldBucket === "customizedData"
          ? customizedData?.[fieldId]
          : formData?.[fieldId];

      const validationMessage = getDynamicFieldValidationMessage(
        field,
        currentValue,
      );

      if (validationMessage) {
        nextErrors[fieldId] = validationMessage;
      }
    });

    return nextErrors;
  }, [templateFields, additionalFields, customizedData, formData]);

  const hasValidationErrors = Object.keys(validationErrors).length > 0;

  const uploadFilesForField = async (fieldKey, bucket, files = []) => {
    if (!Array.isArray(files) || !files.length) {
      return;
    }

    const currentValue =
      bucket === "customizedData"
        ? customizedData?.[fieldKey]
        : formData?.[fieldKey];

    const existingFiles = normalizeUploadedValues(currentValue);

    try {
      setUploadingFieldKey(fieldKey);

      const uploadedUrls = [];
      const failedFiles = [];

      for (const file of files) {
        try {
          const formDataPayload = new FormData();
          formDataPayload.append("file", file);
          formDataPayload.append("folder", "case-document");

          const res = await postData("/upload", formDataPayload);
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
      handleFieldChange(fieldKey, bucket, nextFiles);

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
        ? customizedData?.[fieldKey]
        : formData?.[fieldKey];

    const existingFiles = normalizeUploadedValues(currentValue);
    const nextFiles = existingFiles.filter(
      (fileUrl) => fileUrl !== fileUrlToRemove,
    );
    handleFieldChange(fieldKey, bucket, nextFiles);
  };

  const handleSubmitSubcategory = () => {
    if (!selectedSubcategoryId) {
      toast.error("Please select a subcategory.");
      return;
    }

    if (hasValidationErrors) {
      toast.error("Please complete all required fields before adding.");
      return;
    }

    onSubmit(selectedSubcategoryId, formData, customizedData);
  };

  const renderEditableField = (field) => {
    const fieldId = String(field?.id || "");
    const fieldType = String(field?.type || "text").toLowerCase();
    const fieldBucket = field?.bucket || "formData";
    const fieldLabel = field?.label || fieldId;
    const options = Array.isArray(field?.options) ? field.options : [];
    const fieldError = validationErrors?.[fieldId] || "";

    const currentValue =
      fieldBucket === "customizedData"
        ? customizedData?.[fieldId]
        : formData?.[fieldId];

    if (fieldType === "textarea") {
      return (
        <div key={fieldId} className="space-y-1">
          <label className="text-xs text-gray-500">
            {fieldLabel}
            {field?.required ? " *" : ""}
          </label>
          <textarea
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 ${fieldError ? "border-red-500" : "border-gray-300"}`}
            placeholder={field?.placeholder || "Enter value"}
            value={toStringValue(currentValue)}
            onChange={(event) =>
              handleFieldChange(fieldId, fieldBucket, event.target.value)
            }
          />
          {fieldError && <p className="text-xs text-red-500">{fieldError}</p>}
        </div>
      );
    }

    if (fieldType === "select") {
      return (
        <div key={fieldId} className="space-y-1">
          <label className="text-xs text-gray-500">
            {fieldLabel}
            {field?.required ? " *" : ""}
          </label>
          <select
            className={`w-full rounded-md border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 ${fieldError ? "border-red-500" : "border-gray-300"}`}
            value={toStringValue(currentValue)}
            onChange={(event) =>
              handleFieldChange(fieldId, fieldBucket, event.target.value)
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
        <div key={fieldId} className="space-y-2">
          <label className="text-xs text-gray-500">
            {fieldLabel}
            {field?.required ? " *" : ""}
          </label>
          <div className="flex flex-wrap gap-3">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="radio"
                  name={`modal-${fieldId}`}
                  value={option.value}
                  checked={toStringValue(currentValue) === String(option.value)}
                  onChange={(event) =>
                    handleFieldChange(fieldId, fieldBucket, event.target.value)
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
        <div key={fieldId} className="space-y-2">
          <label className="text-xs text-gray-500">
            {fieldLabel}
            {field?.required ? " *" : ""}
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

                      handleFieldChange(fieldId, fieldBucket, nextValues);
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
      const isUploadingCurrentField = uploadingFieldKey === fieldId;

      return (
        <div key={fieldId} className="space-y-2">
          <label className="text-xs text-gray-500">
            {fieldLabel}
            {field?.required ? " *" : ""}
          </label>
          <input
            type="file"
            multiple
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-gray-100 file:px-2 file:py-1"
            onChange={async (event) => {
              const selectedFiles = Array.from(event.target.files || []);
              await uploadFilesForField(fieldId, fieldBucket, selectedFiles);
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
                      removeUploadedFile(fieldId, fieldBucket, fileUrl)
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
      <div key={fieldId} className="space-y-1">
        <label className="text-xs text-gray-500">
          {fieldLabel}
          {field?.required ? " *" : ""}
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
          placeholder={field?.placeholder || "Enter value"}
          value={toStringValue(currentValue)}
          onChange={(event) =>
            handleFieldChange(fieldId, fieldBucket, event.target.value)
          }
        />
        {fieldError && <p className="text-xs text-red-500">{fieldError}</p>}
      </div>
    );
  };

  const hasOptions = useMemo(() => {
    return Array.isArray(options) && options.length > 0;
  }, [options]);

  const selectedSubcategoryName = useMemo(() => {
    return (
      options.find((opt) => opt.subCategoryId === selectedSubcategoryId)
        ?.subCategoryName || "Subcategory"
    );
  }, [options, selectedSubcategoryId]);

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Subcategory${categoryName ? ` - ${categoryName}` : ""}`}
    >
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {loadingOptions && (
          <p className="text-sm text-gray-500">Loading subcategories...</p>
        )}

        {!loadingOptions && !hasOptions && (
          <p className="text-sm text-gray-500">
            {emptyReason ||
              "No additional subcategories are available for this category."}
          </p>
        )}

        {!loadingOptions && hasOptions && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Select Subcategory
              </label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                value={selectedSubcategoryId}
                onChange={(event) =>
                  setSelectedSubcategoryId(event.target.value)
                }
              >
                <option value="">Choose subcategory</option>
                {options.map((option) => (
                  <option
                    key={option.subCategoryId}
                    value={option.subCategoryId}
                  >
                    {option.subCategoryName}
                  </option>
                ))}
              </select>
            </div>

            {selectedSubcategoryId && (
              <div className="space-y-3 border-t pt-4">
                <div className="relative min-h-60 rounded-md">
                  {templateLoading && (
                    <div className="absolute inset-0 z-10 flex items-start justify-center rounded-md bg-white/70 pt-6 backdrop-blur-[1px]">
                      <p className="text-sm text-gray-500">
                        Loading form fields...
                      </p>
                    </div>
                  )}

                  <div
                    className={
                      templateLoading
                        ? "pointer-events-none opacity-60"
                        : "opacity-100"
                    }
                  >
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-700">
                        {selectedSubcategoryName} Details
                      </h4>

                      <div className="space-y-4 rounded-md border border-gray-200 bg-gray-50 p-3">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Dynamic Fields
                          </p>
                          {templateFields.length > 0 ? (
                            <div className="mt-3 space-y-3">
                              {templateFields.map((field) =>
                                renderEditableField(field),
                              )}
                            </div>
                          ) : (
                            <p className="mt-2 text-sm text-gray-500">
                              No dynamic fields available for this subcategory.
                            </p>
                          )}
                        </div>

                        <div className="rounded-md border border-dashed border-gray-300 bg-white p-3 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                              Additional Fields
                            </p>
                            {!showAddFieldForm && (
                              <button
                                type="button"
                                className="text-xs font-medium text-primary hover:underline"
                                onClick={() => setShowAddFieldForm(true)}
                              >
                                + Add Additional Field
                              </button>
                            )}
                          </div>

                          {additionalFields.length > 0 && (
                            <div className="space-y-3">
                              {additionalFields.map((field) => (
                                <div
                                  key={field.id}
                                  className="rounded-md border border-gray-200 bg-gray-50 p-3"
                                >
                                  <div className="mb-2 flex items-start justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-medium text-gray-700">
                                        {field.label || field.id}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Custom field: {field.id}
                                      </p>
                                    </div>
                                    <button
                                      type="button"
                                      className="text-xs text-red-600 hover:underline"
                                      onClick={() =>
                                        handleRemoveAdditionalField(field.id)
                                      }
                                    >
                                      Remove
                                    </button>
                                  </div>
                                  {renderEditableField(field)}
                                </div>
                              ))}
                            </div>
                          )}

                          {showAddFieldForm && (
                            <div className="space-y-3 rounded-md bg-gray-50 p-3">
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <div>
                                  <label className="text-xs text-gray-600">
                                    Field Name (camelCase)
                                  </label>
                                  <input
                                    type="text"
                                    value={newFieldName}
                                    onChange={(event) =>
                                      setNewFieldName(event.target.value)
                                    }
                                    placeholder="emergencyContact"
                                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                                  />
                                </div>

                                <div>
                                  <label className="text-xs text-gray-600">
                                    Field Label
                                  </label>
                                  <input
                                    type="text"
                                    value={newFieldLabel}
                                    onChange={(event) =>
                                      setNewFieldLabel(event.target.value)
                                    }
                                    placeholder="Emergency Contact"
                                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                                  />
                                </div>

                                <div>
                                  <label className="text-xs text-gray-600">
                                    Field Type
                                  </label>
                                  <select
                                    value={newFieldType}
                                    onChange={(event) =>
                                      setNewFieldType(event.target.value)
                                    }
                                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm bg-white"
                                  >
                                    <option value="text">Text</option>
                                    <option value="date">Date</option>
                                    <option value="file">File</option>
                                  </select>
                                </div>
                              </div>

                              <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                  type="checkbox"
                                  checked={newFieldRequired}
                                  onChange={(event) =>
                                    setNewFieldRequired(event.target.checked)
                                  }
                                />
                                Mark as required
                              </label>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={handleAddAdditionalField}
                                  className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-white"
                                >
                                  Add Field
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowAddFieldForm(false);
                                    setNewFieldName("");
                                    setNewFieldLabel("");
                                    setNewFieldType("text");
                                    setNewFieldRequired(false);
                                  }}
                                  className="rounded-md border px-3 py-2 text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
          <CustomButton
            className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            onClick={onClose}
            disabled={saveLoading}
          >
            Cancel
          </CustomButton>
          <CustomButton
            className="bg-black text-white hover:bg-black/90"
            loading={saveLoading || templateLoading}
            disabled={
              !selectedSubcategoryId ||
              !hasOptions ||
              loadingOptions ||
              templateLoading ||
              hasValidationErrors
            }
            onClick={handleSubmitSubcategory}
          >
            Add Subcategory
          </CustomButton>
        </div>
      </div>
    </CommonModal>
  );
};

export default AddSubcategoryModal;
