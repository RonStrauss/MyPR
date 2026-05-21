import { TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader } from "@/components/Loader/Loader";
import { ProgressChart } from "@/components/ProgressChart/ProgressChart";
import { useAuth } from "@/contexts/AuthContext";
import { usePrs } from "@/hooks/usePrs";
import {
  EXERCISE_GROUPS,
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

  const exercises = useMemo(() => getExercisesWithData(records), [records]);
  const [selected, setSelected] = useState("");

  const activeExercise = selected || exercises[0] || "";
  const series = useMemo(
    () => getProgressSeries(records, activeExercise),
    [records, activeExercise]
  );
  const improvement = useMemo(() => getImprovement(series), [series]);
  const overview = useMemo(() => computeOverview(records), [records]);
  const groupStats = useMemo(
    () => EXERCISE_GROUPS.map((g) => computeGroupStats(records, g)),
    [records]
  );

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
              <span className={styles.statValue}>{overview.exerciseCount}</span>
              <span className={styles.statLabel}>
                {t("stats.exercises")}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>
                {overview.best1RmOverall ?? "—"}
              </span>
              <span className={styles.statLabel}>{t("stats.best1Rm")}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{overview.prsLast30Days}</span>
              <span className={styles.statLabel}>{t("stats.last30")}</span>
            </div>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t("stats.progress")}</h2>
            <select
              className={styles.select}
              value={activeExercise}
              onChange={(e) => setSelected(e.target.value)}
            >
              {exercises.map((ex) => (
                <option key={ex} value={ex}>
                  {ex}
                </option>
              ))}
            </select>
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
            <h2 className={styles.sectionTitle}>{t("stats.groupAverages")}</h2>
            <p className={styles.hint}>{t("stats.groupHint")}</p>
            <ul className={styles.groupList}>
              {groupStats.map((g) => (
                <li key={g.id} className={styles.groupCard}>
                  <div className={styles.groupTop}>
                    <span className={styles.groupName}>{t(g.labelKey)}</span>
                    <span className={styles.groupCount}>
                      {g.prCount} {t("stats.entries")}
                    </span>
                  </div>
                  {g.prCount === 0 ? (
                    <p className={styles.groupEmpty}>{t("stats.noGroupData")}</p>
                  ) : (
                    <div className={styles.groupMetrics}>
                      <div>
                        <span className={styles.metricLabel}>
                          {t("stats.avg1Rm")}
                        </span>
                        <span className={styles.metricValue}>
                          {g.avgEstimated1Rm} {t("units.kg")}
                        </span>
                      </div>
                      <div>
                        <span className={styles.metricLabel}>
                          {t("stats.avgWeight")}
                        </span>
                        <span className={styles.metricValue}>
                          {g.avgWeightKg} {t("units.kg")}
                        </span>
                      </div>
                      {g.bestExercise && g.best1Rm != null && (
                        <div className={styles.groupBest}>
                          {t("stats.groupBest", {
                            exercise: g.bestExercise,
                            weight: g.best1Rm,
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{t("stats.volume")}</h2>
            <p className={styles.volumeLine}>
              {t("stats.totalVolume", { volume: overview.totalVolume })}
            </p>
          </section>
        </>
      )}
    </div>
  );
}
