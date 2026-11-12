# Manim Community cheat sheet (v0.18+)

```python
from manim import *
```

## Mobjects

```python
# Shapes
Circle(radius=1, color=BLUE).set_fill(BLUE, opacity=0.3)
Square(side_length=2); Rectangle(width=4, height=2); RoundedRectangle(corner_radius=0.2, width=4, height=2)
Polygon(p1, p2, p3); RegularPolygon(n=6); Dot(point, radius=0.08); Line(a, b); DashedLine(a, b)
Arrow(a, b, buff=0); DoubleArrow(a, b); CurvedArrow(a, b, angle=-PI/2); Arc(radius=1, angle=PI/2)
Brace(mobj, direction=DOWN); BraceLabel(mobj, "n", brace_direction=DOWN)
SurroundingRectangle(mobj, color=YELLOW, buff=0.15); BackgroundRectangle(mobj, fill_opacity=0.8)

# Text
Text("Hello", font="Inter", weight=BOLD, font_size=48)          # any language via Pango
Text("שלום", font="Noto Sans Hebrew")                             # RTL shapes correctly
MarkupText('<span foreground="#38bdf8">key</span> idea')          # inline styling
MathTex(r"\int_0^1 x^2\,dx", "=", r"\frac{1}{3}")                 # formulas, split into parts
Tex(r"Area $= \pi r^2$")                                           # LaTeX text mode (Latin only)
Code(code_string="print('hi')", language="python")                 # syntax-highlighted code
                                                                   # (arg names changed across versions; check `help(Code)`)
# Coordinates & graphs
ax = Axes(x_range=[-3, 3, 1], y_range=[-1, 9, 2], x_length=7, y_length=5, tips=False,
          axis_config={"color": MUTED, "include_numbers": True})
graph = ax.plot(lambda x: x**2, color=ACCENT)
label = ax.get_graph_label(graph, MathTex("x^2"), x_val=2, direction=UR)
area = ax.get_area(graph, x_range=[0, 2], color=ACCENT, opacity=0.3)
dot = Dot(ax.c2p(1, 1))                                            # coords → point
NumberPlane(); NumberLine(x_range=[0, 10, 1], include_numbers=True)
BarChart(values=[3, 5, 2], bar_names=["A", "B", "C"], y_range=[0, 6, 1])
Matrix([[1, 2], [3, 4]]); IntegerTable([[1, 2], [3, 4]])

# Grouping & layout
g = VGroup(a, b, c).arrange(DOWN, buff=0.4, aligned_edge=LEFT)
VGroup(*items).arrange_in_grid(rows=2, cols=3, buff=0.5)
m.to_edge(UP, buff=0.5); m.to_corner(UL); m.next_to(other, RIGHT, buff=0.3); m.move_to(ORIGIN)
m.scale(1.5); m.scale_to_fit_width(6); m.shift(LEFT * 2); m.rotate(PI / 4)
```

## Animations

```python
self.play(Create(shape))                  # draw outline
self.play(Write(text_or_tex))             # handwriting
self.play(DrawBorderThenFill(shape))
self.play(FadeIn(m, shift=UP * 0.3), FadeOut(old, shift=DOWN * 0.3))
self.play(GrowFromCenter(m)); self.play(GrowArrow(arrow)); self.play(SpinInFromNothing(m))
self.play(Transform(a, b))                # a becomes b's shape (a stays on scene)
self.play(ReplacementTransform(a, b))     # a replaced by b (b on scene afterwards) — usually what you want
self.play(TransformMatchingTex(eq1, eq2)) # morph equations part-by-part
self.play(TransformMatchingShapes(a, b))  # morph text by matching glyphs
self.play(Indicate(m, color=YELLOW)); self.play(Circumscribe(m)); self.play(Flash(point)); self.play(Wiggle(m))
self.play(m.animate.shift(RIGHT).scale(0.5).set_color(RED), run_time=1.5, rate_func=smooth)
self.play(LaggedStart(*[FadeIn(x, shift=UP) for x in items], lag_ratio=0.15))
self.play(AnimationGroup(a1, a2, lag_ratio=0.5))
self.play(MoveAlongPath(dot, path), run_time=3, rate_func=linear)
self.wait(1)
```

Rate functions: `smooth` (default), `linear`, `there_and_back`, `rate_functions.ease_out_cubic`,
`rate_functions.ease_out_back` (bouncy), `rate_functions.ease_in_out_sine`.

## Live values (updaters)

```python
t = ValueTracker(0)
dot = always_redraw(lambda: Dot(ax.c2p(t.get_value(), f(t.get_value())), color=ACCENT))
num = always_redraw(lambda: DecimalNumber(t.get_value(), num_decimal_places=2).next_to(dot, UP))
self.add(dot, num)
self.play(t.animate.set_value(3), run_time=3)
```

## Camera

```python
class Zoom(MovingCameraScene):
    def construct(self):
        self.play(self.camera.frame.animate.scale(0.5).move_to(target))   # zoom in
        self.play(Restore(self.camera.frame))                              # after self.camera.frame.save_state()

class Space(ThreeDScene):
    def construct(self):
        self.set_camera_orientation(phi=70 * DEGREES, theta=-45 * DEGREES)
        axes = ThreeDAxes(); surf = Surface(lambda u, v: axes.c2p(u, v, np.sin(u) * np.cos(v)),
                                            u_range=[-3, 3], v_range=[-3, 3], resolution=24)
        self.add(axes, surf); self.begin_ambient_camera_rotation(rate=0.2); self.wait(4)
```

## Common errors

| error | fix |
|-------|-----|
| `LaTeX error converting to dvi` | bad LaTeX (escape `\` with raw strings `r"..."`), or LaTeX not installed → `/video-setup` |
| Hebrew/Arabic boxes or reversed in MathTex | use `Text(..., font=...)` for words |
| Everything tiny in 9:16 | keep the portrait frame fix from the template |
| `TransformMatchingTex` morphs oddly | split both equations into the same parts; use `key_map` for renamed parts |
| Object appears twice after Transform | use `ReplacementTransform`, or remove the source |
| Slow render | `-ql` while iterating; lower `resolution` on surfaces; avoid thousands of mobjects |
