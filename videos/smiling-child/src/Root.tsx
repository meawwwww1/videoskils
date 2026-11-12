import React from "react";
import { Composition, Still } from "remotion";
import "./fonts";
import { Thumbnail } from "./Thumbnail";
import { Portrait } from "./Portrait";
import { defaultProps, durationFor, FPS, Video } from "./Video";

// One composition per output format. Same component, responsive layout.
// Render: npx remotion render src/index.ts Video-9x16 out/video_9x16.mp4
const FORMATS = [
  { id: "Video-9x16", width: 1080, height: 1920 },
  { id: "Video-16x9", width: 1920, height: 1080 },
  { id: "Video-1x1", width: 1080, height: 1080 },
] as const;

export const RemotionRoot: React.FC = () => (
  <>
    {FORMATS.map((f) => (
      <Composition
        key={f.id}
        id={f.id}
        component={Video}
        durationInFrames={durationFor(defaultProps)}
        fps={FPS}
        width={f.width}
        height={f.height}
        defaultProps={defaultProps}
        calculateMetadata={({ props }) => ({ durationInFrames: durationFor(props) })}
      />
    ))}
    {/* Stills: thumbnails, posters, social images. npx remotion still src/index.ts Thumb-16x9 out/thumb.png */}
    <Still id="Thumb-16x9" component={Thumbnail} width={1280} height={720} defaultProps={defaultProps} />
    <Still id="Poster-9x16" component={Thumbnail} width={1080} height={1920} defaultProps={defaultProps} />
    <Still id="Portrait-1x1" component={Portrait} width={1080} height={1080} />
    <Still id="Post-1x1" component={Thumbnail} width={1080} height={1080} defaultProps={defaultProps} />
  </>
);
