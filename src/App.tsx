import { Navigate, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader } from "@/components/Loader/Loader";
import { AuthLayout, Layout } from "@/components/Layout/Layout";
import { AddPrPage } from "@/pages/Add/AddPrPage";
import { WorkoutPickerPage } from "@/pages/Add/WorkoutPickerPage";
import { AuthPage } from "@/pages/Auth/AuthPage";
import { HomePage } from "@/pages/Home/HomePage";
import { useAuth } from "@/contexts/AuthContext";

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
        <Route path="add" element={<WorkoutPickerPage />} />
        <Route path="add/:exercise" element={<AddPrPage />} />
      </Route>
      <Route path="/auth" element={<Navigate to="/" replace />} />
      <Route path="/settings" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
