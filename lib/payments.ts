export type PaymentMethodKey = "CASH" | "QRIS" | "EWALLET" | "TRANSFER" | "DEBIT";

const banks = ["BCA", "Mandiri", "BNI", "BRI", "BSI", "CIMB Niaga", "Permata", "Bank Lainnya"];

export const paymentProviders: Record<PaymentMethodKey, string[]> = {
  CASH: [],
  QRIS: [],
  EWALLET: ["GoPay", "OVO", "DANA", "ShopeePay", "LinkAja", "Lainnya"],
  TRANSFER: banks,
  DEBIT: banks,
};

export const paymentMethodOptions: { value: PaymentMethodKey; label: string; providerLabel?: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "QRIS", label: "QRIS" },
  { value: "EWALLET", label: "E-Wallet", providerLabel: "Pilih e-wallet" },
  { value: "TRANSFER", label: "Transfer Bank", providerLabel: "Pilih bank" },
  { value: "DEBIT", label: "Kartu Debit", providerLabel: "Bank penerbit (opsional)" },
];

const fullLabels: Record<PaymentMethodKey, string> = {
  CASH: "Cash",
  QRIS: "QRIS",
  EWALLET: "E-Wallet",
  TRANSFER: "Transfer Bank",
  DEBIT: "Kartu Debit",
};

export function providerRequired(method: PaymentMethodKey): boolean {
  return method === "EWALLET" || method === "TRANSFER";
}

export function isValidProvider(method: PaymentMethodKey, provider?: string | null): boolean {
  if (!provider) return !providerRequired(method);
  return paymentProviders[method].includes(provider);
}

export function providerLabel(provider?: string | null): string {
  return provider ?? "";
}

export function paymentSummary(method: PaymentMethodKey, provider?: string | null): string {
  return provider ? `${fullLabels[method]} - ${provider}` : fullLabels[method];
}
