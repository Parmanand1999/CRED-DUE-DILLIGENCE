import React, { useEffect, useState, useCallback } from "react";
import DataTable from "@/components/common/TableComponents/DataTable";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { toast } from "react-toastify";
import { userListColumns } from "@/components/common/TableComponents/TablefieldsColumns";
import { activateDeactivateUser, deleteUser, getUsersListData } from "@/Services/SuperAdminServices";
import CustomButton from "@/components/common/Buttons/CustomButton";
import useDebounce from "@/hooks/useDebounceHook";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import CommonModal from "@/components/common/CommonModal";
import CreateUser from "./CreateUser";
import UserDetails from "./UserDetails";

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [totalCount, setTotalCount] = useState(0);
    const debouncedSearchTerm = useDebounce(search.trim(), 500);

    // Modal states
    const [openConfirmModal, setOpenConfirmModal] = useState(false);
    const [userIdToDelete, setUserIdToDelete] = useState(null);
    const [openUserModal, setOpenUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [openActiveInactiveModal, setOpenActiveInactiveModal] = useState(false);
    const [activeInactiveUserId, setActiveInactiveUserId] = useState(null);
    const [openUserDetailsModal, setOpenUserDetailsModal] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const [pagination, setPagination] = useState({
        pageIndex: 1,
        pageSize: 5,
    });

    const buildQueryParams = () => {
        const params = new URLSearchParams();
        params.append("pageNo", pagination.pageIndex);
        params.append("limit", pagination.pageSize);
        params.append("search", debouncedSearchTerm);
        return params.toString();
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const pram = buildQueryParams()
            const response = await getUsersListData({
                pram
            });

            if (response.status === 200) {
                setUsers(response.data.data.userList || []);
                setTotalCount(response.data.data.totalElement || 0);
            }
        } catch (error) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [debouncedSearchTerm, pagination.pageIndex, pagination.pageSize]);



    const handleDelete = (userId) => {
        setOpenConfirmModal(true)
        setUserIdToDelete(userId)
    }

    const handleEdit = (user) => {
        setSelectedUser(user);
        setOpenUserModal(true);
    }

    const handleCreate = () => {
        setSelectedUser(null);
        setOpenUserModal(true);
    }
    const handelActiveInactive = (data) => {
        setOpenActiveInactiveModal(true)
        setActiveInactiveUserId(data)
    }

    const handleViewDetails = (user) => {
        setUserDetails(user);
        setOpenUserDetailsModal(true);
    };
    const handleActiveInactiveConfirmation = async () => {

        try {
            setLoading(true)
            const response = await activateDeactivateUser({ id: activeInactiveUserId.id, data: activeInactiveUserId?.status === "active" ? "inactive" : "active" })
            if (response.status === 200) {
                toast.success(response.data.message || "User Active/Inactive successfully")
                setOpenActiveInactiveModal(false)
                setActiveInactiveUserId(null)
                fetchUsers()
            }
        } catch (error) {
            console.log(error, "error");

            toast.error(error?.response?.data?.message || "Failed to Active/Inactive user")
        } finally {
            setLoading(false)
        }
    }
    const handleConfirmation = async () => {
        try {
            setLoading(true)
            const response = await deleteUser({ id: userIdToDelete })
            if (response.status === 200) {
                toast.success(response.data.message || "User deleted successfully")
                setOpenConfirmModal(false)
                setUserIdToDelete(null)
                fetchUsers()
            }
        } catch (error) {
            console.log(error, "error");

            toast.error(error?.response?.data?.message || "Failed to delete user")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-6 space-y-4">

            {/* {loading && <Loader />} */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">User List</h1>
                <div className="flex items-center gap-4">
                    {/* 🔍 Search */}
                    <div className='flex items-center border rounded-lg border-gray-300 '>
                        <Search size={18} className="text-gray-400 ml-2" />
                        <Input
                            type="text"
                            placeholder="Search by name, email or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-80 outline-none border-none border-gray-300 rounded text-sm focus-visible:ring-0"
                        />

                    </div>
                    <CustomButton onClick={handleCreate}>
                        + Create User
                    </CustomButton>
                </div>
            </div>
            {/* 📊 Table */}
            <div className=" ">
                <DataTable
                    columns={userListColumns(handleDelete, handleEdit, handelActiveInactive, handleViewDetails)}
                    data={users}
                    pagination={pagination}
                    loading={loading}
                    setPagination={setPagination}
                    totalCount={totalCount}
                />
            </div>

            <ConfirmationModal
                openConfirmModal={openConfirmModal}
                handleConfirmation={handleConfirmation}
                handleCancel={() => setOpenConfirmModal(false)}
                loading={loading}
                buttonText="Yes, Delete"
                descText="delete this user"
            />
            <ConfirmationModal
                openConfirmModal={openActiveInactiveModal}
                handleConfirmation={handleActiveInactiveConfirmation}
                handleCancel={() => setOpenActiveInactiveModal(false)}
                loading={loading}
                buttonText="Yes, Active/Inactive"
                descText="Active/Inactive this user"
            />
            <CommonModal
                isOpen={openUserModal}
                onClose={() => setOpenUserModal(false)}
                title={selectedUser ? "Edit User" : "Create User"}
            >
                <CreateUser
                    initialData={selectedUser}
                    onClose={() => setOpenUserModal(false)}
                    onSuccess={fetchUsers}
                />
            </CommonModal>
            <UserDetails
                isOpen={openUserDetailsModal}
                onClose={() => setOpenUserDetailsModal(false)}
                user={userDetails}
            />
        </div>
    );
};

export default UserList;