import { useEffect, useMemo, useState } from "react";
import CommonModal from "@/components/common/CommonModal";
import CustomButton from "@/components/common/Buttons/CustomButton";
import { postData } from "@/Services/apiServices";
import { toast } from "react-toastify";
import CustomLoader from "@/components/common/CustomLoader";

const BackendFinalizeVerificationModal = ({
  isOpen,
  onClose,
  subcategoryName = "Verification",
  verificationMode = "subcategory",
  targetKeyName = "",
  onStartVerification,
  onFinalizeVerification,
}) => {
  const [initiationResponse, setInitiationResponse] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [files, setFiles] = useState([]);
  const [startingVerification, setStartingVerification] = useState(false);
  const [finalizingVerification, setFinalizingVerification] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setInitiationResponse(null);
      setRemarks("");
      setFiles([]);
      setStartingVerification(false);
      setFinalizingVerification(false);
      setUploadingFiles(false);
      return;
    }

    setInitiationResponse(null);
    setRemarks("");
    setFiles([]);
    setStartingVerification(false);
    setFinalizingVerification(false);
    setUploadingFiles(false);
  }, [isOpen, verificationMode, targetKeyName]);

  const summaryRows = useMemo(() => {
    const responseData = initiationResponse?.data || {};
    const nestedData = responseData?.data || {};

    return [
      {
        label: "Verification API Message",
        value: responseData?.message || "Awaiting verification start.",
      },
      {
        label: "Verification detail",
        value:
          nestedData?.message ||
          responseData?.message ||
          "No verification details available.",
      },
      {
        label: "Vendor integration",
        value:
          typeof nestedData?.isVendorIntegrated === "boolean"
            ? nestedData.isVendorIntegrated
              ? "Active"
              : "Inactive"
            : null,
      },
      {
        label: "Vendor result",
        value:
          typeof nestedData?.success === "boolean"
            ? nestedData.success
              ? "SUCCESS"
              : "FAILED"
            : null,
      },
      {
        label: "Vendor status",
        value:
          initiationResponse?.status
            ? `${initiationResponse.status} success - Request processed successfully.`
            : null,
      },
    ].filter((item) => item.value !== null && item.value !== undefined);
  }, [initiationResponse]);

  const uploadSupportFiles = async (selectedFiles = []) => {
    if (!Array.isArray(selectedFiles) || !selectedFiles.length) {
      return;
    }

    try {
      setUploadingFiles(true);

      const uploadedUrls = [];
      const failedFiles = [];

      for (const file of selectedFiles) {
        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("folder", "case-document");

          const res = await postData("/upload", formData);
          const fileUrl = res?.data?.data?.url || res?.data?.data?.fileUrl || "";

          if (!fileUrl) {
            throw new Error("Uploaded file URL missing in response");
          }

          uploadedUrls.push(fileUrl);
        } catch (error) {
          failedFiles.push(file?.name || "File");
        }
      }

      if (uploadedUrls.length) {
        setFiles((prev) => [...prev, ...uploadedUrls]);
        toast.success(`${uploadedUrls.length} file(s) uploaded successfully`);
      }

      if (failedFiles.length) {
        toast.error(`${failedFiles.length} file(s) failed to upload`);
      }
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeUploadedFile = (fileUrlToRemove) => {
    setFiles((prev) => prev.filter((fileUrl) => fileUrl !== fileUrlToRemove));
  };

  const handleStartVerification = async () => {
    try {
      setStartingVerification(true);
      const response = await onStartVerification?.();
      setInitiationResponse(response);

      const nestedMessage = response?.data?.data?.message || "";
      if (nestedMessage) {
        setRemarks(nestedMessage);
      }

      toast.success(response?.data?.message || "Verification initiated");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to initiate verification.",
      );
    } finally {
      setStartingVerification(false);
    }
  };

  const handleFinalize = async (status) => {
    const trimmedRemarks = remarks.trim();
    if (!trimmedRemarks) {
      toast.error("Remarks are required.");
      return;
    }

    try {
      setFinalizingVerification(true);
      await onFinalizeVerification?.({
        status,
        remarks: trimmedRemarks,
        files,
      });
      onClose?.();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to finalize verification.",
      );
    } finally {
      setFinalizingVerification(false);
    }
  };

  const canFinalize = Boolean(initiationResponse);

  return (
    <CommonModal isOpen={isOpen} onClose={onClose} title="Finalize Verification">
      {finalizingVerification&&<CustomLoader/>}
      <div className="space-y-5">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">
            {subcategoryName}
          </h3>
          <p className="text-sm text-slate-500">
            Start verification, review the response, then confirm the final outcome.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {verificationMode === "field"
            ? `Verifying field: ${targetKeyName || "N/A"}`
            : "Verifying complete subcategory"}
        </div>

        {!canFinalize ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-600">
              Start the verification first to load the response summary and finalize it.
            </p>

            <div className="mt-4 flex justify-end">
              <CustomButton
                loading={startingVerification}
                onClick={handleStartVerification}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-white hover:bg-slate-800"
              >
                Start Verification
              </CustomButton>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="space-y-2">
                {summaryRows.map((row) => (
                  <div key={row.label}>
                    <p className="text-xs text-slate-500">{row.label}</p>
                    <p
                      className={`text-sm font-medium ${row.label === "Vendor result" && String(row.value).toUpperCase() === "FAILED" ? "text-red-700" : "text-slate-900"}`}
                    >
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Remarks *
              </label>
              <textarea
                className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                placeholder="Add verification remarks"
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Support Documents
              </label>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/60 px-5 py-8 text-center transition hover:border-amber-300 hover:bg-amber-50">
                <input
                  type="file"
                  multiple
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={async (event) => {
                    const selectedFiles = Array.from(event.target.files || []);
                    await uploadSupportFiles(selectedFiles);
                    event.target.value = "";
                  }}
                  disabled={uploadingFiles}
                />
                <div className="rounded-full bg-white p-3 shadow-sm">
                  <span className="text-sm font-semibold">Upload</span>
                </div>
                <p className="mt-4 text-base font-medium text-slate-900">
                  Tap to upload support documents
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Supports PDF, JPG, PNG (max 25 MB each)
                </p>
              </label>

              {uploadingFiles && (
                <p className="text-xs text-slate-500">Uploading files...</p>
              )}

              {files.length > 0 ? (
                <div className="space-y-2">
                  {files.map((fileUrl) => (
                    <div
                      key={fileUrl}
                      className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2"
                    >
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-xs text-blue-600 hover:underline"
                      >
                        {fileUrl}
                      </a>
                      <button
                        type="button"
                        className="text-xs font-medium text-red-600 hover:underline"
                        onClick={() => removeUploadedFile(fileUrl)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No documents attached yet.</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <CustomButton
                disabled={finalizingVerification}
                onClick={() => handleFinalize("NOT_VERIFIED")}
                className="flex-1 rounded-xl border border-rose-300 bg-white px-5 py-3 text-rose-700 hover:bg-rose-50"
              >
                Reject
              </CustomButton>
              <CustomButton
                disabled={finalizingVerification}
                onClick={() => handleFinalize("VERIFIED")}
                className="flex-1 rounded-xl bg-linear-to-r from-slate-900 via-amber-900 to-amber-600 px-5 py-3 text-white shadow-md hover:from-slate-800 hover:to-amber-500"
              >
                Verify
              </CustomButton>
            </div>
          </>
        )}
      </div>
    </CommonModal>
  );
};

export default BackendFinalizeVerificationModal;