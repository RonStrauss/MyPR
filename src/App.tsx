import { Navigate, Route, Routes } from "react-router-dom";
import { AuthLayout, Layout } from "@/components/Layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { AddPrPage, HomePage } from "@/pages/Home/HomePage";
import { AuthPage } from "@/pages/Auth/AuthPage";
import { SettingsPage } from "@/pages/Settings/SettingsPage";

function LoadingScreen() {
  return (
    <div
      style={{
        padding: "2rem",
        textAlign: "center",
        color: "var(--text-muted)",
      }}
    >
      ...
    </div>
  );
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
