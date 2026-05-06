import { useState, useRef } from "react";
import { UploadCloud, X, FileText, SendHorizontal } from "lucide-react";
import { toast } from "react-toastify";
import { deleteData, postData } from "@/Services/apiServices";
import CustomButton from "@/components/common/Buttons/CustomButton";

import BulkUploadSuccessModal from "@/features/BulkCaseUpload/BulkUploadSuccessModal";
import useAuthStore from "@/store/useAuthStore";
import CustomLoader from "@/components/common/CustomLoader";

const BulkCaseUpload = () => {
  const [uploadedUrls, setUploadedUrls] = useState([]);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [uploadSummary, setUploadSummary] = useState(null);
  const userId = useAuthStore((state) => state.user);
  const MAX_SIZE = 25 * 1024 * 1024;
  const fileInputRef = useRef(null);

  const ALLOWED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  // ✅ Upload API (S3)
  const uploadToS3 = async (file) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "bulk-uploads");

      const res = await postData("/upload", formData);

      if (res.status === 200) {
        setUploadedUrls([
          {
            url: res.data.data.url,
            fileName: file.name,
            size: file.size,
          },
        ]);

        toast.success("File uploaded");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Validate + Upload
  const handleFiles = async (files) => {
    setError("");

    for (let file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Only PDF, DOC, DOCX, CSV, XLSX allowed");
        continue;
      }

      if (file.size > MAX_SIZE) {
        setError(`${file.name} exceeds 25MB`);
        continue;
      }

      await uploadToS3(file);
    }
  };

  const handleFileChange = (e) => {
    handleFiles(Array.from(e.target.files));
    // Reset the input value to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ✅ Drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (["dragenter", "dragover"].includes(e.type)) {
      setDragActive(true);
    } else {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    handleFiles(Array.from(e.dataTransfer.files));
  };

  // ✅ Remove file
  const removeFile = async (url) => {
    try {
      setLoading(true);

      await deleteData(`/upload/delete?fileUrl=${encodeURIComponent(url)}`);

      setUploadedUrls((prev) => prev.filter((item) => item.url !== url));

      toast.success("File removed");
    } catch (err) {
      toast.error("Delete failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FINAL SUBMIT API
  const handleSubmitToAdmin = async () => {
    try {
      if (uploadedUrls.length === 0) {
        toast.error("Please upload a file first");
        return;
      }

      setLoading(true);

      // 👉 latest uploaded file
      const fileUrl = uploadedUrls[uploadedUrls.length - 1].url;

      const payload = {
        clientId: userId._id,
        fileUrl,
      };

      const res = await postData("/case/bulk-upload", payload);

      if (res.status === 200) {
        toast.success(res.data.message || "Submitted successfully");

        // Open modal with summary
        setUploadSummary({
          uploadId:
            res.data?.uploadId ||
            `#BULK-${Math.floor(100000 + Math.random() * 900000)}`,
          totalFiles: uploadedUrls.length,
          processingTime: "2-4 Business Hours",
        });
        setSuccessModalOpen(true);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border shadow-sm space-y-2">
      {loading && <CustomLoader className="fixed" />}
      {/* 🔹 Guidelines */}
      <div className="bg-gray-50 border rounded-lg p-3 flex gap-3">
        <div className="w-6 h-6 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-600 text-xs font-bold">
          i
        </div>
        <div>
          <p className="text-sm font-semibold">Submission Guidelines</p>
          <p className="text-xs text-gray-600 mt-1">
            Upload CSV, Excel or PDF files (Max 25MB).
          </p>
        </div>
      </div>

      {/* 🔹 Upload */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-1">
          FILE REPOSITORY
        </p>

        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-3 text-center transition ${
            dragActive ? "bg-blue-50 border-blue-400" : "hover:bg-gray-50"
          }`}
        >
          <UploadCloud size={32} className="mx-auto text-gray-400 mb-2" />

          <p className="text-sm font-medium">Drag & drop or click to upload</p>

          <p className="text-xs text-gray-500 mt-1">
            CSV, XLSX, PDF (Max 25MB)
          </p>

          <label className="mt-3 inline-block">
            <span className="px-4 py-2 bg-gray-800 text-white text-xs rounded-md cursor-pointer ">
              Browse Files
            </span>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 🔹 Selected Files */}
      <div>
        <div className="flex justify-between mb-2">
          <p className="text-xs font-semibold text-gray-500">SELECTED FILES</p>
          <p className="text-xs text-orange-500">
            {uploadedUrls.length} files selected
          </p>
        </div>

        <div className="border rounded-lg p-3 bg-gray-50 min-h-18">
          {uploadedUrls.length === 0 ? (
            <p className="text-xs text-gray-400 text-center">
              No files attached yet
            </p>
          ) : (
            <div className="space-y-2">
              {uploadedUrls.map((file, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-white border rounded-md px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-500" />
                    <div>
                      <p className="text-xs font-medium">{file.fileName}</p>
                      <p className="text-[10px] text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={file.url}
                      target="_blank"
                      className="text-xs text-blue-500"
                    >
                      View
                    </a>

                    <button
                      type="button"
                      onClick={() => removeFile(file.url)}
                      className="text-red-500"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🔹 Error */}
      {error && <p className="text-xs text-red-500">{error}</p>}

      {/* 🔹 Footer */}
      <div className="text-xs text-green-600">
        🔒 End-to-end encrypted audit trail
      </div>

      <BulkUploadSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setSuccessModalOpen(false);
          setUploadedUrls([]);
          setUploadSummary(null);
        }}
        summary={uploadSummary}
      />

      {/* 🔹 Submit */}
      <CustomButton
        type="button"
        disabled={uploadedUrls.length === 0 || loading}
        onClick={handleSubmitToAdmin}
        className="bg-[#0B1F3A] w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          "Processing..."
        ) : (
          <>
            Submit to Admin <SendHorizontal size={16} />
          </>
        )}
      </CustomButton>
    </div>
  );
};

export default BulkCaseUpload;
