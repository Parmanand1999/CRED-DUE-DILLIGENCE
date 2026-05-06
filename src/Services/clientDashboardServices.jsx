import { deleteData, getData, postData } from "./apiServices";

// export const updateEmailApi = (data) => postData("/auth/signup", data);
export const DashboardDataList = (params) => getData(`/client/dashboard`);

export const creatCase = (data) => postData("/case/create", data);
export const BranchesDataList = ({ branchId, param }) => getData(`/client/branches/${branchId}?${param}`);
export const deleteBranch = ({ clientId, branchId }) => deleteData(`/client/${clientId}/branches/${branchId}`);
