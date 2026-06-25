#!/usr/bin/env python3
"""Generate CI-Audio-Enhancement-Overview.pdf from structured content."""

from fpdf import FPDF

ROOT = "/Users/robertrabinowitz/Developer/ci-audio-enhancement"
OUT = f"{ROOT}/CI-Audio-Enhancement-Overview.pdf"

BLUE = (11, 87, 164)
DARK = (26, 35, 50)
GRAY = (68, 80, 102)
LIGHT = (244, 248, 252)
GREEN = (19, 115, 51)


class OverviewPDF(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="in", format="Letter")
        self.set_auto_page_break(auto=False)
        self.set_margins(0.48, 0.42, 0.48)


def section_heading(pdf, title, x=None, width=None):
    pdf.ln(0.05)
    if x is not None:
        pdf.set_x(x)
    w = width or (pdf.w - pdf.l_margin - pdf.r_margin)
    pdf.set_font("Helvetica", "B", 7.6)
    pdf.set_text_color(*BLUE)
    pdf.cell(w, 0.14, title.upper(), new_x="LMARGIN", new_y="NEXT")
    y = pdf.get_y()
    x_start = x if x is not None else pdf.l_margin
    pdf.set_draw_color(216, 227, 240)
    pdf.line(x_start, y, x_start + w, y)
    pdf.ln(0.05)


def bullet_list(pdf, items, x, width):
    pdf.set_xy(x, pdf.get_y())
    pdf.set_font("Helvetica", "", 8)
    pdf.set_text_color(*DARK)
    for item in items:
        pdf.set_x(x)
        pdf.multi_cell(width, 0.125, f"-  {item}")
        pdf.ln(0.01)
    return pdf.get_y()


def two_column_section(pdf, left_title, left_items, right_title, right_items):
    col1, col2 = 0.48, 4.18
    width = 3.55
    y = pdf.get_y()
    pdf.set_xy(col1, y)
    section_heading(pdf, left_title, x=col1, width=width)
    y_left_end = bullet_list(pdf, left_items, col1, width)

    pdf.set_xy(col2, y)
    section_heading(pdf, right_title, x=col2, width=width)
    y_right_end = bullet_list(pdf, right_items, col2, width)

    pdf.set_y(max(y_left_end, y_right_end) + 0.04)


def comparison_table(pdf):
    section_heading(pdf, 'Why this is not "just EQ"')
    widths = [1.95, 1.45, 1.55, 1.55]
    headers = ["Capability", "Phone EQ", "CI companion app", "This approach"]
    pdf.set_font("Helvetica", "B", 7.1)
    pdf.set_fill_color(238, 244, 251)
    pdf.set_text_color(*BLUE)
    for header, width in zip(headers, widths):
        pdf.cell(width, 0.17, header, border=1, fill=True)
    pdf.ln()
    rows = [
        ("Harmonic regeneration", "-", "-", "Yes"),
        ("Frequency transposition", "-", "-", "Yes"),
        ("MAP / electrode-aware shaping", "-", "Partial", "Yes"),
        ("Vocoder-in-the-loop optimization", "-", "-", "Yes"),
        ("Music-specific mastering chain", "Generic", "Speech-first", "Yes"),
    ]
    pdf.set_font("Helvetica", "", 7.1)
    for index, row in enumerate(rows):
        fill = index % 2 == 0
        pdf.set_fill_color(250, 251, 253 if fill else 255)
        pdf.set_font("Helvetica", "B", 7.1)
        pdf.set_text_color(*DARK)
        pdf.cell(widths[0], 0.16, row[0], border=1, fill=True)
        pdf.set_font("Helvetica", "", 7.1)
        for value, width in zip(row[1:], widths[1:]):
            if value == "Yes":
                pdf.set_text_color(*GREEN)
                pdf.set_font("Helvetica", "B", 7.1)
            else:
                pdf.set_text_color(*GRAY)
                pdf.set_font("Helvetica", "", 7.1)
            pdf.cell(width, 0.16, value, border=1, fill=True)
        pdf.ln()
    pdf.ln(0.05)


def footer_block(pdf):
    y = pdf.get_y()
    pdf.set_draw_color(*BLUE)
    pdf.set_line_width(0.02)
    pdf.line(0.48, y, 8.02, y)
    pdf.ln(0.08)
    y = pdf.get_y()

    pdf.set_fill_color(*BLUE)
    pdf.rect(0.48, y, 4.05, 0.82, style="F")
    pdf.set_xy(0.56, y + 0.06)
    pdf.set_font("Helvetica", "B", 7.6)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(0, 0.12, "SUGGESTED NEXT STEPS", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 7.4)
    pdf.set_text_color(232, 241, 251)
    for step in [
        "Live demo - browser reference app; Speech vs Music presets; bypass on/off.",
        "Listener study - stream processed audio to implant users vs baseline.",
        "Partnership - port DSP to native apps; MAP import; clinical validation.",
    ]:
        pdf.set_x(0.6)
        pdf.multi_cell(3.8, 0.115, f"-  {step}")

    pdf.set_xy(4.65, y)
    pdf.set_font("Helvetica", "B", 7.1)
    pdf.set_text_color(*DARK)
    pdf.cell(0, 0.12, "Status and deployment", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 6.9)
    pdf.set_text_color(*GRAY)
    pdf.set_xy(4.65, y + 0.14)
    pdf.multi_cell(
        3.37,
        0.11,
        "Working proof-of-concept. Vocoder is an engineering surrogate - not a clinical claim. "
        "Deliverables: reference web demo, technical paper, MAP template, DSP spec, roadmap. "
        "Browser demo for evaluation; production as native module in manufacturer iOS/Android apps.",
    )


