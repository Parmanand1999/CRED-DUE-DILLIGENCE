import React, { useState, useCallback, useEffect } from 'react';
import DataTable from '@/components/common/TableComponents/DataTable';
import { getData, deleteData } from '@/Services/apiServices';
import { toast } from 'react-toastify';
import CustomLoader from "@/components/common/CustomLoader";
import { useParams } from 'react-router-dom';
import { branchListColumns } from '@/components/common/TableComponents/TablefieldsColumns';
import { BranchesDataList, deleteBranch } from '@/Services/clientDashboardServices';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { Button, Input } from '@base-ui/react';
import useDebounce from '@/hooks/useDebounceHook';
import { Search } from 'lucide-react';

const BranchList = () => {
    const { branchId } = useParams();
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openConfirmModal, setOpenConfirmModal] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [search, setSearch] = useState("");
    const [totalCount, setTotalCount] = useState(0);
    const [pagination, setPagination] = useState({
        pageIndex: 1,
        pageSize: 10,
    });
    const debouncedSearchTerm = useDebounce(search.trim(), 500);
    const buildQueryParams = () => {
        const params = new URLSearchParams();
        params.append("pageNo", pagination.pageIndex);
        params.append("limit", pagination.pageSize);
        params.append("search", debouncedSearchTerm);
        return params.toString();
    };


    // Fetch branches whenever pagination changes
    useEffect(() => {
        fetchBranches();
    }, [pagination.pageIndex, pagination.pageSize, debouncedSearchTerm]);

    const fetchBranches = useCallback(async () => {
        try {
            setLoading(true);

            const param = await buildQueryParams();

            // Pass pagination params to API
            const response = await BranchesDataList({ branchId, param });

            if (response.status === 200) {
                setBranches(response.data.data || []);
                setTotalCount(response.data.total || 0); // Ensure API returns total count
            }
        } catch (error) {
            toast.error('Failed to fetch branches');
            console.error('Error fetching branches:', error);
        } finally {
            setLoading(false);
        }
    }, [pagination.pageIndex, pagination.pageSize, debouncedSearchTerm]);


    const handleDelete = (clientId) => {
        setSelectedClientId(clientId);
        setOpenConfirmModal(true);
    };

    const handleConfirmation = async () => {
        if (!selectedClientId) return;

        try {
            const response = await deleteBranch({
                clientId: branchId,
                branchId: selectedClientId,
            });

            if (response.status === 200) {
                toast.success('Branch deleted successfully');
                fetchBranches();
            }
        } catch (error) {
            toast.error('Failed to delete branch');
            console.error(error);
        } finally {
            setOpenConfirmModal(false);
            setSelectedClientId(null);
        }
    };

    if (loading) {
        return <CustomLoader/>;
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Branch List</h1>
                <div className='flex items-center border rounded-lg border-gray-300 rounded p-1'>
                    <Search size={18} className="text-gray-400 mr-2" />
                    <Input
                        type="text"
                        placeholder="Search by user name , email or phone number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-80 outline-none border-none border-gray-300 rounded text-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm ">
                <DataTable
                    columns={branchListColumns(handleDelete)}
                    data={branches}
                    isPagination={true}
                    pagination={pagination}
                    setPagination={setPagination}
                    totalCount={totalCount}
                />
            </div>
            <ConfirmationModal
                openConfirmModal={openConfirmModal}
                handleConfirmation={handleConfirmation}
                handleCancel={() => setOpenConfirmModal(false)}
                buttonText="Yes, Delete"
                descText="delete this branch"
            />

        </div>
    );
};

export default BranchList;