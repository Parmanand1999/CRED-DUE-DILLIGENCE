import { useEffect, useMemo, useState } from "react";
import CommonModal from "@/components/common/CommonModal";
import CustomButton from "@/components/common/Buttons/CustomButton";
import { toast } from "react-toastify";
import CustomLoader from "@/components/common/CustomLoader";

const QCFinalizeVerificationModal = ({
    isOpen,
    onClose,
    subCategoryData = {},
    verificationMode = "subcategory",
    targetKeyName = "",
    fetchCaseDetails,
    handleFinalizeVerification,
}) => {
    const [canFinalize, setCanFinalize] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [startingVerification, setStartingVerification] = useState(false);
    const [finalizingVerification, setFinalizingVerification] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        setCanFinalize(false);
        setRemarks("");
        setStartingVerification(false);
        setFinalizingVerification(false);
    }, [isOpen]);

    const context = useMemo(() => {
        const {
            caseId,
            subCategoryId,
            _id,
            verificationMode: modeFromData,
            targetKeyName: keyNameFromData,
        } = subCategoryData || {};

        const isField = (modeFromData || verificationMode) === "field";

        return {
            caseId: String(caseId || ""),
            serviceId: String(_id || ""),
            keyName: keyNameFromData || targetKeyName || "",
            isField,
        };
    }, [subCategoryData, verificationMode, targetKeyName]);

    const getPayload = () => {
        if (!context.caseId || !context.serviceId) {
            throw new Error("Missing verification context.");
        }

        return {

            serviceId: context.serviceId,
            ...(context.isField && context.keyName
                ? { keyName: context.keyName }
                : {}),
        };
    };

    const onStart = () => {
        try {
            setStartingVerification(true);
            getPayload();
            setCanFinalize(true);
            // toast.success("Verification started");
        } catch (err) {
            toast.error(err?.message || "Something went wrong");
        } finally {
            setStartingVerification(false);
        }
    };

    const onFinalize = async (status) => {
        if (!remarks.trim()) {
            toast.error("Remarks are required.");
            return;
        }

        try {
            setFinalizingVerification(true);

            const res = await handleFinalizeVerification({
                ...getPayload(),
                action: status,
                remarks: remarks.trim(),
            });

            if (res?.status === 200) {
                await fetchCaseDetails?.();

                onClose?.();
                toast.success(res?.data?.data?.message || "Verification finalized");
            }
        } catch (err) {
            toast.error(
                err?.response?.data?.message ||
                err?.res?.data?.message ||
                err?.message ||
                "Something went wrong"
            );
        } finally {
            setFinalizingVerification(false);
        }
    };
    console.log(subCategoryData, "subcategory name in modal");

    return (
        <CommonModal isOpen={isOpen} onClose={onClose} title="Finalize Verification">
            {finalizingVerification && <CustomLoader />}

            <div className="space-y-5">
                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900">
                        {subCategoryData?.subCategoryName || "Subcategory"}
                    </h3>

                    <p className="text-sm text-slate-500">
                        Start verification, add remarks, then confirm the final outcome.
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {(subCategoryData?.verificationMode || verificationMode) === "field"
                        ? `Verifying field: ${subCategoryData?.targetKeyName || targetKeyName || "N/A"
                        }`
                        : "Verifying complete subcategory"}
                </div>

                {!canFinalize ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-sm text-slate-600">
                            Start the verification first to finalize it.
                        </p>

                        <div className="mt-4 flex justify-end">
                            <CustomButton
                                loading={startingVerification}
                                onClick={onStart}
                                className="rounded-xl bg-slate-900 px-5 py-2.5 text-white hover:bg-slate-800"
                            >
                                Start Verification
                            </CustomButton>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <label className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                Remarks *
                            </label>

                            <textarea
                                className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Add verification remarks"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <CustomButton
                                disabled={finalizingVerification}
                                onClick={() => onFinalize("REJECTED")}
                                className="flex-1 rounded-xl border border-rose-300 bg-white px-5 py-3 text-rose-700 hover:bg-rose-50"
                            >
                                Reject
                            </CustomButton>
                            <CustomButton
                                disabled={finalizingVerification}
                                onClick={() => onFinalize("RE_VERIFY")}
                                className="flex-1 rounded-xl bg-linear-to-r from-slate-900 via-amber-900 to-amber-600 px-5 py-3 text-white shadow-md hover:from-slate-800 hover:to-amber-500"
                            >
                               Send Back for Reverification
                            </CustomButton>
                            <CustomButton
                                disabled={finalizingVerification}
                                onClick={() => onFinalize("VERIFIED")}
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

export default QCFinalizeVerificationModal;