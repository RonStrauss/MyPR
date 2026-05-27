import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import styles from "./GlobalModal.module.css";

type Props = {
  content: ReactNode | null;
  onClose: () => void;
  closeOnBack?: boolean;
  blockScroll?: boolean;
};

const MODAL_BACK_STATE_KEY = "__myprModalBack";

function lockScroll() {
  const scrollY = window.scrollY;
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";
  return scrollY;
}

function unlockScroll(scrollY: number) {
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
  window.scrollTo(0, scrollY);
}

export function GlobalModal({
  content,
  onClose,
  closeOnBack = false,
  blockScroll = true,
}: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!content) return;
    let closedByBack = false;
    const backStateId = Date.now();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    function onPopState() {
      closedByBack = true;
      onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    if (closeOnBack) {
      window.history.pushState(
        { [MODAL_BACK_STATE_KEY]: true, id: backStateId },
        ""
      );
      window.addEventListener("popstate", onPopState);
    }

    const lockedScrollY = blockScroll ? lockScroll() : null;

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (closeOnBack) {
        window.removeEventListener("popstate", onPopState);
        const state = window.history.state as
          | { [MODAL_BACK_STATE_KEY]?: boolean; id?: number }
          | null;
        if (
          !closedByBack &&
          state?.[MODAL_BACK_STATE_KEY] === true &&
          state.id === backStateId
        ) {
          window.history.back();
        }
      }
      if (blockScroll && lockedScrollY !== null) {
        unlockScroll(lockedScrollY);
      }
    };
  }, [blockScroll, closeOnBack, content, onClose]);

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