def main():
    pdf = OverviewPDF()
    pdf.add_page()

    pdf.set_font("Helvetica", "B", 15.5)
    pdf.set_text_color(*BLUE)
    pdf.cell(0, 0.24, "CI Audio Enhancement Engine", new_x="LMARGIN", new_y="NEXT")
    pdf.set_font("Helvetica", "", 8.4)
    pdf.set_text_color(*GRAY)
    pdf.multi_cell(
        0,
        0.13,
        "Music pre-processing upstream of the implant stream - designed for how CIs represent sound. "
        "The browser app is an evaluation demo; production would integrate into a manufacturer's native mobile app.",
    )
    pdf.ln(0.05)
    pdf.set_draw_color(*BLUE)
    pdf.set_line_width(0.025)
    pdf.line(0.48, pdf.get_y(), 8.02, pdf.get_y())
    pdf.ln(0.08)

    y = pdf.get_y()
    pdf.set_fill_color(*LIGHT)
    pdf.rect(0.48, y, 7.54, 0.42, style="F")
    pdf.set_fill_color(*BLUE)
    pdf.rect(0.48, y, 0.05, 0.42, style="F")
    pdf.set_xy(0.58, y + 0.05)
    pdf.set_font("Helvetica", "", 8.2)
    pdf.set_text_color(*DARK)
    pdf.multi_cell(
        7.3,
        0.125,
        "CI users report strong speech outcomes but poor music enjoyment. Phone EQ and companion apps optimize "
        "speech-in-noise - not upstream music mastering for envelope-based, channel-limited hearing. This engine "
        "provides purpose-built DSP, MAP-aware personalization, and research tooling. The value is the processing "
        "approach - not the web browser itself.",
    )
    pdf.set_y(y + 0.46)

    two_column_section(
        pdf,
        "The opportunity",
        [
            "Unmet need: Music via CIs often sounds weak, muddy, and rhythmically flat.",
            "Root cause: ~16-22 envelope channels - detail is lost before phone EQ helps.",
            "Positioning: Upstream of Bluetooth streaming; complements clinical MAP fitting.",
            "Privacy: All processing on-device; no audio uploaded.",
        ],
        "Demo today / product path",
        [
            "Today: Browser web app for demo, studies, and open review (Web Audio API).",
            "Production: Native iOS/Android module in the CI companion app.",
            "Where it runs: On the phone, upstream of wireless stream to processor.",
            "What transfers: Algorithms, presets, MAP mapping, auto-tune - not the browser.",
        ],
    )

    two_column_section(
        pdf,
        "What the demo shows today",
        [
            "MAP-aware shaping - 16-channel profiles, JSON import, dead-region redistribution.",
            "Multi-band compression - low / mid / high dynamics for CI range.",
            "Harmonic bass excitation - overtone correlates for envelope coding.",
            "High-frequency transposition - treble relocated to mid bands.",
            "CI Auto-Tune - 625 combinations scored via 16-channel vocoder surrogate (incl. transpose mix).",
            "Built-in demos - DSP Check engineering fixture + Music Eval stereo groove for music A/B.",
            "Playlist and session JSON - multi-track queue; full settings export/import.",
            "Speech/Music modes and stereo width - one-click presets; mono collapse default.",
            "Mobile PWA - collapsible panels, sticky transport, installable manifest.",
            "Presets and A/B - Classical, Rock, Jazz; bypass; WAV and optional vocoder export.",
        ],
        "Enhancement path",
        [
            "[High] Audiogram personalisation - per-channel gain, compression, clarity.",
            "[High] Per-band vocoder transposition - cleaner than ring mod on tonal music.",
            "[High] TFS encoder - AM sidebands at the fundamental for pitch cues.",
            "[Med] Live mic input - delivered: concerts, TV, conversation through the chain.",
            "[Med] Export processed WAV - delivered: pre-process a personal library.",
            "[Med] Session snapshot JSON - delivered: full settings export/import.",
            "[Med] Optimize on loop region - auto-tune selected passage only.",
            "[Med] Loudness-matched A/B - fair bypass comparison.",
            "[Low] Preset diff view - compare Speech vs Music sliders.",
            "[Low] Offline/live parity test - automated pipeline validation.",
        ],
    )

    comparison_table(pdf)
    footer_block(pdf)
    pdf.output(OUT)
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
