import { useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useTranslation } from "react-i18next";
import styles from "./UpdateBanner.module.css";

const UPDATE_TIMEOUT_MS = 10_000;

export function UpdateBanner() {
  const { t } = useTranslation();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();
  const [updating, setUpdating] = useState(false);

  if (!needRefresh) return null;

  async function handleRefresh() {
    setUpdating(true);
    try {
      await Promise.race([
        updateServiceWorker(true),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), UPDATE_TIMEOUT_MS)
        ),
      ]);
    } catch {
      window.location.reload();
    }
  }

  return (
    <div className={styles.banner} role="alert">
      <p className={styles.text}>{t("pwa.updateMessage")}</p>
      <div className={styles.actions}>
        <button
          type="button"
          className={`btn btn-primary ${styles.refreshBtn}`}
          onClick={() => void handleRefresh()}
          disabled={updating}
        >
          {updating && <span className={styles.spinner} aria-hidden />}
          {updating ? t("pwa.updating") : t("pwa.refresh")}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setNeedRefresh(false)}
          disabled={updating}
        >
          {t("pwa.later")}
        </button>
      </div>
    </div>
  );
}
