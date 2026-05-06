import React, { useMemo, useState } from "react";
import useAuthStore from "@/store/useAuthStore";
import { getStatusBadgeConfig } from "@/utils/statusUtils";
import { getDynamicFieldValidationMessage } from "../../../components/reviewAndConfirmUtils";

import VerificationFieldDisplay from "./VerificationFieldDisplay";
import { getCaseSubcategoryData, saveCaseSubcategoryData } from "@/Services/CasesManagmentServices";
import AddAdditionalFieldModal from "@/features/Client/Review&Confirm/Components/AddAdditionalFieldModal";
import { toast } from "react-toastify";
import { finalizeAgentVerifyCaseService, generateDynamicForm, getPrevverifyData } from "@/Services/AgentServices";
import EditableFormFieldRenderer from "@/features/CaseManagement/components/EditableFormFieldRenderer";
import { CanAccessVerificationType } from "@/features/CaseManagement/components/CanAccessVerificationType";
import FinalizeVerificationModal from "@/features/CaseManagement/components/FinalizeVerificationModal";

const SubcategoryAccordion = ({
    subCategory,
    fetchCaseDetails,
}) => {
    const roleName = useAuthStore((state) => state?.user?.roleName);

    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    // const [isSaving, setIsSaving] = useState(false);
    const [isVerificationLoaded, setIsVerificationLoaded] = useState(false);
    const [verificationModalOpen, setVerificationModalOpen] = useState(false);
    // const [addFieldModalOpen, setAddFieldModalOpen] = useState(false);
    // const [addFieldSaving, setAddFieldSaving] = useState(false);

    // verification API response
    const [viewData, setViewData] = useState({
        formData: {},
        customizedData: {},
        verifiedFields: {},
    });

    // edit API response
    const [editTemplateData, setEditTemplateData] = useState({
        fields: [],
    });

    const [draftFormData, setDraftFormData] = useState({});
    const [draftCustomizedData, setDraftCustomizedData] = useState({});

    const caseId = String(subCategory?.caseId || "");
    const subcategoryId = String(subCategory?.subCategoryId || "");

    const canAccessVerification = CanAccessVerificationType(
        roleName,
        subCategory?.verificationType
    );
    console.log(canAccessVerification, "canAccessVerification in subcategory accordion");

    const status = getStatusBadgeConfig(subCategory?.status);

    const templateFields = Array.isArray(editTemplateData?.fields)
        ? editTemplateData.fields
        : [];

    const templateFieldMap = new Map(
        templateFields.map((field) => [String(field?.id || ""), field])
    );

    const getFieldMeta = (key) => {
        return (
            templateFieldMap.get(String(key || "")) || {
                id: key,
                label: key,
                type: "text",
                bucket: "formData",
                options: [],
                required: false,
                placeholder: "",
            }
        );
    };

    // API 1 -> accordion open
    const fetchVerificationData = async ({ caseId, subcategoryId }) => {
        console.log("Start1");
        console.log({ caseId, subcategoryId }, "start { caseId, subcategoryId }");

        if (!caseId || !subcategoryId) return;
        console.log("Start2");
        try {
            setIsLoading(true);

            const response = await getCaseSubcategoryData(
                { caseId, subcategoryId: subcategoryId }
            );

            const payload = response?.data?.data || {};

            setViewData({
                formData: payload?.formData || {},
                customizedData: payload?.customizedData || {},
                verifiedFields: payload?.verifiedFields || {},
            });

            setIsVerificationLoaded(true);
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message || "Somthing went wrong")
        }

        finally {
            setIsLoading(false);
        }
    };

    // API 2 -> edit click
    // const handleEditStart = async () => {
    //     try {
    //         setIsLoading(true);
    //         setIsEditing(true);

    //         const response = await generateDynamicForm([subCategoryId]);

    //         const payload = response?.data?.data || {};

    //         setEditTemplateData({
    //             fields: payload?.fields || [],
    //         });

    //         setDraftFormData(viewData?.formData || {});
    //         setDraftCustomizedData(viewData?.customizedData || {});
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    const handleFieldChange = (fieldKey, bucket, value) => {
        if (bucket === "customizedData") {
            setDraftCustomizedData((prev) => ({
                ...prev,
                [fieldKey]: value,
            }));
        } else {
            setDraftFormData((prev) => ({
                ...prev,
                [fieldKey]: value,
            }));
        }
    };

    // const handleCancel = () => {
    //     setIsEditing(false);
    //     setDraftFormData({});
    //     setDraftCustomizedData({});
    // };

    // const handleSave = async () => {
    //     try {
    //         setIsSaving(true);

    //         const response = await saveCaseSubcategoryData({
    //             caseId,
    //             subcategoryId: subCategoryId,
    //             formData: draftFormData,
    //             customizedData: draftCustomizedData,
    //         });

    //         if (response?.status === 200) {
    //             setViewData((prev) => ({
    //                 ...prev,
    //                 formData: draftFormData,
    //                 customizedData: draftCustomizedData,
    //             }));
    //             setIsEditing(false);
    //             toast.success("Subcategory updated successfully.");
    //         }
    //     } catch (error) {
    //         toast.error(error?.response?.data?.message || "Failed to save subcategory.");
    //     } finally {
    //         setIsSaving(false);
    //     }
    // };

    // const handleAddAdditionalField = async ({ fieldName, fieldLabel, fieldType, required }) => {
    //     const normalizedFieldName = String(fieldName || "").trim();
    //     const normalizedFieldLabel = String(fieldLabel || "").trim();
    //     const normalizedFieldType = String(fieldType || "text").toLowerCase();
    //     const camelCasePattern = /^[a-z][a-zA-Z0-9]*$/;

    //     if (!normalizedFieldName) {
    //         toast.error("Field name is required.");
    //         return;
    //     }

    //     if (!camelCasePattern.test(normalizedFieldName)) {
    //         toast.error("Field name must be camelCase (example: emergencyContact).");
    //         return;
    //     }

    //     try {
    //         setAddFieldSaving(true);

    //         const existingFieldKeys = new Set([
    //             ...Object.keys(viewData?.formData || {}),
    //             ...Object.keys(viewData?.customizedData || {}),
    //             ...Object.keys(draftCustomizedData || {}),
    //         ]);

    //         if (existingFieldKeys.has(normalizedFieldName)) {
    //             toast.error("Field name already exists. Please use a unique name.");
    //             return;
    //         }

    //         const emptyValue = (normalizedFieldType === "file" || normalizedFieldType === "checkbox") ? [] : "";

    //         const updatedCustomizedData = {
    //             ...(viewData?.customizedData || {}),
    //             ...(isEditing ? draftCustomizedData : {}),
    //             [normalizedFieldName]: emptyValue,
    //         };

    //         const saveRes = await saveCaseSubcategoryData({
    //             caseId,
    //             subcategoryId: subCategoryId,
    //             formData: isEditing ? draftFormData : viewData?.formData || {},
    //             customizedData: updatedCustomizedData,
    //         });

    //         if (saveRes?.status === 200) {
    //             const newFieldDefinition = {
    //                 id: normalizedFieldName,
    //                 label: normalizedFieldLabel || normalizedFieldName,
    //                 type: normalizedFieldType,
    //                 required: Boolean(required),
    //                 placeholder: "",
    //                 options: [],
    //                 isCustomized: true,
    //                 bucket: "customizedData",
    //                 isAdditional: true,
    //             };

    //             setEditTemplateData(prev => ({
    //                 ...prev,
    //                 fields: [...prev.fields, newFieldDefinition]
    //             }));

    //             setViewData(prev => ({
    //                 ...prev,
    //                 customizedData: updatedCustomizedData,
    //             }));

    //             if (isEditing) {
    //                 setDraftCustomizedData(prev => ({
    //                     ...prev,
    //                     [normalizedFieldName]: emptyValue
    //                 }));
    //             }

    //             toast.success(saveRes?.data?.message || "Additional field added successfully.");
    //             setAddFieldModalOpen(false);
    //         }
    //     } catch (error) {
    //         toast.error(error?.response?.data?.message || error?.message || "Failed to add additional field.");
    //     } finally {
    //         setAddFieldSaving(false);
    //     }
    // };
    const handleStartVerification = (payload) => {
        return getPrevverifyData(payload);
    };

    const handleFinalizeVerification = (payload) => {
        return finalizeAgentVerifyCaseService(payload);
    };
    const combinedData = isEditing
        ? {
            ...draftFormData,
            ...draftCustomizedData,
        }
        : {
            ...(viewData?.formData || {}),
            ...(viewData?.customizedData || {}),
        };

    const fieldEntries = Object.entries(combinedData);

    const validationErrors = useMemo(() => {
        if (!isEditing) return {};

        const errors = {};

        templateFields.forEach((field) => {
            const fieldId = String(field?.id || "");
            if (!fieldId) return;

            const bucket = field?.bucket || "formData";
            const value =
                bucket === "customizedData"
                    ? draftCustomizedData?.[fieldId]
                    : draftFormData?.[fieldId];

            const message = getDynamicFieldValidationMessage(field, value);
            if (message) errors[fieldId] = message;
        });

        return errors;
    }, [isEditing, templateFields, draftFormData, draftCustomizedData]);

    return (
        <details
            className="group bg-white rounded-xl border overflow-hidden"
            onToggle={(e) => {
                if (e.target.open) fetchVerificationData({ caseId, subcategoryId });
            }}
        >
            <summary className={`cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-1 border-l-4 rounded-lg 
                ${subCategory?.status === "COMPLETED" ? "border-l-green-500" : (subCategory?.status === "PENDING" || subCategory?.status === "IN_PROGRESS") ? "border-l-yellow-500" : "border-l-red-500"} hover:bg-gray-100 transition`}>
                <div>
                    <h4 className="font-semibold text-sm sm:text-base">
                        {subCategory?.name || "Subcategory"}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                        Status: <span className={`px-2 py-0.5 rounded-full ${status?.className}`}>
                            {status?.text}
                        </span>
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {canAccessVerification && (
                        <>
                            {/* <button
                                type="button"
                                className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-900 text-white hover:bg-black disabled:opacity-50 cursor-pointer"
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    handleEditStart();
                                }}
                                disabled={isLoading}
                            >
                                {isLoading ? "Preparing..." : "Edit"}
                            </button> */}
                            <button
                                type="button"
                                className="px-3 py-1.5 text-xs font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    setVerificationModalOpen(true);
                                }}
                                disabled={isLoading}
                            >
                                Verify
                            </button>
                        </>
                    )}

                    {/* {isEditing && (
                        <>
                            <button
                                type="button"
                                className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    setAddFieldModalOpen(true);
                                }}
                                disabled={isSaving}
                            >
                                Add Field
                            </button>
                            <button
                                type="button"
                                className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-900 text-white hover:bg-black disabled:opacity-50 cursor-pointer"
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    handleSave();
                                }}
                                disabled={isSaving}
                            >
                                {isSaving ? "Saving..." : "Save"}
                            </button>
                            <button
                                type="button"
                                className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    handleCancel();
                                }}
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                        </>
                    )} */}
                </div>
            </summary>

            <div className="p-4 space-y-3 border-t">
                {isLoading && <p>Loading...</p>}

                {!isLoading && !fieldEntries.length && (
                    <p>No saved data found for this subcategory.</p>
                )}

                {!isLoading && !!fieldEntries.length && (
                    <div className="grid md:grid-cols-2 gap-3">
                        {fieldEntries.map(([key, value]) => (
                            <div key={key}>
                                {isEditing ? (
                                    <EditableFormFieldRenderer
                                        fieldKey={key}
                                        currentValue={value}
                                        fieldMeta={getFieldMeta(key)}
                                        fieldError={validationErrors?.[key]}
                                        subCategoryId={subcategoryId}
                                        onFieldChange={handleFieldChange}
                                    />
                                ) : (
                                    <VerificationFieldDisplay
                                        fieldKey={key}
                                        value={value}
                                        verificationStatus={viewData?.verifiedFields?.[key]}
                                        canAccessVerification={canAccessVerification}
                                        subCategoryData={subCategory}
                                        fetchCaseDetails={fetchCaseDetails}
                                        fetchVerificationData={fetchVerificationData}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <FinalizeVerificationModal
                isOpen={verificationModalOpen}
                onClose={() => setVerificationModalOpen(false)}
                subCategoryData={subCategory}
                verificationMode="subcategory"
                fetchCaseDetails={fetchCaseDetails}
                fetchVerificationData={fetchVerificationData}
                handleStartVerification={handleStartVerification}
                handleFinalizeVerification={handleFinalizeVerification}
            />

        </details>
    );
};

export default SubcategoryAccordion;
