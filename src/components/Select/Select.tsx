import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "./Select.module.css";

/** Radix disallows empty string as item value */
const EMPTY_VALUE = "__empty__";

export type SelectOption = {
  value: string;
  label: string;
};

type Props = {
  id?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

function toRadixValue(value: string): string {
  return value === "" ? EMPTY_VALUE : value;
}

function fromRadixValue(value: string): string {
  return value === EMPTY_VALUE ? "" : value;
}

export function Select({
  id,
  value,
  onValueChange,
  options,
  placeholder,
  className,
  disabled,
}: Props) {
  const { i18n } = useTranslation();
  const dir = i18n.dir() as "ltr" | "rtl";
  const selected = options.find((o) => o.value === value);

  return (
    <SelectPrimitive.Root
      value={toRadixValue(value)}
      onValueChange={(v) => onValueChange(fromRadixValue(v))}
      disabled={disabled}
      dir={dir}
    >
      <SelectPrimitive.Trigger
        id={id}
        className={`${styles.trigger} ${className ?? ""}`.trim()}
      >
        <SelectPrimitive.Value placeholder={placeholder}>
          {selected?.label}
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon className={styles.icon}>
          <ChevronDown size={18} aria-hidden />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className={styles.content}
          position="popper"
          sideOffset={4}
          dir={dir}
        >
          <SelectPrimitive.Viewport className={styles.viewport}>
            {options.map((opt) => (
              <SelectPrimitive.Item
                key={toRadixValue(opt.value)}
                value={toRadixValue(opt.value)}
                className={styles.item}
              >
                <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className={styles.indicator}>
                  <Check size={14} aria-hidden />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
