import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { Background } from "./components/Background";
import { Caption, Captions } from "./components/Captions";
import { KineticText } from "./components/KineticText";
import { useLayout } from "./components/layout";
import { isRtl, Lang } from "./fonts";
import { makeTheme, Theme } from "./theme";

// ---------------------------------------------------------------------------
// EDIT HERE: the whole video is driven by these props. Replace the example
// scenes with the storyboard. Each scene = one component + a duration.
// ---------------------------------------------------------------------------
export type VideoProps = {
  lang: Lang;
  title: string;
  points: string[];
  cta: string;
  captions: Caption[];
};

export const defaultProps: VideoProps = {
  lang: "he",
  title: "הכירו את Motion Studio",
  points: ["סרטונים מפרומפט", "עברית, English, عربي", "מוכן ל-Reels ול-YouTube"],
  cta: "בואו נתחיל",
  captions: [],
};

export const FPS = 30;
const SCENE = { intro: 75, point: 60, outro: 75 }; // frames
const T = 15; // transition frames (theme.transitionFrames)

export const durationFor = (p: VideoProps) =>
  SCENE.intro + p.points.length * SCENE.point + SCENE.outro - (p.points.length + 1) * T;

// --- Scenes ----------------------------------------------------------------
const Center: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { safe } = useLayout();
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: `${safe.top}px ${safe.x}px ${safe.bottom}px`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

const Intro: React.FC<{ title: string; theme: Theme }> = ({ title, theme }) => {
  const { u } = useLayout();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bar = spring({ frame: frame - 18, fps, config: { damping: 200 } });
  return (
    <Center>
      <KineticText text={title} theme={theme} size={u(120)} stagger={5} highlight={["Motion", "Studio"]} />
      <div
        style={{
          marginTop: u(36),
          height: u(10),
          width: u(260) * bar,
          borderRadius: u(10),
          background: theme.accent,
        }}
      />
    </Center>
  );
};

const Point: React.FC<{ text: string; index: number; theme: Theme }> = ({ text, index, theme }) => {
  const { u } = useLayout();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 12, mass: 0.6 } });
  return (
    <Center>
      <div
        style={{
          width: u(150),
          height: u(150),
          borderRadius: "50%",
          background: theme.accent,
          color: theme.bg[0],
          fontFamily: theme.font,
          fontWeight: theme.weightHeavy,
          fontSize: u(80),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${pop})`,
          marginBottom: u(48),
        }}
      >
        {index + 1}
      </div>
      <KineticText text={text} theme={theme} size={u(96)} delay={6} />
    </Center>
  );
};

const Outro: React.FC<{ cta: string; theme: Theme }> = ({ cta, theme }) => {
  const { u } = useLayout();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 14 } });
  const glow = interpolate(Math.sin(frame / 8), [-1, 1], [0.4, 1]);
  return (
    <Center>
      <div
        style={{
          fontFamily: theme.font,
          fontWeight: theme.weightHeavy,
          fontSize: u(100),
          color: theme.bg[0],
          background: theme.accent,
          padding: `${u(28)}px ${u(64)}px`,
          borderRadius: theme.radius * (u(100) / 100),
          transform: `scale(${p})`,
          boxShadow: `0 0 ${u(80) * glow}px ${theme.accent}`,
        }}
      >
        {cta}
      </div>
    </Center>
  );
};

// --- Composition -------------------------------------------------------------
export const Video: React.FC<VideoProps> = (props) => {
  const theme = makeTheme(props.lang);
  const rtl = isRtl(props.lang);
  // Slide direction follows reading direction: RTL content enters from the left.
  const dir = rtl ? "from-left" : "from-right";
  const timing = linearTiming({ durationInFrames: T });
  return (
    <AbsoluteFill>
      <Background theme={theme} />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={SCENE.intro}>
          <Intro title={props.title} theme={theme} />
        </TransitionSeries.Sequence>
        {props.points.map((pt, i) => (
          <React.Fragment key={i}>
            <TransitionSeries.Transition presentation={slide({ direction: dir })} timing={timing} />
            <TransitionSeries.Sequence durationInFrames={SCENE.point}>
              <Point text={pt} index={i} theme={theme} />
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}
        <TransitionSeries.Transition presentation={fade()} timing={timing} />
        <TransitionSeries.Sequence durationInFrames={SCENE.outro}>
          <Outro cta={props.cta} theme={theme} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Captions captions={props.captions} theme={theme} />
    </AbsoluteFill>
  );
};
