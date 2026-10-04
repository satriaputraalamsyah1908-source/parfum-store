"use client";

import Swal from "sweetalert2";

const toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2800,
  timerProgressBar: true,
});

export function toastSuccess(message: string) {
  void toast.fire({ icon: "success", title: message });
}

export function toastError(message: string) {
  void toast.fire({ icon: "error", title: message, timer: 4200 });
}

export async function confirmDialog(opts: {
  title: string;
  text?: string;
  confirmText?: string;
}): Promise<boolean> {
  const res = await Swal.fire({
    icon: "warning",
    title: opts.title,
    text: opts.text,
    showCancelButton: true,
    confirmButtonText: opts.confirmText ?? "Ya, lanjutkan",
    cancelButtonText: "Batal",
    confirmButtonColor: "#4f3a2a",
    cancelButtonColor: "#a8896b",
    reverseButtons: true,
  });
  return res.isConfirmed;
}
