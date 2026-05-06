import { useEffect, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { deleteData, postData } from "@/Services/apiServices";
import { toast } from "react-toastify";

const UploadDocument = ({ setValue, setUploadedDocPayload, setLoading }) => {
  const [uploadedUrls, setUploadedUrls] = useState([]);

  const [error, setError] = useState("");

  const MAX_SIZE = 25 * 1024 * 1024; // 25MB
  const ALLOWED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  useEffect(() => {
    const urls = uploadedUrls.map((item) => item.url);
    setValue("documents", urls);
    setUploadedDocPayload(urls);
  }, [uploadedUrls, setValue]);
  // ✅ HANDLE FILE SELECT
  const handleFileChange = async (e) => {
    setError(""); // reset error
    const selectedFiles = Array.from(e.target.files);

    for (let file of selectedFiles) {
      // ❌ TYPE VALIDATION
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Only PDF, DOC, DOCX files are allowed");
        continue;
      }

      // ❌ SIZE VALIDATION
      if (file.size > MAX_SIZE) {
        setError(`${file.name} exceeds 25MB limit`);
        continue;
      }

      await uploadToS3(file);
    }
  };

  // ✅ UPLOAD FUNCTION
  const uploadToS3 = async (file) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "case-document");

      const res = await postData("/upload", formData);
      if (res.status === 200) {
        console.log(res, "------------------");
        toast.success(res.data.message);
        setUploadedUrls((prev) => [...prev, res.data.data]);
      }
      // const data = await res.json();
    } catch (err) {
      setError("Upload failed. Please try again.");
      console.error(err);
      toast.error(err.res.data.message);
    } finally {
      setLoading(false);
    }
  };
  console.log(uploadedUrls, "uploadedUrls");

  // ✅ REMOVE FILE
  const removeFile = async (url) => {
    try {
      setLoading(true);
      const res = await deleteData(
        `/upload/delete?fileUrl=${encodeURIComponent(url)}`,
      );
      if (res.status === 200) {
        setUploadedUrls((prev) => prev.filter((item) => item.url !== url));
        toast.success(res.data.message || "File removed");
      }
    } catch (err) {
      toast.error(error.res.data.message || "Failed to delete file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
      {/* HEADER */}
      <div>
        <h3 className="font-semibold text-lg">Upload Documents</h3>
      </div>

      {/* ✅ UPLOADED FILES TOP */}
      {uploadedUrls.length > 0 && (
        <div className="space-y-2 grid grid-cols-1 lg:grid-cols-2 gap-2">
          {uploadedUrls.map(
            (file, index) => (
              console.log(file?.url, "=========="),
              (
                <div
                  key={index}
                  className="flex items-center w-full min-w-0 justify-between border rounded-md px-3 py-2 bg-gray-50"
                  title={file.fileName}
                >
                  <div className="border relative group p-1 rounded-md min-w-0">
                    {/* CONTENT */}
                    <p className="text-xs font-medium truncate">
                      {file.fileName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                    {/* OVERLAY BUTTON */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                      <a
                        href={file.url}
                        target="_blank"
                        className="bg-gray-700 px-3 py-1 rounded text-white text-xs"
                      >
                        View Doc
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* <span className="text-green-600 text-xs">
                                    Uploaded
                                </span> */}

                    <button
                      onClick={() => removeFile(file.url)}
                      className="text-red-500 hover:text-red-600 cursor-pointer"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              )
            ),
          )}
        </div>
      )}

      {/* DROP AREA */}
      <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition">
        <UploadCloud className="text-gray-400 mb-2" size={28} />
        <p className="text-sm text-gray-600">Click files to upload</p>
        <p className="text-xs text-gray-500">
          Only PDF, DOC, DOCX (Max 25MB each)
        </p>
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {/* LOADING */}
      {/* {loading && (
                <p className="text-blue-500 text-sm">Uploading...</p>
            )} */}

      {/* ❌ ERROR (BOTTOM) */}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default UploadDocument;
