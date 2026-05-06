import { X } from "lucide-react";
import { useEffect } from "react";

const CommonModal = ({ isOpen, onClose, children, title, bgHeaderColor = "" }) => {
  // ESC key close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 🔹 BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 🔹 MODAL */}
      <div className="relative bg-white w-full max-w-3xl mx-4 rounded-xl shadow-lg animate-fadeIn">
        {/* HEADER */}
        <div className={`flex justify-between items-center border-b px-5 py-3 ${bgHeaderColor}`}>
          <h2 className="text-sm font-semibold">{title}</h2>

          <button onClick={onClose} className="cursor-pointer ">
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default CommonModal;
