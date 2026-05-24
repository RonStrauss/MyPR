const CELEBRATIONS_KEY = "mypr-celebrations";

export function getCelebrationsEnabled(): boolean {
  return localStorage.getItem(CELEBRATIONS_KEY) !== "false";
}

export function setCelebrationsEnabled(enabled: boolean) {
  localStorage.setItem(CELEBRATIONS_KEY, enabled ? "true" : "false");
}
