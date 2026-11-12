import { useVideoConfig } from "remotion";

// Responsive helpers: design once, render in 9:16, 16:9 and 1:1.
// `u` = 1 unit = 1/1080 of the short side, so u(80) is ~80px on a 1080 frame.
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const short = Math.min(width, height);
  const u = (n: number) => (n * short) / 1080;
  const orientation =
    height > width * 1.2 ? "portrait" : width > height * 1.2 ? "landscape" : "square";
  // Safe zones: social apps cover the top ~12% and bottom ~20% of a 9:16 video
  // with UI. Keep text inside these padding values.
  const safe =
    orientation === "portrait"
      ? { top: height * 0.12, bottom: height * 0.2, x: width * 0.08 }
      : { top: height * 0.08, bottom: height * 0.08, x: width * 0.07 };
  return { width, height, u, orientation, safe } as const;
};
