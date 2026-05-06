import { getData, postData } from "./apiServices";

export const updateEmailApi = (data) => postData("/auth/signup", data);
export const getServiceTypeData = () => getData("/serviceType");
export const categoryData = (serviceTypeId) =>
  getData(
    serviceTypeId
      ? `/serviceCategory?_id=${encodeURIComponent(serviceTypeId)}`
      : "/serviceCategory",
  );
export const SubSategoryData = (categoryId) =>
  getData(`/serviceSubcategory?categoryId=${categoryId}`);
export const generateDynamicForm = (subcategoryIds) =>
  postData(`/form/generate`, { subcategoryIds });
