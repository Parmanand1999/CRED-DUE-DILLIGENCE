// utils/statusUtils.ts
export const getStatusBadgeConfig = (status) => {
    switch (status) {
        case "COMPLETED":
            return {
                text: "Completed",
                className: "bg-green-100 text-green-600",
            };

        case "PENDING":
            return {
                text: "Pending",
                className: "bg-yellow-100 text-yellow-600",
            };

        case "IN_PROGRESS":
            return {
                text: "In Progress",
                className: "bg-yellow-100 text-yellow-600",
            };

        default:
            return {
                text: "Failed",
                className: "bg-red-100 text-red-600",
            };
    }
};