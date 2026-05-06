import { useEffect, useState } from "react";
import CommonModal from "@/components/common/CommonModal";
import CustomButton from "@/components/common/Buttons/CustomButton";

const AddAdditionalFieldModal = ({
  isOpen,
  onClose,
  subcategoryName = "",
  saveLoading = false,
  onSubmit,
}) => {
  const [fieldName, setFieldName] = useState("");
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [required, setRequired] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFieldName("");
      setFieldLabel("");
      setFieldType("text");
      setRequired(false);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    onSubmit?.({
      fieldName,
      fieldLabel,
      fieldType,
      required,
    });
  };

  return (
    <CommonModal isOpen={isOpen} onClose={onClose} title="Add Additional Field">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">
            Add a custom field for {subcategoryName || "this subcategory"}.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-gray-600">
              Field Name (camelCase)
            </label>
            <input
              type="text"
              value={fieldName}
              onChange={(event) => setFieldName(event.target.value)}
              placeholder="emergencyContact"
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600">Field Label</label>
            <input
              type="text"
              value={fieldLabel}
              onChange={(event) => setFieldLabel(event.target.value)}
              placeholder="Emergency Contact"
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-gray-600">Field Type</label>
            <select
              value={fieldType}
              onChange={(event) => setFieldType(event.target.value)}
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
            checked={required}
            onChange={(event) => setRequired(event.target.checked)}
          />
          Mark as required
        </label>

        <div className="flex items-center justify-end gap-2 border-t pt-4">
          <CustomButton
            className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            onClick={onClose}
            disabled={saveLoading}
          >
            Cancel
          </CustomButton>
          <CustomButton
            className="bg-black text-white hover:bg-black/90"
            loading={saveLoading}
            onClick={handleSubmit}
          >
            Add Field
          </CustomButton>
        </div>
      </div>
    </CommonModal>
  );
};

export default AddAdditionalFieldModal;
