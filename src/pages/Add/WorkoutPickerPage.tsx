import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { Loader } from "@/components/Loader/Loader";
import { CUSTOM_EXERCISE, PRESET_EXERCISES } from "@/constants/exercises";
import { useAuth } from "@/contexts/AuthContext";
import { usePrs } from "@/hooks/usePrs";
import { buildOneRmMap } from "@/lib/oneRm";
import styles from "./WorkoutPicker.module.css";

function exercisePath(name: string) {
  return `/add/${encodeURIComponent(name)}`;
}

export function WorkoutPickerPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { records, loading, error } = usePrs(user?.uid);
  const navigate = useNavigate();
  const isRtl = i18n.dir() === "rtl";
  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  const oneRmByExercise = useMemo(() => buildOneRmMap(records), [records]);

  const customFromRecords = useMemo(() => {
    const presets = new Set<string>(PRESET_EXERCISES);
    const names = new Set<string>();
    for (const r of records) {
      if (!presets.has(r.exercise)) names.add(r.exercise);
    }
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [records]);

  const workouts = useMemo(
    () => [...PRESET_EXERCISES, ...customFromRecords],
    [customFromRecords]
  );

  return (
    <div>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate("/")}
          aria-label={t("pr.cancel")}
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className={styles.title}>{t("pr.pickWorkout")}</h1>
      </div>

      {loading && <Loader label={t("common.loading")} />}
      {error && !loading && <p className="error-text">{error}</p>}

      {!loading && (
        <ul className={styles.list}>
          {workouts.map((name, index) => {
            const oneRm = oneRmByExercise.get(name);
            return (
              <li
                key={name}
                className="list-item-enter"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <Link to={exercisePath(name)} className={styles.row}>
                  <span className={styles.name}>{name}</span>
                  <span className={styles.rm}>
                    {oneRm != null ? (
                      <>
                        <span className={styles.rmValue}>{oneRm}</span>
                        <span className={styles.rmUnit}>{t("units.kg")}</span>
                      </>
                    ) : (
                      <span className={styles.rmEmpty}>—</span>
                    )}
                  </span>
                  <Chevron className={styles.chevron} size={18} />
                </Link>
              </li>
            );
          })}
          <li className="list-item-enter">
            <Link
              to={exercisePath(CUSTOM_EXERCISE)}
              className={`${styles.row} ${styles.customRow}`}
            >
              <Plus size={18} className={styles.customIcon} />
              <span className={styles.name}>{t("pr.customExercise")}</span>
              <Chevron className={styles.chevron} size={18} />
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}
