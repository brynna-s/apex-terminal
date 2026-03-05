import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useApexStore } from "@/stores/useApexStore";

const BASE_INTERVAL_MS = 150; // ms per epoch at 1x speed

export function useReplayTick() {
  const accumulator = useRef(0);

  useFrame((_, delta) => {
    const state = useApexStore.getState();
    if (!state.replayActive || !state.replayPlaying) {
      accumulator.current = 0;
      return;
    }

    const epochs =
      state.activeTimeline === "baseline"
        ? state.baselineEpochs
        : state.interventionEpochs;
    const maxEpoch = epochs.length - 1;
    if (maxEpoch <= 0) return;

    accumulator.current += delta * 1000; // convert to ms
    const interval = BASE_INTERVAL_MS / state.replaySpeed;

    if (accumulator.current >= interval) {
      accumulator.current -= interval;
      const nextEpoch = state.currentEpoch + 1;
      if (nextEpoch > maxEpoch) {
        // Auto-pause at end
        useApexStore.setState({ replayPlaying: false });
      } else {
        useApexStore.setState({ currentEpoch: nextEpoch });
      }
    }
  });
}
