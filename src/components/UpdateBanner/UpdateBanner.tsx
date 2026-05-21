import { useRegisterSW } from "virtual:pwa-register/react";
import { useTranslation } from "react-i18next";
import styles from "./UpdateBanner.module.css";

export function UpdateBanner() {
  const { t } = useTranslation();
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className={styles.banner} role="alert">
      <p className={styles.text}>{t("pwa.updateMessage")}</p>
      <div className={styles.actions}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => void updateServiceWorker(true)}
        >
          {t("pwa.refresh")}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setNeedRefresh(false)}
        >
          {t("pwa.later")}
        </button>
      </div>
    </div>
  );
}
