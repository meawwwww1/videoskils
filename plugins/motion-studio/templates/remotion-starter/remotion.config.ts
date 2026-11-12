import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setPixelFormat("yuv420p");
Config.setCodec("h264");
Config.setCrf(18);
Config.setOverwriteOutput(true);
// Font rendering for complex scripts (Hebrew/Arabic/CJK) is handled by Chromium.
// If Remotion cannot download its own headless shell (offline sandbox), render with
// --browser-executable=/path/to/chromium (scripts/render_remotion.sh does this).
