/** Store ligero de selección en lote: el checkbox no re-renderiza toda la tabla. */

type Listener = () => void;

function createBatchSelectionStore() {
  let selected = new Set<string>();
  const listeners = new Set<Listener>();
  let version = 0;

  const emit = () => {
    version += 1;
    for (const listener of listeners) listener();
  };

  return {
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getVersion() {
      return version;
    },
    getSelectedIds() {
      return selected;
    },
    isSelected(id: string) {
      return selected.has(id);
    },
    getSize() {
      return selected.size;
    },
    clear() {
      if (selected.size === 0) return;
      selected = new Set();
      emit();
    },
    setMany(ids: string[], checked: boolean) {
      const next = new Set(selected);
      let changed = false;
      for (const id of ids) {
        if (checked) {
          if (!next.has(id)) {
            next.add(id);
            changed = true;
          }
        } else if (next.has(id)) {
          next.delete(id);
          changed = true;
        }
      }
      if (!changed) return;
      selected = next;
      emit();
    },
    setSelected(id: string, checked: boolean) {
      if (checked === selected.has(id)) return;
      const next = new Set(selected);
      if (checked) next.add(id);
      else next.delete(id);
      selected = next;
      emit();
    },
  };
}

export type AdminInventarioBatchSelectionStore = ReturnType<typeof createBatchSelectionStore>;

export function createAdminInventarioBatchSelectionStore(): AdminInventarioBatchSelectionStore {
  return createBatchSelectionStore();
}
