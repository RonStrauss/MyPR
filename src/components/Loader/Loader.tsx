import styles from "./Loader.module.css";

type Props = {
  label?: string;
  inline?: boolean;
};

export function Loader({ label, inline }: Props) {
  return (
    <div
      className={`${styles.loader} ${inline ? styles.inline : ""}`}
      role="status"
      aria-live="polite"
    >
      <span className={styles.spinner} aria-hidden />
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
}
