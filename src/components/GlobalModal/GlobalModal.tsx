import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import styles from "./GlobalModal.module.css";

type Props = {
  content: ReactNode | null;
  onClose: () => void;
};

export function GlobalModal({ content, onClose }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!content) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [content, onClose]);

  if (!content) return null;

  return (
    <div className={styles.backdrop} onClick={onClose} role="presentation">
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.body}>{content}</div>
        <button
          type="button"
          className={styles.dismiss}
          onClick={onClose}
          aria-label={t("common.close")}
        />
      </div>
    </div>
  );
}
