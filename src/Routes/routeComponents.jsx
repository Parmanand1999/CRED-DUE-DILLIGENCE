import ForgotPassword from "@/features/authService/ForgotPassword";
import Login from "@/features/authService/Login";
import ResendVerificationEmail from "@/features/authService/ResendVerificationEmail";
import ResetPassword from "@/features/authService/ResetPassword";
import SendVerificationMail from "@/features/authService/SendVerificationMail";
import SignUp from "@/features/authService/SignUp";
import UpdateEmail from "@/features/authService/UpdateEmail";
import VerifyEmail from "@/features/authService/VerifyEmail";
import VerificationCases from "@/features/Client/AllCases/VerificationCases";
import CreateNewCase from "@/features/Client/NewCase/CreateNewCase";
import ReviewAndConfirm from "@/features/Client/Review&Confirm/ReviewAndConfirm";
import Dashboard from "@/features/Dashboard/Admin/Dashboard";
import BackendDashboard from "@/features/Dashboard/Backend/BackendDashboard";
import BackendCreateNewCase from "@/features/Backend/CaseFlow/BackendCreateNewCase";
import BackendReviewAndConfirm from "@/features/Backend/CaseFlow/BackendReviewAndConfirm";
import ClientDashboard from "@/features/Dashboard/Client/ClientDashboard";
import Profile from "@/features/Profile/Profile";
import AgentDashboard from "@/features/Dashboard/Agent/AgentDashboard";
import BranchList from "@/features/Client/BranchList/BranchList";
import UserList from "@/features/SuperAdmin/UserManagement/UserList";
import ClientList from "@/features/SuperAdmin/ClientManagement/ClientList";
import AgentReviewAndConfirm from "@/features/CaseManagement/role-specific/Agent/AgentReviewAndConfirm";
import QCDashboard from "@/features/Dashboard/QC/QCDashboard";
import QcReviewAndConfirm from "@/features/CaseManagement/role-specific/Qc/QcReviewAndConfirm";

export const COMPONENTS = {
  Dashboard,
  SignUp,
  Login,
  ForgotPassword,
  ResetPassword,
  ResendVerificationEmail,
  SendVerificationMail,
  UpdateEmail,
  VerifyEmail,
  ClientDashboard,
  BackendDashboard,
  AgentDashboard,
  BackendCreateNewCase,
  BackendReviewAndConfirm,
  VerificationCases,
  CreateNewCase,
  ReviewAndConfirm,
  Profile,
  AgentReviewAndConfirm,
  BranchList,
  UserList,
  ClientList,
  QCDashboard,
  QcReviewAndConfirm,
};
