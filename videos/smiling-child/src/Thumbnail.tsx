import React from "react";
import { AbsoluteFill } from "remotion";
import { Background } from "./components/Background";
import { useLayout } from "./components/layout";
import { detectDir } from "./fonts";
import { makeTheme } from "./theme";
import { VideoProps } from "./Video";

// Static image layout (thumbnail / poster / post). No animation: everything is
// fully visible. Big, short text — a thumbnail must read at 160px wide.
export const Thumbnail: React.FC<VideoProps> = ({ lang, title, cta }) => {
  const theme = makeTheme(lang);
  const { u, safe } = useLayout();
  return (
    <AbsoluteFill>
      <Background theme={theme} />
      <AbsoluteFill
        dir={detectDir(title)}
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: `${safe.top}px ${safe.x}px`,
          gap: u(40),
          fontFamily: theme.font,
          fontWeight: theme.weightHeavy,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: u(140), lineHeight: 1.05, color: theme.fg }}>{title}</div>
        <div
          style={{
            fontSize: u(64),
            color: theme.bg[0],
            background: theme.accent,
            padding: `${u(16)}px ${u(44)}px`,
            borderRadius: u(24),
          }}
        >
          {cta}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
