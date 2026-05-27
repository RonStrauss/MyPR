import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { GlobalModal } from "@/components/GlobalModal/GlobalModal";

export type ModalOptions = {
  closeOnBack?: boolean;
  blockScroll?: boolean;
};

type ModalContextValue = {
  openModal: (content: ReactNode, options?: ModalOptions) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<{
    content: ReactNode;
    options: ModalOptions;
  } | null>(null);

  const closeModal = useCallback(() => setModal(null), []);
  const openModal = useCallback((content: ReactNode, options?: ModalOptions) => {
    setModal({ content, options: options ?? {} });
  }, []);

  const value = useMemo(() => ({ openModal, closeModal }), [openModal, closeModal]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      <GlobalModal
        content={modal?.content ?? null}
        onClose={closeModal}
        closeOnBack={modal?.options.closeOnBack !== false}
        blockScroll={modal?.options.blockScroll !== false}
      />
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within ModalProvider");
  return ctx;
}
