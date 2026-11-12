import React from "react";
import { AbsoluteFill, random } from "remotion";

// Warm, cinematic golden-hour portrait of a smiling child. Pure SVG, 1080x1080 viewBox.
const SKIN = "#7b4a2d";
const SKIN_SHADOW = "#5a321c";
const SKIN_LIGHT = "#9a6240";
const RIM = "#ffc46b";
const HAIR = "#1c120d";

const bokeh = Array.from({ length: 22 }, (_, i) => ({
  x: random(`bx${i}`) * 1080,
  y: 120 + random(`by${i}`) * 620,
  r: 14 + random(`br${i}`) * 46,
  o: 0.12 + random(`bo${i}`) * 0.28,
  c: ["#ffd27a", "#ffb35c", "#ff9a52", "#fff1c2"][i % 4],
}));

// Coily hair: a dense ring of curls on the outer edge plus inner texture
const curls = [
  ...Array.from({ length: 70 }, (_, i) => {
    const a = Math.PI * (0.97 + (i / 69) * 1.06);
    return {
      x: 540 + Math.cos(a) * (180 + random(`ox${i}`) * 10),
      y: 430 + Math.sin(a) * (150 + random(`oy${i}`) * 10),
      r: 16 + random(`os${i}`) * 8,
      lit: Math.cos(a) > 0.3,
    };
  }),
  ...Array.from({ length: 120 }, (_, i) => {
    const a = Math.PI * (1.05 + random(`ia${i}`) * 0.9);
    const rr = random(`ir${i}`) * 0.85;
    return {
      x: 540 + Math.cos(a) * 170 * rr,
      y: 425 + Math.sin(a) * 135 * rr,
      r: 7 + random(`is${i}`) * 6,
      lit: false,
    };
  }),
];

