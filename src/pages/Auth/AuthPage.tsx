import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import styles from "./Auth.module.css";

type Mode = "signIn" | "signUp";

export function AuthPage() {
  const { t } = useTranslation();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "signUp" && password !== confirm) {
      setError(t("errors.passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      if (mode === "signIn") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch {
      setError(t("errors.authFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      setError(t("errors.authFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>
          {mode === "signIn" ? t("auth.welcomeBack") : t("auth.createAccount")}
        </h1>
        <p className={styles.heroSubtitle}>{t("auth.subtitle")}</p>
      </div>

      {!isFirebaseConfigured && (
        <div className={styles.banner}>{t("errors.firebaseNotConfigured")}</div>
      )}

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${mode === "signIn" ? styles.tabActive : ""}`}
          onClick={() => setMode("signIn")}
        >
          {t("auth.signIn")}
        </button>
        <button
          type="button"
          className={`${styles.tab} ${mode === "signUp" ? styles.tabActive : ""}`}
          onClick={() => setMode("signUp")}
        >
          {t("auth.signUp")}
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="label" htmlFor="email">
            {t("auth.email")}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label className="label" htmlFor="password">
            {t("auth.password")}
          </label>
          <input
            id="password"
            type="password"
            autoComplete={
              mode === "signIn" ? "current-password" : "new-password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        {mode === "signUp" && (
          <div className="form-group">
            <label className="label" htmlFor="confirm">
              {t("auth.confirmPassword")}
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
            />
          </div>
        )}
        {error && <p className="error-text">{error}</p>}
        <button
          type="submit"
          className={`btn btn-primary ${styles.submit}`}
          disabled={loading}
        >
          {mode === "signIn" ? t("auth.signIn") : t("auth.signUp")}
        </button>
      </form>

      <div className={styles.divider}>או / or</div>

      <button
        type="button"
        className={styles.googleBtn}
        onClick={handleGoogle}
        disabled={loading}
      >
        <GoogleIcon />
        {t("auth.google")}
      </button>

      <p className={styles.switchMode}>
        {mode === "signIn" ? t("auth.noAccount") : t("auth.hasAccount")}
        <button
          type="button"
          onClick={() =>
            setMode(mode === "signIn" ? "signUp" : "signIn")
          }
        >
          {mode === "signIn" ? t("auth.signUp") : t("auth.signIn")}
        </button>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
