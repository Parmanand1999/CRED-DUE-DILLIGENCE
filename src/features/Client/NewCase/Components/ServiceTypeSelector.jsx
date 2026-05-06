const ServiceTypeSelector = ({
  serviceTypes = [],
  selectedServiceTypeId = "",
  onSelect,
  loading = false,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-800">Service Types</h3>
        {loading && <p className="text-xs text-gray-500">Loading...</p>}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {serviceTypes.map((serviceType) => {
          const serviceTypeId = String(serviceType?._id || "");
          const isSelected = selectedServiceTypeId === serviceTypeId;

          return (
            <button
              key={serviceTypeId}
              type="button"
              onClick={() => onSelect?.(serviceTypeId)}
              className={`rounded-lg border px-3 py-3 text-left transition ${
                isSelected
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-800 hover:border-gray-400"
              }`}
            >
              <p className="text-sm font-semibold">
                {serviceType?.name || "Service Type"}
              </p>
              <p
                className={`mt-1 text-[11px] uppercase tracking-wide ${
                  isSelected ? "text-gray-300" : "text-gray-500"
                }`}
              >
                {serviceType?.code || ""}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceTypeSelector;