export const Portrait: React.FC = () => (
  <AbsoluteFill>
    <svg viewBox="0 0 1080 1080" width="100%" height="100%">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b1d3a" />
          <stop offset="0.38" stopColor="#a8433a" />
          <stop offset="0.66" stopColor="#ee8a3c" />
          <stop offset="0.85" stopColor="#f9c869" />
        </linearGradient>
        <radialGradient id="sun" cx="0.68" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff4c9" stopOpacity="1" />
          <stop offset="0.25" stopColor="#ffd27a" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ff9a52" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="face" cx="0.62" cy="0.42" r="0.7">
          <stop offset="0" stopColor={SKIN_LIGHT} />
          <stop offset="0.55" stopColor={SKIN} />
          <stop offset="1" stopColor={SKIN_SHADOW} />
        </radialGradient>
        <linearGradient id="shirt" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f2b233" />
          <stop offset="1" stopColor="#d9762a" />
        </linearGradient>
        <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#1a0805" stopOpacity="0.65" />
        </radialGradient>
        <filter id="blur20"><feGaussianBlur stdDeviation="20" /></filter>
        <filter id="blur6"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id="blur3"><feGaussianBlur stdDeviation="3" /></filter>
        <linearGradient id="rimFade" gradientUnits="userSpaceOnUse" x1="590" y1="0" x2="700" y2="0">
          <stop offset="0" stopColor="#000" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <mask id="rimMask"><rect width="1080" height="1080" fill="url(#rimFade)" /></mask>
        <linearGradient id="hairFade" gradientUnits="userSpaceOnUse" x1="0" y1="430" x2="0" y2="490">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id="hairRimMask"><rect width="1080" height="1080" fill="url(#hairFade)" /></mask>
        <clipPath id="headClip"><ellipse cx="540" cy="530" rx="178" ry="212" /></clipPath>
      </defs>

      {/* Sky, sun, bokeh */}
      <rect width="1080" height="1080" fill="url(#sky)" />
      <circle cx="735" cy="470" r="520" fill="url(#sun)" />
      <g filter="url(#blur6)">
        {bokeh.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={b.r} fill={b.c} opacity={b.o} />
        ))}
      </g>
      {/* Distant hills, soft */}
      <path d="M0 800 C 180 740 330 770 480 745 C 650 715 820 760 1080 730 L1080 1080 L0 1080 Z" fill="#7a3530" opacity="0.55" filter="url(#blur3)" />
      <path d="M0 860 C 200 820 420 850 600 830 C 800 808 950 840 1080 820 L1080 1080 L0 1080 Z" fill="#4a1f26" opacity="0.7" />

      {/* Shoulders / shirt */}
      <path d="M215 1080 C 225 930 330 860 470 838 L 610 838 C 750 860 855 930 865 1080 Z" fill="url(#shirt)" />
      <path d="M215 1080 C 225 930 330 860 470 838 C 420 900 360 980 340 1080 Z" fill="#b5551f" opacity="0.35" />
      {/* Rim light on right shoulder */}
      <path d="M610 838 C 750 860 855 930 865 1080" stroke={RIM} strokeWidth="10" fill="none" opacity="0.8" filter="url(#blur3)" />

      {/* Neck */}
      <path d="M462 680 L 466 820 C 495 862 585 862 614 820 L 618 680 Z" fill={SKIN_SHADOW} />
      <path d="M590 690 L 614 690 L 612 820 C 600 835 590 840 580 842 Z" fill={SKIN} opacity="0.6" />
      <path d="M470 832 C 505 872 575 872 610 832 L 622 850 C 580 900 500 900 458 850 Z" fill="#2a8f86" />

      {/* Ears */}
      <ellipse cx="362" cy="548" rx="34" ry="50" fill={SKIN_SHADOW} />
      <ellipse cx="718" cy="548" rx="34" ry="50" fill={SKIN} />
      <ellipse cx="722" cy="548" rx="34" ry="50" fill="none" stroke={RIM} strokeWidth="6" opacity="0.8" filter="url(#blur3)" />

      {/* Head */}
      <ellipse cx="540" cy="530" rx="178" ry="212" fill="url(#face)" />
      {/* Shadow side + jaw shading */}
      <g clipPath="url(#headClip)">
        <ellipse cx="410" cy="560" rx="120" ry="240" fill={SKIN_SHADOW} opacity="0.45" filter="url(#blur20)" />
        <ellipse cx="540" cy="760" rx="200" ry="60" fill={SKIN_SHADOW} opacity="0.5" filter="url(#blur20)" />
      </g>
      {/* Rim light along the right edge of the face */}
      <g mask="url(#rimMask)">
        <ellipse cx="540" cy="530" rx="176" ry="210" fill="none" stroke={RIM} strokeWidth="8" opacity="0.9" filter="url(#blur3)" />
      </g>

      {/* Hair */}
      <path d="M362 515 C 335 380 420 280 540 278 C 660 280 745 380 718 515 C 705 455 675 420 640 408 C 600 396 480 396 440 408 C 405 420 375 455 362 515 Z" fill={HAIR} />
      {curls.map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={c.lit ? "#3a2416" : i >= 70 ? "#2a1a12" : HAIR} />
      ))}
      <g mask="url(#hairRimMask)"><g mask="url(#rimMask)">
        <ellipse cx="540" cy="430" rx="196" ry="164" fill="none" stroke={RIM} strokeWidth="9" opacity="0.75" filter="url(#blur3)" />
      </g></g>

      {/* Eyebrows */}
      <path d="M432 468 C 455 450 492 448 515 460" stroke={HAIR} strokeWidth="11" strokeLinecap="round" fill="none" />
      <path d="M565 460 C 588 448 625 450 648 468" stroke={HAIR} strokeWidth="11" strokeLinecap="round" fill="none" />

      {/* Eyes: smiling, slightly squinted by the cheeks */}
      {[475, 605].map((x) => (
        <g key={x}>
          <path d={`M${x - 36} 518 C ${x - 18} 494 ${x + 18} 494 ${x + 36} 518 C ${x + 18} 530 ${x - 18} 530 ${x - 36} 518 Z`} fill="#f6ebe0" />
          <clipPath id={`eye${x}`}>
            <path d={`M${x - 36} 518 C ${x - 18} 494 ${x + 18} 494 ${x + 36} 518 C ${x + 18} 530 ${x - 18} 530 ${x - 36} 518 Z`} />
          </clipPath>
          <g clipPath={`url(#eye${x})`}>
            <circle cx={x + 2} cy="514" r="17" fill="#3a1f12" />
            <circle cx={x + 2} cy="514" r="9" fill="#120905" />
            <circle cx={x + 8} cy="508" r="5" fill="#fff" />
          </g>
          {/* upper lid line + lashes */}
          <path d={`M${x - 38} 519 C ${x - 18} 492 ${x + 18} 492 ${x + 38} 519`} stroke="#1a0d07" strokeWidth="5" fill="none" strokeLinecap="round" />
          {/* smile crease under the eye */}
          <path d={`M${x - 30} 540 C ${x - 12} 550 ${x + 12} 550 ${x + 30} 540`} stroke={SKIN_SHADOW} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
        </g>
      ))}

      {/* Nose */}
      <path d="M530 540 C 526 575 512 592 506 606 C 518 622 562 622 574 606 C 568 592 554 575 550 540" fill={SKIN_SHADOW} opacity="0.35" />
      <ellipse cx="520" cy="606" rx="11" ry="7" fill="#3a1d10" opacity="0.7" />
      <ellipse cx="560" cy="606" rx="11" ry="7" fill="#3a1d10" opacity="0.7" />
      <ellipse cx="548" cy="588" rx="10" ry="6" fill={SKIN_LIGHT} opacity="0.7" />

      {/* Cheeks (warm, lifted by the smile) */}
      <ellipse cx="438" cy="585" rx="48" ry="34" fill="#b4553a" opacity="0.28" filter="url(#blur6)" />
      <ellipse cx="642" cy="585" rx="48" ry="34" fill="#c86a42" opacity="0.32" filter="url(#blur6)" />

      {/* Big smile */}
      <path d="M452 652 C 490 646 590 646 628 652 C 618 712 580 742 540 742 C 500 742 462 712 452 652 Z" fill="#3b1210" />
      <path d="M462 655 C 500 650 580 650 618 655 C 614 672 604 680 594 682 C 560 686 520 686 486 682 C 476 680 466 672 462 655 Z" fill="#fbf6ee" />
      <path d="M504 718 C 525 706 555 706 576 718 C 562 734 518 734 504 718 Z" fill="#c3504d" />
      {/* lips + smile lines */}
      <path d="M446 650 C 490 640 590 640 634 650" stroke="#4a2014" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M452 652 C 462 712 500 744 540 744 C 580 744 618 712 628 652" stroke="#6a3220" strokeWidth="8" fill="none" />
      <path d="M432 628 C 438 650 445 662 452 670" stroke={SKIN_SHADOW} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M648 628 C 642 650 635 662 628 670" stroke={SKIN_SHADOW} strokeWidth="5" fill="none" strokeLinecap="round" />

      {/* Warm haze + vignette + grain-like dust */}
      <rect width="1080" height="1080" fill="#ff9a40" opacity="0.07" />
      <rect width="1080" height="1080" fill="url(#vignette)" />
      {Array.from({ length: 60 }, (_, i) => (
        <circle key={i} cx={random(`dx${i}`) * 1080} cy={random(`dy${i}`) * 1080} r={1 + random(`dr${i}`) * 2.2} fill="#fff1c2" opacity={0.25 + random(`do${i}`) * 0.4} />
      ))}
    </svg>
  </AbsoluteFill>
);
