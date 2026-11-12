import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Theme } from "../theme";

// Slowly drifting gradient with two soft light blobs. Never fully static,
// which keeps even "calm" videos alive.
export const Background: React.FC<{ theme: Theme }> = ({ theme }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width, height } = useVideoConfig();
  const t = frame / Math.max(1, durationInFrames);
  const angle = interpolate(t, [0, 1], [135, 200]);
  const bx = interpolate(t, [0, 1], [20, 70]);
  const by = interpolate(t, [0, 1], [30, 60]);
  const blob = Math.max(width, height) * 0.6;
  return (
    <AbsoluteFill
      style={{ background: `linear-gradient(${angle}deg, ${theme.bg[0]}, ${theme.bg[1]})` }}
    >
      <div
        style={{
          position: "absolute",
          left: `${bx}%`,
          top: `${by}%`,
          width: blob,
          height: blob,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: theme.accent,
          opacity: 0.18,
          filter: `blur(${blob / 4}px)`,
        }}
      />
    </AbsoluteFill>
  );
};
