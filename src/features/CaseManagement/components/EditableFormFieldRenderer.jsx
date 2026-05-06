import React, { useState } from "react";
import { postData } from "@/Services/apiServices";
import { toast } from "react-toastify";

const EditableFormFieldRenderer = ({
  fieldKey,
  fieldMeta,
  currentValue,
  fieldError,
  subCategoryId,
  onFieldChange,
}) => {
  const [uploadingFieldKey, setUploadingFieldKey] = useState("");

  const fieldType = String(fieldMeta?.type || "text").toLowerCase();
  const fieldBucket = fieldMeta?.bucket || "formData";
  const fieldLabel = fieldMeta?.label || fieldKey;
  const options = Array.isArray(fieldMeta?.options) ? fieldMeta.options : [];

  const toStringValue = (value) => {
    if (value === undefined || value === null) return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.join(", ");
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

      if (!trimmed) return [];

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

  const uploadFilesForField = async (files = []) => {
    if (!Array.isArray(files) || !files.length) return;

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
            res?.data?.data?.url ||
            res?.data?.data?.fileUrl ||
            "";

          if (!fileUrl) {
            throw new Error("Uploaded file URL missing");
          }

          uploadedUrls.push(fileUrl);
        } catch (error) {
          failedFiles.push(file?.name || "File");
        }
      }

      const nextFiles = [...existingFiles, ...uploadedUrls];

      onFieldChange(fieldKey, fieldBucket, nextFiles);

      if (uploadedUrls.length) {
        toast.success(`${uploadedUrls.length} file uploaded`);
      }

      if (failedFiles.length) {
        toast.error(`${failedFiles.length} file failed`);
      }
    } finally {
      setUploadingFieldKey("");
    }
  };

  if (fieldType === "textarea") {
    return (
      <div className="space-y-1">
        <label className="text-xs text-gray-500">{fieldLabel}</label>

        <textarea
          value={toStringValue(currentValue)}
          onChange={(e) =>
            onFieldChange(fieldKey, fieldBucket, e.target.value)
          }
          className="w-full rounded-md border px-3 py-2 text-sm"
        />

        {fieldError && (
          <p className="text-xs text-red-500">{fieldError}</p>
        )}
      </div>
    );
  }

  if (fieldType === "select") {
    return (
      <div className="space-y-1">
        <label className="text-xs text-gray-500">{fieldLabel}</label>

        <select
          value={toStringValue(currentValue)}
          onChange={(e) =>
            onFieldChange(fieldKey, fieldBucket, e.target.value)
          }
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          <option value="">Select</option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {fieldError && (
          <p className="text-xs text-red-500">{fieldError}</p>
        )}
      </div>
    );
  }

  if (fieldType === "file") {
    const uploadedFiles = normalizeUploadedValues(currentValue);
    const isUploadingCurrentField = uploadingFieldKey === fieldKey;

    return (
      <div className="space-y-2">
        <label className="text-xs text-gray-500">{fieldLabel}</label>

        <input
          type="file"
          multiple
          disabled={isUploadingCurrentField}
          onChange={async (e) => {
            const selectedFiles = Array.from(e.target.files || []);
            await uploadFilesForField(selectedFiles);
            e.target.value = "";
          }}
        />

        {uploadedFiles.map((fileUrl) => (
          <a
            key={fileUrl}
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="block text-xs text-blue-600"
          >
            {fileUrl}
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-500">{fieldLabel}</label>

      <input
        type={fieldType === "date" ? "date" : "text"}
        value={toStringValue(currentValue)}
        onChange={(e) =>
          onFieldChange(fieldKey, fieldBucket, e.target.value)
        }
        className="w-full rounded-md border px-3 py-2 text-sm"
      />

      {fieldError && (
        <p className="text-xs text-red-500">{fieldError}</p>
      )}
    </div>
  );
};

export default EditableFormFieldRenderer;