import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { changeLanguage, type Lang } from "@/i18n";
import { isFirebaseConfigured } from "@/lib/firebase";
import styles from "./Settings.module.css";

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const currentLang = i18n.language as Lang;

  function selectLang(lang: Lang) {
    void changeLanguage(lang);
  }

  return (
    <div>
      <h1 className={styles.title}>{t("settings.title")}</h1>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("settings.language")}</h2>
        <div className={styles.langToggle}>
          <button
            type="button"
            className={`${styles.langBtn} ${currentLang === "he" ? styles.langBtnActive : ""}`}
            onClick={() => selectLang("he")}
          >
            {t("settings.hebrew")}
          </button>
          <button
            type="button"
            className={`${styles.langBtn} ${currentLang === "en" ? styles.langBtnActive : ""}`}
            onClick={() => selectLang("en")}
          >
            {t("settings.english")}
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("settings.account")}</h2>
        <div className="card">
          <p className={styles.userEmail}>{user?.email}</p>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: "100%", marginTop: "1rem" }}
            onClick={() => logout()}
          >
            {t("auth.signOut")}
          </button>
        </div>
      </section>

      {!isFirebaseConfigured && (
        <p className={styles.hint}>{t("settings.firebaseHint")}</p>
      )}
    </div>
  );
}
