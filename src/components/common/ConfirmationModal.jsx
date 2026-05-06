
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Info, AlertTriangle, XCircle } from "lucide-react";

const iconMap = {
  info: {
    icon: Info,
    bg: "from-blue-50 to-blue-100",
    color: "text-blue-600",
  },
  warning: {
    icon: AlertTriangle,
    bg: "from-yellow-50 to-yellow-100",
    color: "text-yellow-600",
  },
  error: {
    icon: XCircle,
    bg: "from-red-50 to-red-100",
    color: "text-red-600",
  },
};

const ConfirmationModal = ({
  openConfirmModal,
  handleConfirmation,
  handleCancel,
  buttonText = "Yes, Continue",
  descText = "delete this item",
  fullDescTex,
  loading = false,
  type = "info",
  confButtonCassName = "bg-red-600 hover:bg-red-700 disabled:bg-red-600 disabled:hover:bg-red-600",
}) => {
  const { icon: Icon, bg, color } = iconMap[type] || iconMap.info;

  return (
    <Dialog open={openConfirmModal} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[450px] rounded-2xl p-0 overflow-hidden">

        {/* Loader Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded-2xl">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col items-center text-center gap-5 px-8 pt-10 pb-6">
          <div
            className={`w-20 h-20 bg-gradient-to-br ${bg} rounded-full flex items-center justify-center`}
          >
            <Icon className={`h-10 w-10 ${color} `} />
          </div>

          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Are you sure?
            </DialogTitle>
          </DialogHeader>

          <p className="text-gray-600 text-base leading-relaxed">
            {fullDescTex || `Are you sure you want to ${descText}?`}
          </p>
        </div>

        {/* Footer */}
        <DialogFooter className="flex gap-4 px-6 pb-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 py-3 rounded-lg cursor-pointer "
          >
            Cancel
          </Button>

          <Button
            onClick={handleConfirmation}
            disabled={loading}
            className={`flex-1 py-3 rounded-lg cursor-pointer ${confButtonCassName}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </span>
            ) : (
              buttonText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;