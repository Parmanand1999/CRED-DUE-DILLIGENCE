import { getData, postData, putData } from "./apiServices";

// export const updateEmailApi = (data) => postData("/auth/signup", data);
export const CaseList = (params) => getData(`/case/list?${params}`);

export const creatCase = (data) => postData("/case/create", data);
export const saveCaseSubcategoryData = (data) =>
  postData("/case/subcategory/data", data);
export const addCaseServiceSubcategory = (data) =>
  postData("/case/service/add", data);
export const getCaseSubcategoryData = ({ caseId, subcategoryId }) =>
  getData(
    `/case/subcategory/data?caseId=${encodeURIComponent(caseId)}&subcategoryId=${encodeURIComponent(subcategoryId)}`,
  );
export const viewCaseDetails = (caseId) => getData(`/case/${caseId}`);
export const UpdateCaseDetails = ({ caseId, data }) =>
  putData(`/case/update/${caseId}`, data);
export const verifyCaseServiceField = (data) =>
  postData("/backend/service/verify", data);
export const finalizeVerifyCaseServiceField = (data) =>
  postData("/backend/service/final-verify", data);
export const initiateCaseAssignment = (data) =>
  postData("/backend/service/initiate-assignment", data);

export const moveServiceToPhysical = (data) =>
  postData("/backend/service/move-to-physical", data);
export const finalCompleteCaseService = (data) =>
  postData("/backend/service/final-complete", data);
