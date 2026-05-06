import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { postData } from "@/Services/apiServices";
import { toast } from "react-toastify";
import { isHiddenDynamicFieldId } from "./dynamicFormUtils";

const normalizeOptions = (options = []) => {
  return options.map((option) => {
    if (typeof option === "string") {
      return { label: option, value: option };
    }

    return {
      label: option.label || option.name || option.value || "Option",
      value: option.value || option.id || option.name || option.label,
    };
  });
};

const DynamicFormSection = ({
  section,
  register,
  errors,
  setValue,
  getValues,
  clearErrors,
  setLoading,
  defaultOpen = false,
  onSaveSection,
  saveStatus,
  onSectionChange,
  onAddField,
  onEditField,
  onRemoveField,
  lockedAdditionalFieldSubcategoryIds = [],
}) => {
  const [uploadingFieldId, setUploadingFieldId] = useState(null);
  const [showAddFieldForm, setShowAddFieldForm] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldLabel, setNewFieldLabel] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [editFieldLabel, setEditFieldLabel] = useState("");
  const [editFieldType, setEditFieldType] = useState("text");
  const [editFieldRequired, setEditFieldRequired] = useState(false);

  const camelCasePattern = /^[a-z][a-zA-Z0-9]*$/;
  const isAdditionalField = (field) => Boolean(field?.isAdditional);
  const sectionSubcategoryId = String(
    section?.subCategoryId || section?.subcategoryId || "",
  );
  const isAdditionalFieldActionsLocked =
    sectionSubcategoryId &&
    (Array.isArray(lockedAdditionalFieldSubcategoryIds)
      ? lockedAdditionalFieldSubcategoryIds
      : []
    )
      .map((id) => String(id || ""))
      .includes(sectionSubcategoryId);
  const visibleFields = (
    Array.isArray(section?.fields) ? section.fields : []
  ).filter((field) => !isHiddenDynamicFieldId(field?.id));

  const normalizeUploadedValues = (value) => {
    if (Array.isArray(value)) {
      return value.filter(Boolean);
    }

    if (typeof value === "string" && value.trim()) {
      return [value.trim()];
    }

    return [];
  };

  const uploadDynamicFiles = async (fieldName, files = []) => {
    const existingFiles = normalizeUploadedValues(getValues?.(fieldName));

    if (!files.length) {
      return;
    }

    try {
      setUploadingFieldId(fieldName);
      setLoading(true);

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
      setValue(fieldName, nextFiles, {
        shouldValidate: true,
        shouldDirty: true,
      });

      if (nextFiles.length) {
        clearErrors(fieldName);
      }

      if (uploadedUrls.length) {
        toast.success(`${uploadedUrls.length} file(s) uploaded successfully`);
      }

      if (failedFiles.length) {
        toast.error(`${failedFiles.length} file(s) failed to upload`);
      }
    } finally {
      setUploadingFieldId(null);
      setLoading(false);
    }
  };

  const removeUploadedFile = (fieldName, fileUrlToRemove) => {
    const existingFiles = normalizeUploadedValues(getValues?.(fieldName));
    const nextFiles = existingFiles.filter(
      (fileUrl) => fileUrl !== fileUrlToRemove,
    );

    setValue(fieldName, nextFiles, {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (nextFiles.length) {
      clearErrors(fieldName);
    }

    if (typeof onSectionChange === "function") {
      onSectionChange(section);
    }
  };

  const registerField = (fieldName, rules) => {
    const registration = register(fieldName, rules);

    return {
      ...registration,
      onChange: (event) => {
        registration.onChange(event);

        if (typeof onSectionChange === "function") {
          onSectionChange(section);
        }
      },
    };
  };

  const handleAddField = () => {
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

    if (typeof onAddField !== "function") {
      return;
    }

    if (isAdditionalFieldActionsLocked) {
      toast.error("Additional fields are disabled for General Details.");
      return;
    }

    const result = onAddField(section, {
      id: trimmedFieldName,
      label: trimmedFieldLabel,
      type: newFieldType,
      required: newFieldRequired,
      placeholder: "",
      options: [],
      isCustomized: true,
      bucket: "customizedData",
      isAdditional: true,
    });

    if (!result?.success) {
      toast.error(result?.message || "Failed to add field.");
      return;
    }

    toast.success("Additional field added.");
    setNewFieldName("");
    setNewFieldLabel("");
    setNewFieldType("text");
    setNewFieldRequired(false);
    setShowAddFieldForm(false);
  };

  const startEditField = (field) => {
    setEditingFieldId(field.id);
    setEditFieldLabel(field.label || field.id);
    setEditFieldType(field.type || "text");
    setEditFieldRequired(Boolean(field.required));
  };

  const cancelEditField = () => {
    setEditingFieldId(null);
    setEditFieldLabel("");
    setEditFieldType("text");
    setEditFieldRequired(false);
  };

  const handleEditField = (field) => {
    if (typeof onEditField !== "function") {
      return;
    }

    if (isAdditionalFieldActionsLocked) {
      toast.error("Additional fields are disabled for General Details.");
      return;
    }

    const result = onEditField(section, field.id, {
      label: editFieldLabel.trim() || field.label || field.id,
      type: editFieldType,
      required: editFieldRequired,
    });

    if (!result?.success) {
      toast.error(result?.message || "Failed to update field.");
      return;
    }

    toast.success("Field updated.");
    cancelEditField();
  };

  const handleRemoveField = (field) => {
    if (typeof onRemoveField !== "function") {
      return;
    }

    if (isAdditionalFieldActionsLocked) {
      toast.error("Additional fields are disabled for General Details.");
      return;
    }

    const result = onRemoveField(section, field.id);

    if (!result?.success) {
      toast.error(result?.message || "Failed to remove field.");
      return;
    }

    toast.success("Field removed.");

    if (editingFieldId === field.id) {
      cancelEditField();
    }
  };

  const buildFieldRules = (field) => {
    const rules = {};

    if (field?.required) {
      rules.required = `${field.label || "Field"} is required`;
    }

    const validation =
      field?.validation && typeof field.validation === "object"
        ? field.validation
        : null;

    if (!validation) {
      return rules;
    }

    const validationType = String(validation?.type || "").toLowerCase();
    const validationMessage = validation?.message || "Invalid value";

    if (validationType === "regex" && validation?.pattern) {
      try {
        rules.pattern = {
          value: new RegExp(validation.pattern),
          message: validationMessage,
        };
      } catch (error) {
        // Ignore invalid regex from API and keep field usable.
      }
    }

    if (typeof validation?.minLength === "number") {
      rules.minLength = {
        value: validation.minLength,
        message:
          validationMessage ||
          `${field.label || "Field"} must be at least ${validation.minLength} characters`,
      };
    }

    if (typeof validation?.maxLength === "number") {
      rules.maxLength = {
        value: validation.maxLength,
        message:
          validationMessage ||
          `${field.label || "Field"} must be at most ${validation.maxLength} characters`,
      };
    }

    return rules;
  };

  const renderField = (field) => {
    const fieldName = `dynamicFields.${field.id}`;
    const options = normalizeOptions(field.options);
    const rules = buildFieldRules(field);

    if (field.type === "textarea") {
      return (
        <textarea
          id={field.id}
          placeholder={field.placeholder || "Enter value"}
          className="w-full border rounded-md px-3 py-2 text-sm"
          {...registerField(fieldName, rules)}
        />
      );
    }

    if (field.type === "date") {
      return (
        <input
          id={field.id}
          type="date"
          className="w-full border rounded-md px-3 py-2 text-sm"
          {...registerField(fieldName, rules)}
        />
      );
    }

    if (field.type === "select") {
      return (
        <select
          id={field.id}
          className="w-full border rounded-md px-3 py-2 text-sm bg-white"
          {...registerField(fieldName, rules)}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "radio") {
      return (
        <div className="flex flex-wrap gap-3">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="radio"
                value={option.value}
                {...registerField(fieldName, rules)}
              />
              {option.label}
            </label>
          ))}
        </div>
      );
    }

    if (field.type === "checkbox") {
      return (
        <div className="flex flex-wrap gap-3">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                value={option.value}
                {...registerField(fieldName, rules)}
              />
              {option.label}
            </label>
          ))}
        </div>
      );
    }

    if (field.type === "file") {
      const uploadedFiles = normalizeUploadedValues(getValues?.(fieldName));

      return (
        <div className="space-y-2">
          <input
            id={field.id}
            type="file"
            multiple
            className="w-full border rounded-md px-3 py-2 text-sm"
            onChange={(event) => {
              const files = Array.from(event.target.files || []);
              if (!files.length) {
                return;
              }

              uploadDynamicFiles(fieldName, files);
              event.target.value = "";

              if (typeof onSectionChange === "function") {
                onSectionChange(section);
              }
            }}
          />
          <input type="hidden" {...registerField(fieldName, rules)} />

          {!!uploadedFiles.length && (
            <div className="space-y-1">
              {uploadedFiles.map((fileUrl, index) => (
                <div
                  key={`${fileUrl}-${index}`}
                  className="flex items-center justify-between gap-2 rounded border px-2 py-1"
                >
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline truncate"
                  >
                    {fileUrl}
                  </a>
                  <button
                    type="button"
                    onClick={() => removeUploadedFile(fieldName, fileUrl)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {uploadingFieldId === fieldName && (
            <p className="text-xs text-gray-500">Uploading file...</p>
          )}
        </div>
      );
    }

    return (
      <input
        id={field.id}
        type={field.type || "text"}
        placeholder={field.placeholder || "Enter value"}
        className="w-full border rounded-md px-3 py-2 text-sm"
        {...registerField(fieldName, rules)}
      />
    );
  };

  return (
    <details
      open={defaultOpen}
      className="group bg-white rounded-xl border overflow-hidden"
    >
      <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-3 bg-gray-50 hover:bg-gray-100 transition">
        <div className="min-w-0">
          <h3 className="font-semibold text-sm sm:text-base truncate">
            {section.title}
          </h3>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500 transition-transform duration-200 group-open:rotate-180" />
      </summary>

      <div className="p-4 space-y-3 border-t">
        {visibleFields.map((field) => {
          const isEditing = editingFieldId === field.id;

          return (
            <div
              key={field.id}
              className={field.type === "textarea" ? "sm:col-span-2" : ""}
            >
              <div className="flex items-start justify-between gap-3">
                <label
                  htmlFor={field.id}
                  className="text-sm font-medium text-gray-700"
                >
                  {field.label || field.id}
                  {field.required ? " *" : ""}
                </label>

                {isAdditionalField(field) &&
                  !isEditing &&
                  !isAdditionalFieldActionsLocked && (
                    <div className="flex items-center gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => startEditField(field)}
                        className="text-primary hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveField(field)}
                        className="text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
              </div>

              {isEditing ? (
                <div className="mt-2 space-y-2 rounded-md border bg-gray-50 p-3">
                  <div>
                    <label className="text-xs text-gray-600">Field Label</label>
                    <input
                      type="text"
                      value={editFieldLabel}
                      onChange={(event) =>
                        setEditFieldLabel(event.target.value)
                      }
                      className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-600">
                        Field Type
                      </label>
                      <select
                        value={editFieldType}
                        onChange={(event) =>
                          setEditFieldType(event.target.value)
                        }
                        className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-white"
                      >
                        <option value="text">Text</option>
                        <option value="date">Date</option>
                        <option value="file">File</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-2 text-sm text-gray-700 pt-5">
                      <input
                        type="checkbox"
                        checked={editFieldRequired}
                        onChange={(event) =>
                          setEditFieldRequired(event.target.checked)
                        }
                      />
                      Required
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditField(field)}
                      className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-white"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditField}
                      className="rounded-md border px-3 py-2 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mt-1">{renderField(field)}</div>
                  {errors?.dynamicFields?.[field.id] && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.dynamicFields[field.id].message}
                    </p>
                  )}
                </>
              )}
            </div>
          );
        })}

        {!isAdditionalFieldActionsLocked && (
          <div className="rounded-md border border-dashed border-gray-300 p-3 space-y-3">
            {!showAddFieldForm && (
              <button
                type="button"
                onClick={() => setShowAddFieldForm(true)}
                className="text-sm font-medium text-primary hover:underline"
              >
                + Add Additional Field
              </button>
            )}

            {showAddFieldForm && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-600">
                      Field Name (camelCase)
                    </label>
                    <input
                      type="text"
                      value={newFieldName}
                      onChange={(event) => setNewFieldName(event.target.value)}
                      placeholder="emergencyContact"
                      className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">Field Label</label>
                    <input
                      type="text"
                      value={newFieldLabel}
                      onChange={(event) => setNewFieldLabel(event.target.value)}
                      placeholder="Emergency Contact"
                      className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-600">Field Type</label>
                    <select
                      value={newFieldType}
                      onChange={(event) => setNewFieldType(event.target.value)}
                      className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-white"
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
                    onClick={handleAddField}
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
        )}

        <div className="flex items-center justify-between gap-3 pt-2 border-t">
          <p className="text-xs text-gray-500">
            {saveStatus?.status === "saving"
              ? "Saving section..."
              : saveStatus?.status === "saved"
                ? "Section saved"
                : saveStatus?.status === "error"
                  ? "Last save failed"
                  : "Save this subcategory anytime to persist its current data."}
          </p>

          {typeof onSaveSection === "function" && (
            <button
              type="button"
              onClick={() => onSaveSection(section)}
              disabled={saveStatus?.status === "saving"}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {saveStatus?.status === "saving"
                ? "Saving..."
                : saveStatus?.status === "saved"
                  ? "Saved"
                  : "Save"}
            </button>
          )}
        </div>
      </div>
    </details>
  );
};

export default DynamicFormSection;
