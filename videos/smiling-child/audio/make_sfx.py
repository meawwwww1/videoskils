"""Synthesize the football sound design from audio/events.json (exported from the
choreography, so every kick lands on its frame). No samples, no TTS.

usage: python make_sfx.py events.json out.wav
"""
import json
import sys
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
rng = np.random.default_rng(7)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, hi, order=2):
    return sosfilt(butter(order, hi, btype="low", fs=SR, output="sos"), x)


def hp(x, lo, order=2):
    return sosfilt(butter(order, lo, btype="high", fs=SR, output="sos"), x)


def mixp(*xs):
    """Sum signals of different lengths (zero-padded)."""
    out = np.zeros(max(len(x) for x in xs))
    for x in xs:
        out[: len(x)] += x
    return out


def noise(sec):
    return rng.standard_normal(int(sec * SR))


def env(n, attack, decay):
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-np.maximum(t - attack, 0) / decay)


def sweep(f0, f1, sec, decay):
    n = int(sec * SR)
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t / (sec / 4))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, decay)


def thump(f0=180, f1=70, sec=0.18, decay=0.05, click=0.3):
    s = sweep(f0, f1, sec, decay)
    c = lp(noise(sec), 3000) * env(len(s), 0.0005, 0.008) * click
    return s + c


def whistle(sec=0.4):
    n = int(sec * SR)
    t = np.arange(n) / SR
    trill = 1 + 0.025 * np.sin(2 * np.pi * 28 * t)
    s = np.sin(2 * np.pi * np.cumsum(2950 * trill) / SR) + 0.4 * np.sin(2 * np.pi * np.cumsum(3150 * trill) / SR)
    e = np.clip(t / 0.02, 0, 1) * np.clip((sec - t) / 0.05, 0, 1)
    return s * e * 0.35


