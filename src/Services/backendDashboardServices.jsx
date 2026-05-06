import { getData } from "./apiServices";

export const BackendDashboardDataList = (params) =>
  getData(`/backend/dashboard`, params);
