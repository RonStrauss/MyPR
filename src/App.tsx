import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader } from "@/components/Loader/Loader";
import { UpdateBanner } from "@/components/UpdateBanner/UpdateBanner";
import { AuthLayout, Layout } from "@/components/Layout/Layout";
import { useAuth } from "@/contexts/AuthContext";

const HomePage = lazy(() =>
  import("@/pages/Home/HomePage").then((m) => ({ default: m.HomePage }))
);
const WorkoutPickerPage = lazy(() =>
  import("@/pages/Add/WorkoutPickerPage").then((m) => ({
    default: m.WorkoutPickerPage,
  }))
);
const AddPrPage = lazy(() =>
  import("@/pages/Add/AddPrPage").then((m) => ({ default: m.AddPrPage }))
);
const StatisticsPage = lazy(() =>
  import("@/pages/Statistics/StatisticsPage").then((m) => ({
    default: m.StatisticsPage,
  }))
);
const AuthPage = lazy(() =>
  import("@/pages/Auth/AuthPage").then((m) => ({ default: m.AuthPage }))
);

function LoadingScreen() {
  const { t } = useTranslation();
  return <Loader label={t("common.loading")} />;
}

function PageFallback() {
  return (
    <div className="page-fallback" aria-hidden>
      <span className="page-fallback-spinner" />
    </div>
  );
}

export default function App() {
  const { user, loading } = useAuth();

  return (
    <>
      <UpdateBanner />
      {loading ? (
        <LoadingScreen />
      ) : !user ? (
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/auth" element={<AuthPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </Suspense>
      ) : (
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="add" element={<WorkoutPickerPage />} />
              <Route path="add/:exercise" element={<AddPrPage />} />
              <Route path="stats" element={<StatisticsPage />} />
            </Route>
            <Route path="/auth" element={<Navigate to="/" replace />} />
            <Route path="/settings" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      )}
    </>
  );
}
