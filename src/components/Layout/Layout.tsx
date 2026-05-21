import { Dumbbell, List, Plus, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import styles from "./Layout.module.css";

export function Layout() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <img src="/dumbbell.svg" alt="" className={styles.logoIcon} />
          <span className={styles.logoText}>{t("app.name")}</span>
        </div>
      </header>

      <main className={styles.main}>
        <div key={location.pathname} className="page-enter">
          <Outlet />
        </div>
      </main>

      <nav className={styles.bottomNav}>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
          }
        >
          <List />
          <span>{t("nav.records")}</span>
        </NavLink>
        <NavLink
          to="/add"
          className={({ isActive }) =>
            `${styles.navItem} ${styles.navItemFab} ${isActive ? styles.navItemActive : ""}`
          }
        >
          <div className={styles.fab}>
            <Plus />
          </div>
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
          }
        >
          <Settings />
          <span>{t("nav.settings")}</span>
        </NavLink>
      </nav>
    </div>
  );
}

export function AuthLayout() {
  const { t } = useTranslation();

  return (
    <div className={styles.shell} style={{ paddingBottom: 0 }}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <Dumbbell className={styles.logoIcon} color="var(--accent)" />
          <span className={styles.logoText}>{t("app.name")}</span>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
