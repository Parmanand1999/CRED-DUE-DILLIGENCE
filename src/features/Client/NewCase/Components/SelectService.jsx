import { useEffect, useRef, useState } from "react";
import FormCard from "./FormCard";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, Loader } from "lucide-react";
import {
  categoryData,
  getServiceTypeData,
  SubSategoryData,
} from "@/Services/CreateNewCaseServices";
import CustomLoader from "@/components/common/CustomLoader";
import { FaRupeeSign } from "react-icons/fa";
import ServiceTypeSelector from "./ServiceTypeSelector";

const SelectService = ({
  setLoading,
  setSelectedServicePayload,
  resetKey,
  selectedServicePayload,
  selectedServiceTypeId,
  setSelectedServiceTypeId,
}) => {
  const [serviceTypes, setServiceTypes] = useState([]);
  const [serviceTypeLoading, setServiceTypeLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState({});
  const [hiddenServicesPayload, setHiddenServicesPayload] = useState([]);
  const [loader, setLoader] = useState({});
  const resetKeyRef = useRef(resetKey);
  const hasHydratedServicesFromPayloadRef = useRef(false);

  useEffect(() => {
    if (resetKeyRef.current === resetKey) {
      return;
    }

    resetKeyRef.current = resetKey;
    setServices({});
    setHiddenServicesPayload([]);
    setLoader({});
    setCategories([]);
    setSelectedServicePayload([]);
    setSelectedServiceTypeId("");
    hasHydratedServicesFromPayloadRef.current = false;
  }, [resetKey, setSelectedServicePayload, setSelectedServiceTypeId]);

  useEffect(() => {
    if (hasHydratedServicesFromPayloadRef.current) {
      return;
    }

    if (
      !Array.isArray(selectedServicePayload) ||
      !selectedServicePayload.length
    ) {
      return;
    }

    const restoredServices = selectedServicePayload.reduce(
      (acc, categoryItem) => {
        const categoryId = categoryItem?.categoryId;
        if (!categoryId) {
          return acc;
        }

        const matchedCategory = categories.find(
          (category) => category._id === categoryId,
        );
        if (matchedCategory?.isVisible === false) {
          return acc;
        }

        const subcategories = Array.isArray(categoryItem?.subcategories)
          ? categoryItem.subcategories
          : (categoryItem?.subCategoryIds || []).map((subCategoryId) => ({
              subCategoryId,
              subCategoryName: subCategoryId,
              price: 0,
            }));

        acc[categoryId] = {
          selected: true,
          expanded: true,
          subcategories: subcategories.map((subCategory) => ({
            _id: subCategory?.subCategoryId || subCategory?._id,
            name:
              subCategory?.subCategoryName ||
              subCategory?.name ||
              "Subcategory",
            price: subCategory?.price || 0,
            selected: true,
          })),
        };

        return acc;
      },
      {},
    );

    setServices(restoredServices);
    hasHydratedServicesFromPayloadRef.current = true;
  }, [selectedServicePayload, categories]);
  useEffect(() => {
    fetchServiceTypes();
  }, []);

  const fetchServiceTypes = async () => {
    try {
      setServiceTypeLoading(true);
      const res = await getServiceTypeData();

      if (res.status === 200) {
        const rawServiceTypes = Array.isArray(res?.data?.data)
          ? res.data.data
          : [];

        const activeServiceTypes = rawServiceTypes.filter(
          (serviceType) =>
            String(serviceType?.status || "").toLowerCase() === "active",
        );

        setServiceTypes(activeServiceTypes);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setServiceTypeLoading(false);
    }
  };

  const fetchCategoryData = async (serviceTypeId) => {
    if (!serviceTypeId) {
      setCategories([]);
      return;
    }

    try {
      setCategoriesLoading(true);
      setLoading(true);
      const res = await categoryData(serviceTypeId);

      if (res.status === 200) {
        setCategories(res?.data?.data?.categoriesList || []);
      }
    } catch (error) {
      console.log(error);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedServiceTypeId) {
      setCategories([]);
      setServices({});
      setHiddenServicesPayload([]);
      setLoader({});
      setSelectedServicePayload([]);
      hasHydratedServicesFromPayloadRef.current = false;
      return;
    }

    setServices({});
    setHiddenServicesPayload([]);
    setLoader({});
    hasHydratedServicesFromPayloadRef.current = false;
    fetchCategoryData(selectedServiceTypeId);
  }, [selectedServiceTypeId]);

  // 🔥 SUBCATEGORY API
  const fetchSubCategories = async (categoryId, options = {}) => {
    const shouldPreselect = Boolean(options?.preselect);

    try {
      setLoader((prev) => ({ ...prev, [categoryId]: true }));

      const res = await SubSategoryData(categoryId);
      const subs = res.data.data.subcategoriesList || [];

      setServices((prev) => ({
        ...prev,
        [categoryId]: {
          ...prev[categoryId],
          selected: shouldPreselect && subs.length > 0,
          subcategories: subs.map((s) => ({
            ...s,
            selected: shouldPreselect,
          })),
        },
      }));
    } catch (err) {
      console.log(err);
    } finally {
      setLoader((prev) => ({ ...prev, [categoryId]: false }));
    }
  };

  const fetchHiddenServicesPayload = async () => {
    const hiddenCategories = categories.filter(
      (category) => category?.isVisible === false,
    );

    if (!hiddenCategories.length) {
      setHiddenServicesPayload([]);
      return;
    }

    try {
      const hiddenPayloadEntries = await Promise.all(
        hiddenCategories.map(async (category) => {
          const res = await SubSategoryData(category._id);
          const subcategories = res?.data?.data?.subcategoriesList || [];

          return {
            categoryId: category._id,
            categoryName: category?.name || "Service Category",
            isHiddenService: true,
            subCategoryIds: subcategories
              .map((subCategory) => subCategory?._id)
              .filter(Boolean),
            subcategories: subcategories.map((subCategory) => ({
              subCategoryId: subCategory?._id,
              subCategoryName: subCategory?.name,
              price: subCategory?.price,
              selected: true,
            })),
          };
        }),
      );

      setHiddenServicesPayload(hiddenPayloadEntries);
    } catch (error) {
      console.log(error);
      setHiddenServicesPayload([]);
    }
  };

  useEffect(() => {
    if (!categories.length) {
      return;
    }

    fetchHiddenServicesPayload();
  }, [categories]);

  // 🔥 CATEGORY TOGGLE
  const toggleCategory = async (category) => {
    const id = category._id;
    let shouldFetchSubcategories = false;
    let shouldPreselectSubcategories = false;

    setServices((prev) => {
      const existing = prev[id] || {};
      const currentSelected = Boolean(existing?.selected);
      const nextSelected = !currentSelected;
      const existingSubcategories = Array.isArray(existing?.subcategories)
        ? existing.subcategories
        : [];

      shouldFetchSubcategories = existingSubcategories.length === 0;
      shouldPreselectSubcategories = nextSelected;

      let nextSubcategories = existingSubcategories;

      if (existingSubcategories.length) {
        if (!nextSelected) {
          nextSubcategories = existingSubcategories.map((subCategory) => ({
            ...subCategory,
            selected: false,
          }));
        } else {
          const hasSelectedSubcategory = existingSubcategories.some(
            (subCategory) => Boolean(subCategory?.selected),
          );

          if (!hasSelectedSubcategory) {
            nextSubcategories = existingSubcategories.map(
              (subCategory, index) => ({
                ...subCategory,
                selected: index === 0,
              }),
            );
          }
        }
      }

      const normalizedSelected = nextSubcategories.length
        ? nextSubcategories.some((subCategory) =>
            Boolean(subCategory?.selected),
          )
        : nextSelected;

      return {
        ...prev,
        [id]: {
          ...existing,
          selected: normalizedSelected,
          expanded: true,
          subcategories: nextSubcategories,
        },
      };
    });

    if (shouldFetchSubcategories) {
      await fetchSubCategories(id, {
        preselect: shouldPreselectSubcategories,
      });
    }
  };

  // 🔥 EXPAND
  const toggleExpand = async (category) => {
    const id = category._id;

    setServices((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        expanded: !prev[id]?.expanded,
      },
    }));

    if (!services[id]?.subcategories?.length) {
      await fetchSubCategories(id, {
        preselect: Boolean(services[id]?.selected),
      });
    }
  };

  // 🔥 SUBCATEGORY TOGGLE
  const toggleSubCategory = (categoryId, subId) => {
    setServices((prev) => ({
      ...prev,
      [categoryId]: (() => {
        const categoryState = prev[categoryId] || {};
        const nextSubcategories = (categoryState?.subcategories || []).map(
          (sub) =>
            sub._id === subId ? { ...sub, selected: !sub.selected } : sub,
        );
        const hasSelectedSubcategory = nextSubcategories.some((subCategory) =>
          Boolean(subCategory?.selected),
        );

        return {
          ...categoryState,
          selected: hasSelectedSubcategory,
          subcategories: nextSubcategories,
        };
      })(),
    }));
  };

  // 🔥 REAL-TIME PAYLOAD
  useEffect(() => {
    const visibleCategoryIds = new Set(
      categories
        .filter((category) => category?.isVisible !== false)
        .map((category) => category._id),
    );

    const payload = Object.keys(services)
      .filter(
        (catId) => visibleCategoryIds.has(catId) && services[catId]?.selected,
      )
      .map((catId) => {
        const category = categories.find((cat) => cat._id === catId);
        const selectedSubcategories =
          services[catId]?.subcategories?.filter(
            (subCategory) => subCategory.selected,
          ) || [];

        return {
          categoryId: catId,
          categoryName: category?.name || "Service Category",
          isHiddenService: false,
          subCategoryIds: selectedSubcategories.map(
            (subCategory) => subCategory._id,
          ),
          subcategories: selectedSubcategories.map((subCategory) => ({
            subCategoryId: subCategory._id,
            subCategoryName: subCategory.name,
            price: subCategory.price,
            selected: subCategory.selected,
          })),
        };
      });

    setSelectedServicePayload([...payload, ...hiddenServicesPayload]);
    // setValue("services", payload);
    // onChange && onChange(payload);
  }, [services, categories, hiddenServicesPayload]);

  const handleServiceTypeSelect = (serviceTypeId) => {
    const normalizedServiceTypeId = String(serviceTypeId || "");
    if (!normalizedServiceTypeId) {
      return;
    }

    if (normalizedServiceTypeId === selectedServiceTypeId) {
      return;
    }

    setSelectedServiceTypeId(normalizedServiceTypeId);
    setSelectedServicePayload([]);
  };

  const visibleCategories = categories.filter(
    (category) => category?.isVisible !== false,
  );

  return (
    <FormCard title="SELECT SERVICES">
      <ServiceTypeSelector
        serviceTypes={serviceTypes}
        selectedServiceTypeId={selectedServiceTypeId}
        onSelect={handleServiceTypeSelect}
        loading={serviceTypeLoading}
      />

      {!selectedServiceTypeId && (
        <div className="mt-4 rounded border border-dashed border-gray-300 p-4 text-sm text-gray-600">
          Select a service type to load service categories.
        </div>
      )}

      {selectedServiceTypeId &&
        !visibleCategories.length &&
        !categoriesLoading && (
          <div className="mt-4 rounded border border-dashed border-gray-300 p-4 text-sm text-gray-600">
            No service categories found for the selected service type.
          </div>
        )}

      {!selectedServiceTypeId ? null : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2 items-start">
          {visibleCategories.map((cat) => {
            const service = services[cat._id] || {};

            return (
              <div key={cat._id} className="relative border rounded p-2">
                {/* LOADER */}
                {loader[cat._id] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10 rounded">
                    <CustomLoader size={10} />
                  </div>
                )}

                {/* HEADER */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={service?.selected || false}
                      onCheckedChange={() => toggleCategory(cat)}
                    />
                    <span>{cat.name}</span>
                  </div>

                  <ChevronDown
                    size={16}
                    className="cursor-pointer"
                    onClick={() => {
                      toggleExpand(cat);
                    }}
                  />
                </div>

                {/* SUBCATEGORY */}
                {service?.expanded && (
                  <div className="ml-5 mt-2 space-y-1">
                    {loader[cat._id] ? null : service?.subcategories?.length >
                      0 ? (
                      service.subcategories.map((sub) => (
                        <div
                          key={sub._id}
                          className="flex justify-between items-center gap-2"
                        >
                          <div className="flex">
                            <Checkbox
                              checked={sub.selected}
                              onCheckedChange={() =>
                                toggleSubCategory(cat._id, sub._id)
                              }
                            />
                            <span>{sub.name}</span>
                          </div>

                          <span className=" flex items-center text-sm shadow-sm p-1 rounded-sm">
                            <FaRupeeSign />
                            {sub.price}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-400 italic">
                        No data available
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </FormCard>
  );
};

export default SelectService;
