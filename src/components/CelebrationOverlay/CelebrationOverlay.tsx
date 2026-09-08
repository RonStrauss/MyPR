import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./CelebrationOverlay.module.css";

type Props = {
  message: string;
  onDone: () => void;
};

const DURATION_MS = 3200;

export function CelebrationOverlay({ message, onDone }: Props) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(onDone, 400);
    }, DURATION_MS);
    return () => window.clearTimeout(t);
  }, [onDone]);

  // Portal to body so fixed positioning is not trapped by Layout's scroll
  // root or the page-enter transform (which would center the card mid-list).
  return createPortal(
    <div
      className={`${styles.overlay} ${visible ? styles.visible : styles.hide}`}
      role="dialog"
      aria-live="polite"
    >
      <div className={styles.confetti} aria-hidden>
        {Array.from({ length: 40 }, (_, i) => (
          <span
            key={i}
            className={styles.piece}
            style={
              {
                "--i": i,
                "--x": `${(i * 17) % 100}%`,
                "--delay": `${(i % 10) * 0.05}s`,
                "--hue": `${(i * 37) % 360}`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className={styles.card}>
        <p className={styles.emoji}>🏆</p>
        <p className={styles.message}>{message}</p>
      </div>
    </div>,
    document.body
  );
}
