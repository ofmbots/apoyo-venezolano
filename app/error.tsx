"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-950 p-8 text-center">
      <p className="text-sm font-mono text-red-400 break-all max-w-xl">
        {error?.message || "Error desconocido"}
      </p>
      <p className="text-xs text-slate-500 break-all max-w-xl">
        {error?.stack?.split("\n").slice(0, 3).join(" | ")}
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-lg bg-marca px-4 py-2 text-sm font-semibold text-slate-950"
      >
        Reintentar
      </button>
    </div>
  );
}
