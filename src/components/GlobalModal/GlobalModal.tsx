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
const SCROLL_ROOT_SELECTOR = "[data-scroll-root]";

type ScrollLock = {
  root: HTMLElement;
  scrollY: number;
};

function getScrollRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>(SCROLL_ROOT_SELECTOR);
}

function lockScroll(): ScrollLock {
  const scrollRoot = getScrollRoot();
  if (scrollRoot) {
    const scrollY = scrollRoot.scrollTop;
    scrollRoot.style.overflow = "hidden";
    return { root: scrollRoot, scrollY };
  }

  const scrollY = window.scrollY;
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";
  return { root: document.documentElement, scrollY };
}

function unlockScroll({ root, scrollY }: ScrollLock) {
  if (root.matches(SCROLL_ROOT_SELECTOR)) {
    root.style.overflow = "";
    root.scrollTop = scrollY;
    return;
  }

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
      window.history.pushState({ [MODAL_BACK_STATE_KEY]: true, id: backStateId }, "");
      window.addEventListener("popstate", onPopState);
    }

    const scrollLock = blockScroll ? lockScroll() : null;

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (closeOnBack) {
        window.removeEventListener("popstate", onPopState);
        const state = window.history.state as {
          [MODAL_BACK_STATE_KEY]?: boolean;
          id?: number;
        } | null;
        if (
          !closedByBack &&
          state?.[MODAL_BACK_STATE_KEY] === true &&
          state.id === backStateId
        ) {
          window.history.back();
        }
      }
      if (blockScroll && scrollLock) {
        unlockScroll(scrollLock);
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
