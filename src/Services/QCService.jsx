import { getData, postData } from "./apiServices";


export const QCDashboardData = (data) => getData(`/qc/dashboard`);
export const viewQCCaseDetails = (caseId) => getData(`/qc/case-details/${caseId}`);
export const finalizeQCVerifyCaseService = (data) =>
  postData("/qc/service/verify", data);
// export const SubSategoryData = (categoryId) =>
//   getData(`/serviceSubcategor    y?categoryId=${categoryId}`);
// export const generateDynamicForm = (subcategoryIds) =>
//   postData(`/form/generate`, { subcategoryIds });
// export const getPrevverifyData = ({ caseId, subcategoryId }) =>
//   getData(`/agent/verify-data?caseId=${caseId}&subcategoryId=${subcategoryId}`);
// export const finalizeAgentVerifyCaseService = (data) =>
//   postData("/agent/verify-service", data);
// export const markCaseAsComplete = (caseId) =>
//   postData("/agent/final-verify-and-assign", { caseId });
// export const getCaseSubcategoryData = ({ caseId, subcategoryId }) =>
//   getData(
//     `/case/subcategory/data?caseId=${encodeURIComponent(caseId)}&subcategoryId=${encodeURIComponent(subcategoryId)}`,
//   );