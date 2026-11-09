import { Route, Routes } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import RequirePermission from "./components/RequirePermission";
import DashboardPage from "./pages/DashboardPage";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyEditPage from "./pages/PropertyEditPage";
import BlogPage from "./pages/BlogPage";
import BlogEditPage from "./pages/BlogEditPage";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import InquiriesPage from "./pages/InquiriesPage";
import InspectionsPage from "./pages/InspectionsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import StaffPage from "./pages/StaffPage";
import StaffDetailPage from "./pages/StaffDetailPage";
import RolesPage from "./pages/RolesPage";
import ActivityPage from "./pages/ActivityPage";
import MediaPage from "./pages/MediaPage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import LoginPage from "./pages/LoginPage";

export default function AdminRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="properties" element={<RequirePermission module="properties"><PropertiesPage /></RequirePermission>} />
        <Route path="properties/new" element={<RequirePermission module="properties" action="create"><PropertyEditPage /></RequirePermission>} />
        <Route path="properties/:id" element={<RequirePermission module="properties"><PropertyEditPage /></RequirePermission>} />
        <Route path="blog" element={<RequirePermission module="blog"><BlogPage /></RequirePermission>} />
        <Route path="blog/new" element={<RequirePermission module="blog" action="create"><BlogEditPage /></RequirePermission>} />
        <Route path="blog/:id" element={<RequirePermission module="blog"><BlogEditPage /></RequirePermission>} />
        <Route path="clients" element={<RequirePermission module="clients"><ClientsPage /></RequirePermission>} />
        <Route path="clients/:id" element={<RequirePermission module="clients"><ClientDetailPage /></RequirePermission>} />
        <Route path="inquiries" element={<RequirePermission module="inquiries"><InquiriesPage /></RequirePermission>} />
        <Route path="inspections" element={<RequirePermission module="inspections"><InspectionsPage /></RequirePermission>} />
        <Route path="analytics" element={<RequirePermission module="analytics"><AnalyticsPage /></RequirePermission>} />
        <Route path="staff" element={<RequirePermission module="staff"><StaffPage /></RequirePermission>} />
        <Route path="staff/:id" element={<RequirePermission module="staff"><StaffDetailPage /></RequirePermission>} />
        <Route path="roles" element={<RequirePermission module="roles"><RolesPage /></RequirePermission>} />
        <Route path="activity" element={<RequirePermission module="activity"><ActivityPage /></RequirePermission>} />
        <Route path="media" element={<RequirePermission module="media"><MediaPage /></RequirePermission>} />
        <Route path="settings" element={<RequirePermission module="settings"><SettingsPage /></RequirePermission>} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>
    </Routes>
  );
}
