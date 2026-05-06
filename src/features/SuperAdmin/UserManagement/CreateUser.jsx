import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import CustomButton from "@/components/common/Buttons/CustomButton";
import { createUser, getRolesList, updateUser } from "@/Services/SuperAdminServices";
import { toast } from "react-toastify";
import CustomLoader from "@/components/common/CustomLoader";

const schema = z.object({
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    email: z.string().email("Valid email is required").min(1, "Email is required"),
    mobile: z.string().length(10, "Mobile number must be 10 digits"),
    roleId: z.string().min(1, "Role is required"),
    gender: z.string().min(1, "Gender is required"),
});


const CreateUser = ({ initialData, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [roles, setRoles] = useState([]);
    const isEditMode = Boolean(initialData?._id);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            mobile: "",
            roleId: "",
            gender: "",
        },
    });

    useEffect(() => {
        if (initialData && roles.length > 0) {
            reset({
                firstName: initialData.firstName || "",
                lastName: initialData.lastName || "",
                email: initialData.email || "",
                mobile: initialData.mobileNumber || "",
                roleId: initialData.roleId || "", // ✅ this is fine
                gender: initialData.gender || "",
            });
        }
    }, [initialData, roles, reset]);
    const fetchRole = async () => {
        try {
            setLoading(true);
            const response = await getRolesList();
            setRoles(response.data.data);
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        fetchRole();
    }, []);
    const onSubmit = async (data) => {
        try {
            setLoading(true);
            let response;
            if (isEditMode) {
                response = await updateUser({ id: initialData._id, data });
            } else {
                response = await createUser(data);
            }

            if (response.status === 200 || response.status === 201) {
                toast.success(response.data?.message || `User ${isEditMode ? "updated" : "created"} successfully`);
                if (onSuccess) onSuccess();
                if (onClose) onClose();
            }
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {loading && <CustomLoader/>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">First Name <span className="text-red-500">*</span></label>
                    <Input placeholder="Enter First Name" {...register("firstName")} className="h-9 text-sm" />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                </div>

                {/* Last Name */}
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Last Name <span className="text-red-500">*</span></label>
                    <Input placeholder="Enter Last Name" {...register("lastName")} className="h-9 text-sm" />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                </div>

                {/* Email */}
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Email <span className="text-red-500">*</span></label>
                    <Input type="email" placeholder="Enter Email Address" {...register("email")} className="h-9 text-sm" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                {/* Mobile */}
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Mobile Number <span className="text-red-500">*</span></label>
                    <Input type="number" placeholder="Enter Mobile Number" {...register("mobile")} className="h-9 text-sm" />
                    {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>}
                </div>

                {/* Role ID */}
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Role <span className="text-red-500">*</span></label>
                    <select
                        {...register("roleId")}
                        className={`flex h-9 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 ${errors.roleId ? 'border-destructive' : ''}`}

                    >
                        <option value="">Select Role</option>
                        {roles.map((role) => (
                            <option key={role.id} value={role._id}>{role.name}</option>
                        ))}
                    </select>
                    {errors.roleId && <p className="text-red-500 text-xs mt-1">{errors.roleId.message}</p>}
                </div>

                {/* Gender */}
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Gender <span className="text-red-500">*</span></label>
                    <select
                        {...register("gender")}
                        className={`flex h-9 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 ${errors.gender ? 'border-destructive' : ''}`}
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <CustomButton
                    type="button"
                    onClick={onClose}
                    className="bg-white border text-gray-700 hover:bg-gray-50 h-9"
                >
                    Cancel
                </CustomButton>
                <CustomButton
                    type="submit"
                    loading={loading}
                    className="bg-[#0B1F3A] hover:bg-[#0B1F3A]/90 h-9"
                >
                    {isEditMode ? "Update User" : "Create User"}
                </CustomButton>
            </div>
        </form>
    );
};

export default CreateUser;