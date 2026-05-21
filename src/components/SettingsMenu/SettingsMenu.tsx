import { Languages, LogOut, Settings } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { changeLanguage, type Lang } from "@/i18n";
import { isFirebaseConfigured } from "@/lib/firebase";
import styles from "./SettingsMenu.module.css";

export function SettingsMenu() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const currentLang = i18n.language as Lang;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function selectLang(lang: Lang) {
    void changeLanguage(lang);
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t("settings.title")}
      >
        <Settings size={22} />
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          <p className={styles.menuHeading}>
            <Languages size={14} />
            {t("settings.language")}
          </p>
          <div className={styles.langToggle}>
            <button
              type="button"
              role="menuitem"
              className={`${styles.langBtn} ${currentLang === "he" ? styles.langBtnActive : ""}`}
              onClick={() => selectLang("he")}
            >
              {t("settings.hebrew")}
            </button>
            <button
              type="button"
              role="menuitem"
              className={`${styles.langBtn} ${currentLang === "en" ? styles.langBtnActive : ""}`}
              onClick={() => selectLang("en")}
            >
              {t("settings.english")}
            </button>
          </div>

          <div className={styles.divider} />

          <p className={styles.menuHeading}>{t("settings.account")}</p>
          {user?.email && (
            <p className={styles.email}>{user.email}</p>
          )}
          <button
            type="button"
            role="menuitem"
            className={styles.signOutBtn}
            onClick={() => {
              setOpen(false);
              void logout();
            }}
          >
            <LogOut size={16} />
            {t("auth.signOut")}
          </button>

          {!isFirebaseConfigured && (
            <p className={styles.hint}>{t("settings.firebaseHint")}</p>
          )}
        </div>
      )}
    </div>
  );
}
