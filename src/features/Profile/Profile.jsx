import { useState, useEffect } from "react";
import { Camera, Pencil, CheckCircle, XCircle, Copy, Check } from "lucide-react";
import { getData } from "@/Services/apiServices";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    roleName: "",
    organizationName: "",
    isEmailVerified: false,
    isMobileVerified: false,
    createdAt: "",
    lastUpdated: "",
    isBranch: false,
    branchCode: "",
    parentClient: null,
  });
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(profile);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getData("/userProfile");
        if (response.status === 200 && response.data.data) {
          const userData = response.data.data;
          const profileData = {
            _id: userData._id || "",
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            mobileNumber: userData.mobileNumber || "",
            roleName: userData.roleName || "",
            organizationName: userData.organization?.organizationName || "",
            isEmailVerified: userData.isEmailVerified || false,
            isMobileVerified: userData.isMobileVerified || false,
            createdAt: userData.createdAt || "",
            lastUpdated: new Date().toLocaleDateString(),
            isBranch: userData.isBranch || false,
            branchCode: userData.branchCode || "",
            parentClient: userData.parentClient || null,
          };
          setProfile(profileData);
          setDraft(profileData);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const startEditing = () => {
    setDraft(profile);
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setProfile({ ...draft, lastUpdated: "Just now" });
    setEditMode(false);
    // TODO: API call to update profile
  };

  const handleCopyBranchCode = () => {
    if (profile.branchCode) {
      navigator.clipboard.writeText(profile.branchCode);
      setCopied(true);
      toast.success("Branch code copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-8 lg:p-12">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d9b040] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-[#0f172a]">
          Profile Settings
        </h1>
        {/* <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[#0b1f3a] hover:bg-gray-50 border border-gray-200 cursor-pointer transition"
          onClick={editMode ? cancelEdit : startEditing}
        >
          <Pencil size={16} /> {editMode ? "Cancel" : "Edit Profile"}
        </button> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left Side - Avatar & Basic Info */}
        <div className="lg:col-span-1">
          <div className="flex flex-col items-center lg:items-start gap-6">
            <div className="relative">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full bg-gradient-to-tr from-yellow-200 to-yellow-100 flex items-center justify-center border-4 border-yellow-200 shadow-lg">
                <span className="text-4xl lg:text-5xl font-extrabold text-white">
                  {profile.firstName?.charAt(0) || ""}
                  {profile.lastName?.charAt(0) || ""}
                </span>
              </div>
              <button
                type="button"
                className="absolute -right-2 -bottom-2 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-[#d9b040] text-white flex items-center justify-center shadow-lg hover:bg-[#c7a639] transition cursor-pointer"
              >
                <Camera size={18} />
              </button>
            </div>

            <div className="text-center lg:text-left">
              <p className="text-base lg:text-lg font-semibold text-[#1f2937] mb-1">
                {profile.firstName} {profile.lastName}
              </p>
              <p className="text-sm text-gray-600 mb-1">{profile.roleName}</p>
              <p className="text-sm text-gray-500 mb-3">
                {profile.organizationName}
              </p>
              {/* <button className="text-sm font-medium text-[#d9b040] hover:text-[#c7a639] cursor-pointer transition">
                                    Change Profile Photo
                                </button> */}
            </div>

            <div className="w-full lg:w-auto">
              <p className="text-xs text-gray-400 text-center lg:text-left">
                Last updated: {profile.lastUpdated}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Form Fields */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name="firstName"
                    value={draft.firstName || ""}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-1 text-base focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 transition"
                    placeholder="Enter your first name"
                  />
                ) : (
                  <div className="rounded-lg border border-gray-200 px-4 py-1 bg-gray-50 text-base text-[#334155]">
                    {profile.firstName}
                  </div>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name="lastName"
                    value={draft.lastName || ""}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-1 text-base focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 transition"
                    placeholder="Enter your last name"
                  />
                ) : (
                  <div className="rounded-lg border border-gray-200 px-4 py-1 bg-gray-50 text-base text-[#334155]">
                    {profile.lastName}
                  </div>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile Number
                  {/* {profile.isMobileVerified && (
                    <CheckCircle
                      size={16}
                      className="inline ml-1 text-green-500"
                    />
                  )} */}
                  {/* {!profile.isMobileVerified && (
                    <XCircle size={16} className="inline ml-1 text-red-500" />
                  )} */}
                </label>
                {editMode ? (
                  <input
                    type="text"
                    name="mobileNumber"
                    value={draft.mobileNumber || ""}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-1 text-base focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 transition"
                    placeholder="Enter your mobile number"
                  />
                ) : (
                  <div className="rounded-lg border border-gray-200 px-4 py-1 bg-gray-50 text-base text-[#334155]">
                    {profile.mobileNumber}
                  </div>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                  {/* {profile.isEmailVerified && (
                    <CheckCircle
                      size={16}
                      className="inline ml-1 text-green-500"
                    />
                  )} */}
                  {/* {!profile.isEmailVerified && (
                    <XCircle size={16} className="inline ml-1 text-red-500" />
                  )} */}
                </label>
                {/* {editMode ? (
                  <input
                    type="email"
                    name="email"
                    value={draft.email || ""}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-1 text-base focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-300 transition"
                    placeholder="your.email@example.com"
                  />
                ) : ( */}
                <div className="rounded-lg border border-gray-200 px-4 py-1 bg-gray-50 text-base text-[#334155]">
                  {profile.email}
                </div>
                {/* )} */}
              </div>

              {/* Role */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role
                </label>
                <div className="rounded-lg border border-gray-200 px-4 py-1 bg-gray-50 text-base text-[#334155]">
                  {profile.roleName}
                </div>
              </div>

              {/* Organization */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Organization
                </label>
                <div className="rounded-lg border border-gray-200 px-4 py-1 bg-gray-50 text-base text-[#334155]">
                  {profile.organizationName}
                </div>
              </div>

              {/* Branch Code or Parent Client */}
              {!profile.isBranch && profile.branchCode && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch Code
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg border border-gray-200 px-4 py-1 bg-gray-50 text-base text-[#334155] flex-1">
                      {profile.branchCode}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyBranchCode}
                      className="flex items-center gap-1 px-4 py-1 rounded-lg bg-[#d9b040] text-white text-sm font-semibold hover:bg-[#c7a639] transition-all"
                    >
                      {copied ? (
                        <>
                          <Check size={16} /> Copied
                        </>
                      ) : (
                        <>
                          <Copy size={16} /> Copy
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate(`/branches/${profile._id}`);
                      }}
                      className="flex items-center gap-1 px-4 py-1 rounded-lg bg-[#d9b040] text-white text-sm font-semibold hover:bg-[#c7a639] transition-all"
                    >
                      View All Branches
                    </button>
                  </div>
                </div>
              )}

              {/* Parent Branch Details */}
              {profile.isBranch && profile.parentClient && (
                <div className="md:col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Your Parent Branch
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Name</p>
                      <p className="text-sm font-medium text-[#334155]">
                        {profile.parentClient.firstName} {profile.parentClient.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Email</p>
                      <p className="text-sm font-medium text-[#334155]">
                        {profile.parentClient.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Mobile</p>
                      <p className="text-sm font-medium text-[#334155]">
                        {profile.parentClient.mobileNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Organization</p>
                      <p className="text-sm font-medium text-[#334155]">
                        {profile.parentClient.organization?.organizationName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Organization Branch Code</p>
                      <p className="text-sm font-medium text-[#334155]">
                        {profile.branchCode || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* {editMode && (
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-8 py-1 rounded-lg bg-[#d9b040] text-base font-semibold text-white hover:bg-[#c7a639] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d9b040] cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            )} */}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
