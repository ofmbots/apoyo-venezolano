"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { eliminarCentro } from "@/app/admin/actions";

export function EliminarCentroBtn({ id, label }: { id: string; label?: string }) {
  return (
    <form
      action={eliminarCentro}
      onSubmit={(e) => {
        if (!confirm("¿Eliminar este centro? Esta acción no se puede deshacer."))
          e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className="border-red-500/30 text-red-400 hover:border-red-500/60 hover:text-red-300"
      >
        <Trash2 className="h-4 w-4" />
        {label && <span className="ml-1">{label}</span>}
      </Button>
    </form>
  );
}
