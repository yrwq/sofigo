import { create } from 'zustand';

type UiState = {
  lastRouteId: string | null;
  setLastRoute: (id: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  lastRouteId: null,
  setLastRoute: (id) => set({ lastRouteId: id }),
}));
