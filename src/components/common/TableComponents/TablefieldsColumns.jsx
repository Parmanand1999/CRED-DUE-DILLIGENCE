import { ChevronRight, Eye, LockIcon, Pencil, PenIcon, Trash2, UnlockIcon } from "lucide-react";
import CustomButton from "../Buttons/CustomButton";
import { Tooltip } from "../Tooltip";
import { Switch } from "@/components/ui/switch";

export const DashboardColumn = () => [
  {
    accessorKey: "caseId",
    header: "CASE ID",
    cell: ({ row }) => (
      <span className="text-blue-600 font-medium cursor-pointer">
        {row.original.caseId}
      </span>
    ),
  },

  {
    accessorKey: "clientName",
    header: "CLIENT NAME",
  },

  {
    accessorKey: "verificationType",
    header: "VERIFICATION TYPE",
  },

  {
    accessorKey: "aging",
    header: "AGING (DAYS)",
    cell: ({ row }) => {
      const value = row.original.aging;

      // dynamic color
      let color = "bg-gray-200 text-gray-700";
      if (value <= 3) color = "bg-yellow-100 text-yellow-700";
      if (value >= 4) color = "bg-red-100 text-red-600";

      return (
        <span className={`px-2 py-1 text-xs rounded-full ${color}`}>
          {value} Days
        </span>
      );
    },
  },

  {
    accessorKey: "assignedTo",
    header: "ASSIGNED TO",
  },

  {
    id: "action",
    header: "ACTION",
    cell: () => (
      <ChevronRight className="cursor-pointer text-gray-400" size={18} />
    ),
  },
];


export const branchListColumns = (handleDelete) => [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        <div className="text-sm text-gray-500">
          {row.original.firstName} {row.original.lastName}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'mobileNumber',
    header: 'Mobile',
  },
  {
    accessorKey: 'branchCode',
    header: 'Branch Code',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${row.original.status === 'active'
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
          }`}
      >
        {row.original.status}
      </span>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <CustomButton
        onClick={() => handleDelete(row.original._id)}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm"
      >
        <Trash2 size={16} />
      </CustomButton>
    ),
  },
];

export const userListColumns = (handleDelete, handleEdit, handelActiveInactive, handleViewDetails) => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "mobileNumber",
    header: "Mobile",
  },
  {
    accessorKey: "roleName",
    header: "Role",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span
          className={`px-2 py-1 rounded-full text-xs ${row.original.status === "active"
            ? "bg-green-100 text-green-600"
            : "bg-red-100 text-red-600"
            }`}
        >
          {row.original.status==="active" ? "Active" : "In Active"}
        </span>

      </div>
    ),
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">

        {handleEdit && (
          <Tooltip title="Edit">
            <span onClick={() => handleEdit(row.original)} className="cursor-pointer text-blue-600">
              <Pencil size={16} />
            </span>
          </Tooltip>

        )}
        {handleDelete && (
          <Tooltip title="Delete">
            <span onClick={() => handleDelete(row.original._id)} className="cursor-pointer text-red-600">
              <Trash2 size={16} />
            </span>
          </Tooltip>

        )}
        {handelActiveInactive && (
          <Tooltip title={row.original.status === "active" ? "InActive" : "Active"}>
            <span onClick={() => handelActiveInactive({ id: row.original._id, status: row.original.status })} className="cursor-pointer text-green-600">
              {row.original.status !== "active" ? <LockIcon size={16} /> : <UnlockIcon size={16} />}
            </span>
          </Tooltip>

        )}
        <Tooltip title="View">
          <span onClick={() => handleViewDetails(row.original)} className="cursor-pointer text-blue-600">
            <Eye size={16} />
          </span>
        </Tooltip>
      </div>
    ),
  },
];

export const clientListColumns = (handleDelete, handleEdit, handleStatus, handleViewDetails) => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "mobileNumber",
    header: "Mobile",
  },
  {
    accessorKey: "branchCode",
    header: "Branch Code",
  },
  {
    header: "Organization",
    cell: ({ row }) => row.original.organization?.organizationName || "-",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded-lg text-xs ${row.original.status === "active"
          ? "bg-green-100 text-green-600"
          : "bg-red-100 text-red-600"
          }`}
      >
        {row.original.status==="active" ? "Active" : "In Active"}
      </span>
    ),
  },
  {
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Tooltip title="Edit">
          <span onClick={() => handleEdit(row.original)} className="cursor-pointer text-blue-600">
            <Pencil size={16} />
          </span>
        </Tooltip>
        <Tooltip title="Delete">
          <span onClick={() => handleDelete(row.original._id)} className="cursor-pointer text-red-600">
            <Trash2 size={16} />
          </span>
        </Tooltip>
        <Tooltip title={row?.original?.status === "active" ? "Deactivate" : "Activate"}>
          <span onClick={() => handleStatus(row?.original)} className="cursor-pointer">
            {/* {row?.original?.status === "active" ? "Deactivate" : "Activate"} */}
            <Switch checked={row?.original?.status === "active"} />
          </span>
        </Tooltip>
        <Tooltip title="View Details">
          <span onClick={() => handleViewDetails(row.original)} className="cursor-pointer text-blue-600">
            <Eye size={16} />
          </span>
        </Tooltip>
      </div>
    ),
  },
];

