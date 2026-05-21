import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { PrForm } from "@/components/PrForm/PrForm";
import { CUSTOM_EXERCISE } from "@/constants/exercises";
import { useAuth } from "@/contexts/AuthContext";
import { addPr } from "@/services/prService";
import type { PrInput } from "@/types/pr";

export function AddPrPage() {
  const { exercise: exerciseParam } = useParams<{ exercise: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const decoded = exerciseParam ? decodeURIComponent(exerciseParam) : "";
  const isCustom = decoded === CUSTOM_EXERCISE;
  const lockedExercise = isCustom ? undefined : decoded || undefined;

  if (!exerciseParam) {
    navigate("/add", { replace: true });
    return null;
  }

  async function handleSubmit(data: PrInput) {
    if (!user) return;
    await addPr(user.uid, data);
    navigate("/", { state: { celebrate: true } });
  }

  return (
    <PrForm
      lockedExercise={lockedExercise}
      allowCustomExercise={isCustom}
      onSubmit={handleSubmit}
      onCancel={() => navigate("/add")}
      title={isCustom ? t("pr.add") : decoded}
    />
  );
}
