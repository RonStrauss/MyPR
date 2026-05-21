import { Navigate, Route, Routes } from "react-router-dom";
import { Loader } from "@/components/Loader/Loader";
import { AuthLayout, Layout } from "@/components/Layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { AddPrPage, HomePage } from "@/pages/Home/HomePage";
import { AuthPage } from "@/pages/Auth/AuthPage";
import { SettingsPage } from "@/pages/Settings/SettingsPage";
import { useTranslation } from "react-i18next";

function LoadingScreen() {
  const { t } = useTranslation();
  return <Loader label={t("common.loading")} />;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return (
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/auth" element={<AuthPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="add" element={<AddPrPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="/auth" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
