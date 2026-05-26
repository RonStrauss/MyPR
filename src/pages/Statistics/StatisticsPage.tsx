import { TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Select } from "@/components/Select/Select";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Loader } from "@/components/Loader/Loader";
import { ProgressChart } from "@/components/ProgressChart/ProgressChart";
import { useAuth } from "@/contexts/AuthContext";
import { usePrs } from "@/hooks/usePrs";
import {
  filtersForGroupBest,
  filtersForGroupList,
  homeNavState,
} from "@/lib/navigation";
import {
  EXERCISE_GROUPS,
  computeExerciseCoverage,
  computeGroupStats,
  computeOverview,
  getExercisesWithData,
  getImprovement,
  getProgressSeries,
} from "@/lib/statistics";
import styles from "./Statistics.module.css";

export function StatisticsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { records, loading, error } = usePrs(user?.uid);
  const navigate = useNavigate();

  const exercises = useMemo(() => getExercisesWithData(records), [records]);
  const [selected, setSelected] = useState("");

  const activeExercise = selected || exercises[0] || "";
  const exerciseSelectOptions = useMemo(
    () => exercises.map((ex) => ({ value: ex, label: ex })),
    [exercises]
  );
  const series = useMemo(
    () => getProgressSeries(records, activeExercise),
    [records, activeExercise]
  );
  const improvement = useMemo(() => getImprovement(series), [series]);
  const overview = useMemo(() => computeOverview(records), [records]);
  const coverage = useMemo(() => computeExerciseCoverage(records), [records]);
  const groupStats = useMemo(
    () => EXERCISE_GROUPS.map((g) => computeGroupStats(records, g)),
    [records]
  );

  function viewGroupList(groupId: string) {
    navigate("/", { state: homeNavState(filtersForGroupList(groupId)) });
  }

  function viewGroupBest(groupId: string, exercise: string) {
    navigate(
      "/",
      { state: homeNavState(filtersForGroupBest(groupId, exercise)) }
    );
  }

  return (
    <div>
      <h1 className={styles.title}>
        <TrendingUp size={28} />
        {t("stats.title")}
      </h1>

      {loading && <Loader label={t("common.loading")} />}
      {error && !loading && <p className="error-text">{error}</p>}

      {!loading && records.length === 0 && (
        <p className={styles.empty}>{t("stats.empty")}</p>
      )}

      {!loading && records.length > 0 && (
        <>
          <section className={styles.overview}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{overview.totalPrs}</span>
              <span className={styles.statLabel}>{t("stats.totalPrs")}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{overview.prsLast30Days}</span>
              <span className={styles.statLabel}>{t("stats.last30")}</span>
            </div>
            <div className={`${styles.statCard} ${styles.statCardCoverage}`}>
              <span className={styles.statValue}>{coverage.percent}%</span>
              <span className={styles.statSub}>
                {t("stats.coverageFraction", {
                  logged: coverage.loggedPresets,
                  total: coverage.total,
                })}
              </span>
              <span className={styles.statLabel}>{t("stats.coverage")}</span>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t("stats.progress")}</h2>
            <Select
              className={styles.select}
              value={activeExercise}
              onValueChange={setSelected}
              options={exerciseSelectOptions}
            />
            {improvement && (
              <p
                className={`${styles.improvement} ${improvement.delta >= 0 ? styles.up : styles.down}`}
              >
                {improvement.delta >= 0 ? "↑" : "↓"}{" "}
                {t("stats.improvement", {
                  delta: Math.abs(improvement.delta),
                  percent: Math.abs(improvement.percent),
                })}
              </p>
            )}
            <ProgressChart
              series={series}
              unitLabel={t("stats.chartUnit")}
              emptyLabel={t("stats.noDataForExercise")}
            />
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t("stats.groupBests")}</h2>
            <ul className={styles.groupList}>
              {groupStats.map((g) => {
                const best = g.best;
                return (
                  <li key={g.id} className={styles.groupCard}>
                    <div className={styles.groupTop}>
                      <span className={styles.groupName}>{t(g.labelKey)}</span>
                      <span className={styles.groupCount}>
                        {g.prCount} {t("stats.entries")}
                      </span>
                    </div>
                    {g.prCount === 0 ? (
                      <p className={styles.groupEmpty}>{t("stats.noGroupData")}</p>
                    ) : best ? (
                      <div className={styles.groupBody}>
                        <button
                          type="button"
                          className={styles.bestBtn}
                          onClick={() => viewGroupBest(g.id, best.exercise)}
                        >
                          <span className={styles.bestLabel}>
                            {t("stats.best")}
                          </span>
                          <span className={styles.bestExercise}>
                            {best.exercise}
                          </span>
                          <span className={styles.bestValue}>
                            {t("stats.bestLift", {
                              weight: best.weightKg,
                              reps: best.reps,
                            })}
                          </span>
                        </button>
                        <button
                          type="button"
                          className={`btn btn-secondary ${styles.listBtn}`}
                          onClick={() => viewGroupList(g.id)}
                        >
                          {t("stats.showList")}
                        </button>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
