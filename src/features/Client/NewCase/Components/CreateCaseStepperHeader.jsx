import useAuthStore from "@/store/useAuthStore";

const CreateCaseStepperHeader = ({ steps, currentStep }) => {
  const user = useAuthStore((state) => state.user);
  const userRole = user?.roleName;
  return (
    <div className="bg-white border rounded-xl p-3">
      <div className={`grid grid-cols-1 ${userRole === "Client" ? "sm:grid-cols-2" : "sm:grid-cols-3"} gap-2`}>
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div
              key={step.id}
              className={`rounded-lg border px-2 py-2 text-center transition ${isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : isCompleted
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                }`}
            >
              <p className="text-[10px] font-semibold">Step {index + 1}</p>
              <p className="text-[11px] leading-tight">{step.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CreateCaseStepperHeader;