def make(events_path, out_path):
    data = json.load(open(events_path))
    fps, dur = data["fps"], data["duration"] / data["fps"]
    N = int(dur * SR) + SR
    dry = np.zeros((2, N))
    wet = np.zeros((2, N))  # reverb send (stadium)

    def put(sig, sec, gain=1.0, pan=0.0, send=0.3):
        i = int(sec * SR)
        if i >= N:
            return
        sig = sig[: N - i] * gain
        l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
        dry[0, i : i + len(sig)] += sig * l
        dry[1, i : i + len(sig)] += sig * r
        wet[0, i : i + len(sig)] += sig * l * send
        wet[1, i : i + len(sig)] += sig * r * send

    t = np.arange(N) / SR
    # excitement curve → crowd level
    ex_f = np.array([e[0] for e in data["excitement"]]) / fps
    ex_v = np.array([e[1] for e in data["excitement"]])
    ex = np.interp(t, ex_f, ex_v)
    world = np.clip((t - 575 / fps) / (65 / fps), 0, 1)

    # street ambience: wind + distant hum, fades out as the stadium appears
    wind = lp(np.cumsum(rng.standard_normal(N)) * 0.02, 400)
    wind = wind / (np.abs(wind).max() + 1e-9)
    amb = (wind * 0.09 + bp(noise(N / SR), 90, 160) * 0.01) * (1 - world)
    dry += amb

    # stadium crowd bed (stereo decorrelated, slow swells)
    for ch in range(2):
        bed = bp(noise(N / SR), 250, 2600, 3) + 0.5 * bp(noise(N / SR), 600, 1400, 2)
        swell = 1 + 0.25 * np.sin(2 * np.pi * 0.17 * t + ch) + 0.15 * np.sin(2 * np.pi * 0.41 * t + 2 * ch)
        bed = bed / (np.abs(bed).max() + 1e-9)
        level = world * (0.06 + 0.6 * ex)
        # breath held during the slow-motion bicycle kick
        hold = 1 - 0.65 * np.clip((t - 745 / fps) / 0.4, 0, 1) * np.clip((806 / fps - t) / 0.1, 0, 1)
        dry[ch] += bed * swell * level * hold

    # rhythmic stadium clapping during the build-up (645–745)
    beat = 0.48
    s = 650 / fps
    while s < 742 / fps:
        for k in range(3):
            c = bp(noise(0.06), 900, 3200) * env(int(0.06 * SR), 0.001, 0.015)
            put(c, s + rng.uniform(0, 0.03), 0.35, pan=rng.uniform(-0.8, 0.8), send=0.8)
        s += beat

    for e in data["events"]:
        sec = e["f"] / fps
        typ = e["type"]
        stadium = sec > 600 / fps
        send = 0.45 if stadium else 0.12
        if typ == "tap":
            put(thump(150, 80, 0.12, 0.03, 0.25), sec, 0.35, send=send)
        elif typ == "touch":
            put(thump(170, 75, 0.16, 0.045, 0.3), sec, 0.55, send=send)
        elif typ == "header":
            put(thump(260, 130, 0.16, 0.04, 0.4), sec, 0.55, send=send)
        elif typ == "chest":
            put(lp(thump(120, 60, 0.2, 0.06, 0.6), 900), sec, 0.7, send=send)
        elif typ == "kick":
            put(thump(200, 60, 0.25, 0.07, 0.5), sec, 0.85, send=send)
            put(bp(noise(0.35), 400, 3000) * env(int(0.35 * SR), 0.05, 0.08), sec + 0.02, 0.12, send=send)
        elif typ == "bigkick":
            boom = mixp(sweep(110, 38, 0.9, 0.25), 0.6 * sweep(220, 70, 0.4, 0.06),
                        lp(noise(0.9), 2500) * env(int(0.9 * SR), 0.001, 0.03) * 0.8)
            put(boom, sec, 1.25, send=0.6)
            whoosh = bp(noise(0.55), 300, 5000) * env(int(0.55 * SR), 0.12, 0.15)
            put(whoosh, sec + 0.03, 0.35, pan=0.5, send=0.4)
        elif typ == "net":
            n = int(0.5 * SR)
            rattle = hp(noise(0.5), 1500) * env(n, 0.003, 0.12) * (1 + 0.6 * np.sin(2 * np.pi * 34 * np.arange(n) / SR))
            put(rattle, sec, 0.45, pan=0.7, send=0.5)  # + body thump below
            put(thump(140, 60, 0.3, 0.08, 0.6), sec, 0.6, pan=0.7, send=0.5)
        elif typ == "roar":
            n = int(9 * SR)
            tt = np.arange(n) / SR
            shape = np.clip(tt / 0.35, 0, 1) * (0.55 + 0.45 * np.exp(-tt / 2.2))
            for ch, pan in ((0, -0.6), (1, 0.6)):
                r = bp(noise(9), 220, 3200, 3) + 0.6 * bp(noise(9), 900, 2400, 2) + 0.25 * bp(noise(9), 2500, 6000, 2)
                r = r / np.abs(r).max()
                put(r * shape, sec, 1.7, pan=pan, send=0.6)
        elif typ == "whistle":
            put(whistle(0.18), sec, 0.9, send=send)
            put(whistle(0.55), sec + 0.28, 0.9, send=send)
        elif typ == "riser":
            sec_len = 2.6
            n = int(sec_len * SR)
            tt = np.arange(n) / SR
            nz = noise(sec_len)
            out = np.zeros(n)
            for i0 in range(0, n, 2400):  # stepped band-pass sweep upward
                frac = i0 / n
                lo = 150 + frac * 2500
                seg = bp(nz[i0 : i0 + 2400 + 400], lo, lo * 2.2)[:2400]
                out[i0 : i0 + len(seg)] += seg
            tone = np.sin(2 * np.pi * np.cumsum(90 + 600 * (tt / sec_len) ** 2) / SR) * 0.3
            put((out + tone) * (tt / sec_len) ** 2, sec, 0.55, send=0.5)
        elif typ == "flood":
            clunk = thump(70, 40, 0.6, 0.15, 0.8)
            clunk[: int(0.08 * SR)] += hp(noise(0.08), 2000) * env(int(0.08 * SR), 0.001, 0.01) * 0.5
            put(clunk, sec, 0.55, pan=[-0.7, 0.7, 0.0][int(e["f"]) % 3], send=0.9)
        elif typ == "heartbeat":
            hb = sweep(70, 45, 0.14, 0.05)
            put(lp(hb, 200), sec, 1.0, send=0.1)
            put(lp(hb, 200), sec + 0.22, 0.7, send=0.1)
        elif typ == "clap":
            c = bp(noise(0.05), 1000, 3500) * env(int(0.05 * SR), 0.001, 0.012)
            put(c, sec, 0.3 * e.get("gain", 1), pan=rng.uniform(-0.5, 0.5), send=send)
        elif typ == "thud":
            put(lp(thump(110, 55, 0.25, 0.07, 0.7), 1200), sec, 0.8, send=0.3)

    # stadium reverb (exponential-decay noise impulse)
    irn = int(1.4 * SR)
    ir = rng.standard_normal((2, irn)) * np.exp(-np.arange(irn) / SR / 0.35)
    ir /= np.sqrt((ir**2).sum(axis=1, keepdims=True))
    rev = np.stack([fftconvolve(wet[c], ir[c])[:N] for c in range(2)])
    mix = dry + rev * 0.5
    mix = mix[:, : int(dur * SR)]
    # fade in / out
    fi, fo = int(0.4 * SR), int(0.7 * SR)
    mix[:, :fi] *= np.linspace(0, 1, fi)
    mix[:, -fo:] *= np.linspace(1, 0, fo)
    mix /= np.abs(mix).max() / 0.9
    pcm = (mix.T * 32767).astype(np.int16)
    with wave.open(out_path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"{out_path}: {dur:.2f}s")


if __name__ == "__main__":
    make(sys.argv[1], sys.argv[2])
