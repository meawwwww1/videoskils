"""Manim starter: a math explainer that works in any aspect ratio and language.

Render (from this folder):
  manim -qh scene.py Explainer                        # 1920x1080 30fps (16:9)
  manim -qh -r 1080,1920 scene.py Explainer           # 9:16 vertical (width,height)
  manim -ql scene.py Explainer                        # fast draft 854x480 15fps
  manim -qh -t --format=mov scene.py Explainer        # transparent, for Remotion compositing
Output: media/videos/scene/<quality>/Explainer.mp4
"""
from manim import *

# ---- Theme (fill from the brief; see remotion-video/references/style-presets.md)
BG = "#0f172a"
FG = "#f8fafc"
ACCENT = "#38bdf8"
ACCENT2 = "#f472b6"
MUTED = "#94a3b8"

# Font for non-Latin text. Text() uses Pango, which shapes Hebrew/Arabic RTL
# correctly. MathTex is LaTeX: keep it for math only, never for Hebrew/Arabic words.
FONT = "Noto Sans Hebrew"  # Arabic: "Noto Sans Arabic", Japanese: "Noto Sans CJK JP", Latin: "Inter"

config.background_color = BG
config.frame_rate = 30  # -qh defaults to 60fps; social/web delivery wants 30

# Manim keeps a 14.2 x 8 unit frame even when you pass -r 1080,1920, which squashes
# everything into a tiny band. Re-derive the frame from the pixel aspect ratio:
# portrait gets an 8-unit-wide, ~14.2-unit-tall frame.
if config.pixel_height > config.pixel_width:
    config.frame_width = 8.0
    config.frame_height = 8.0 * config.pixel_height / config.pixel_width


def fit_width(mob, frac=0.86):
    """Scale a mobject down so it fits the frame width — vital for 9:16."""
    max_w = config.frame_width * frac
    if mob.width > max_w:
        mob.scale_to_fit_width(max_w)
    return mob


class Explainer(Scene):
    def construct(self):
        portrait = config.frame_height > config.frame_width

        # 1. Title (Pango text, RTL-safe)
        title = fit_width(Text("משפט פיתגורס", font=FONT, weight=BOLD, color=FG).scale(1.1))
        title.to_edge(UP, buff=1.2 if portrait else 0.6)
        self.play(Write(title), run_time=1.2)

        # 2. Right triangle with labelled sides
        a, b = 3, 4
        tri = Polygon(ORIGIN, RIGHT * b, RIGHT * b + UP * a, color=ACCENT, stroke_width=6)
        tri.set_fill(ACCENT, opacity=0.15).move_to(ORIGIN)
        if portrait:
            tri.scale(0.8)
        right_angle = RightAngle(
            Line(tri.get_vertices()[1], tri.get_vertices()[0]),
            Line(tri.get_vertices()[1], tri.get_vertices()[2]),
            length=0.35, color=MUTED,
        )
        la = MathTex("a", color=FG).next_to(Line(tri.get_vertices()[1], tri.get_vertices()[2]), RIGHT)
        lb = MathTex("b", color=FG).next_to(Line(tri.get_vertices()[0], tri.get_vertices()[1]), DOWN)
        lc = MathTex("c", color=ACCENT2).move_to(
            Line(tri.get_vertices()[0], tri.get_vertices()[2]).get_center() + UL * 0.35
        )
        self.play(Create(tri), run_time=1.2)
        self.play(Create(right_angle), FadeIn(la, lb, lc, shift=UP * 0.2))
        self.wait(0.5)

        # 3. Equation, then morph to the numeric case
        eq = MathTex("a^2", "+", "b^2", "=", "c^2", color=FG).scale(1.6)
        eq[4].set_color(ACCENT2)
        eq.next_to(tri, DOWN, buff=0.8)
        self.play(Write(eq))
        self.wait(0.8)
        num = MathTex("3^2", "+", "4^2", "=", "5^2", color=FG).scale(1.6).move_to(eq)
        num[4].set_color(ACCENT2)
        self.play(TransformMatchingTex(eq, num))
        self.play(Indicate(num[4], color=ACCENT2))
        self.wait(1.0)

        # 4. Outro: clear and hold the takeaway
        take = fit_width(Text("9 + 16 = 25", font=FONT, weight=BOLD, color=ACCENT).scale(1.4))
        self.play(FadeOut(VGroup(tri, right_angle, la, lb, lc)), ReplacementTransform(num, take))
        self.play(take.animate.move_to(ORIGIN))
        self.wait(1.5)
