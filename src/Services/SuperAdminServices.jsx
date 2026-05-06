import { deleteData, getData, postData, putData } from "./apiServices";

// export const getUsersListData = (data) => postData("/auth/signup", data);
export const getUsersListData = ({ pram }) => getData(`/users?${pram}`);
export const deleteUser = ({ id }) => deleteData(`/users/${id}`);
export const createUser = (data) => postData("/users", data);
export const updateUser = ({ id, data }) => putData(`/users/${id}`, data);
export const getRolesList = () => getData(`/role`);
export const activateDeactivateUser = ({ id, data }) => putData(`/users/status/${id}`, { status: data });

export const createClient = (data) => postData("/client", data);
export const getClientsListData = ({ pram }) => getData(`/client?${pram}`);
export const deleteClient = ({ id }) => deleteData(`/client/${id}`);
export const organizationData = () => getData("/organizationType");