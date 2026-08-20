import { Document, Page, View, Text, Image, Font, StyleSheet } from "@react-pdf/renderer";

// ---------------------------------------------------------------------------
// FONTS
// ---------------------------------------------------------------------------
// @react-pdf/renderer can't read fonts from the browser/OS or from a Google
// Fonts <link> — it needs a direct .ttf/.woff file it can embed.
//
// Currently registered from real embedded files: Battambang (Khmer) and
// Inter (sans, used for orgName/orgTag/badge text).
//
// English/Latin serif text (title, subtitle, name, body, signatures) still
// uses react-pdf's BUILT-IN "Times-Roman" / "Times-Bold" — no file needed,
// works with zero setup. Note: react-pdf's built-in base-14 fonts have no
// real embedded metrics, so their line-height/leading is hardcoded and can
// make marginTop/marginBottom look like they're not applying on that text.
// If you want the real Times New Roman file registered as an embedded font
// (fixes that margin quirk, and is a closer visual match) — you'll need to
// source the .ttf yourself since Google doesn't host it (Microsoft/Monotype
// trademark). See the earlier conversation for how to add it.

import battambangRegular from "../assets/fonts/Battambang-Regular.ttf";
import battambangBold from "../assets/fonts/Battambang-Bold.ttf";
// Google's current Inter download splits by optical size instead of giving
// one plain Inter-Regular/Bold.ttf. Any of Inter_18pt / Inter_24pt /
// Inter_28pt look essentially identical at these font sizes — using 18pt.
import interRegular from "../assets/fonts/Inter_18pt-Regular.ttf";
import interBold from "../assets/fonts/Inter_18pt-Bold.ttf";

Font.register({
  family: "Battambang",
  fonts: [{ src: battambangRegular, fontWeight: 400 }],
});
Font.register({
  family: "BattambangBold",
  fonts: [{ src: battambangBold, fontWeight: 700 }],
});

Font.register({
  family: "Inter",
  fonts: [{ src: interRegular, fontWeight: 400 }],
});
Font.register({
  family: "InterBold",
  fonts: [{ src: interBold, fontWeight: 700 }],
});

// react-pdf auto-hyphenates long words by default (e.g. "commitment" was
// splitting into "com-" / "mitment" across lines) — something the browser
// preview never does, since it has no CSS `hyphens: auto` set. This turns
// hyphenation off so react-pdf only breaks between whole words, matching
// how the preview wraps text.
Font.registerHyphenationCallback((word) => [word]);

const SERIF_FONT = "Times-Roman";
const SERIF_FONT_BOLD = "Times-Bold";
const KHMER_FONT = "Battambang";
const KHMER_FONT_BOLD = "BattambangBold";
const SANS_FONT = "Inter";
const SANS_FONT_BOLD = "InterBold";

// ---------------------------------------------------------------------------
// LAYOUT
// ---------------------------------------------------------------------------
// The on-screen preview is designed at ~1000px card width, scaled up to a
// 1123x794pt page. Every size/spacing number below is the preview's design-px
// value run through s() so it stays visually identical to App.jsx.
const PAGE_WIDTH = 1123;
const PAGE_HEIGHT = 794;
const s = (px) => px * (PAGE_WIDTH / 1000);

const hasKhmer = (text = "") => /[\u1780-\u17FF]/.test(text);

// Turns "some **bold** text" into [{text, bold}] runs for inline styling.
function parseBold(raw) {
  const parts = raw.split(/(\*\*.+?\*\*)/g).filter(Boolean);
  return parts.map((part) => {
    const bold = part.startsWith("**") && part.endsWith("**");
    return { text: bold ? part.slice(2, -2) : part, bold };
  });
}

const styles = StyleSheet.create({
  page: {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    backgroundColor: "#ffffff",
    position: "relative",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    objectFit: "cover",
  },
  content: {
    position: "relative",
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: s(80),
    paddingTop: s(40),
    paddingBottom: s(34),
    height: "100%",
  },
  logoRow: {
    height: s(36),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImg: {
    width: s(290),
    height: s(36),
    marginRight: s(8),
    marginBottom: s(32),
    objectFit: "contain",
  },
  orgName: {
    fontFamily: SANS_FONT_BOLD,
    fontSize: s(30),
    color: "#4076F0",
    marginBottom: s(8),
  },
  orgTag: {
    fontFamily: SANS_FONT_BOLD,
    fontSize: s(10),
    // FIX: preview uses tracking-[.12em] (0.12em of 10px = 1.2px) — was
    // hardcoded to 1, now scaled correctly like every other measurement.
    letterSpacing: s(10 * 0.12),
    color: "#333333",
    // FIX: preview uses `mt-1` (4px) — this was s(6), 2px too much gap
    // between the wordmark row and the tagline under the logo.
    marginTop: s(28),
  },
  title: {
    fontFamily: SERIF_FONT,
    fontSize: s(68),
    lineHeight: 1.15,
    letterSpacing: s(1.7),
    color: "#2D55BB",
    marginTop: s(10),
    textAlign: "center",
  },
  subtitle: {
    fontFamily: SERIF_FONT_BOLD,
    fontSize: s(30),
    letterSpacing: s(6),
    color: "#2D55BB",
    marginTop: s(8),
    textAlign: "center",
  },
  presentedLabel: {
    fontFamily: SERIF_FONT_BOLD,
    fontSize: s(20),
    letterSpacing: s(2),
    textTransform: "uppercase",
    color: "#000000",
    marginTop: s(34),
    marginBottom: s(6),
    textAlign: "center",
  },
  name: {
    fontFamily: SERIF_FONT,
    fontSize: s(62),
    letterSpacing: s(1.55),
    color: "#2D55BB",
    textTransform: "uppercase",
    // FIX: preview uses `mt-7` (28px) — this was s(12), name sat too close
    // to the "presented to" label compared to the live preview.
    marginTop: s(28),
    marginBottom: s(8),
    textAlign: "center",
    lineHeight: 1,
    maxWidth: s(820),
  },
  // Separate style for Khmer recipient names. Can't just reuse `name`:
  // - letterSpacing breaks Khmer's combining-mark shaping (base consonant +
  //   stacked/vowel signs), producing the uneven gaps between syllables.
  // - lineHeight: 1 clips Khmer vowel signs that sit above the base line
  //   (visible as a cropped diacritic at the top of the name).
  // - Battambang's glyphs run taller than Times-Roman at the same pt size,
  //   so a touch of marginBottom keeps the gap before the body text
  //   visually consistent with the Latin-name version.
  nameKhmer: {
    fontFamily: KHMER_FONT,
    fontSize: s(58),
    color: "#2D55BB",
    marginTop: s(28),
    marginBottom: s(8),
    textAlign: "center",
    lineHeight: 1.35,
    maxWidth: s(820),
  },
  body: {
    fontFamily: SERIF_FONT,
    fontSize: s(24),
    lineHeight: 1.8,
    color: "#000000",
    // FIX: preview uses `mt-7` (28px) — this was s(24).
    marginTop: s(28),
    marginBottom: s(8),
    textAlign: "center",
    maxWidth: s(760),
  },
  sigRow: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    width: s(660),
    paddingHorizontal: s(16),
    paddingTop: s(20),
  },
  sigCol: {
    width: s(250),
    flexDirection: "column",
    alignItems: "center",
  },
  sigImg: {
    height: s(60),
    maxWidth: s(220),
    objectFit: "contain",
    marginBottom: s(2),
  },
  sigScript: {
    fontFamily: SERIF_FONT,
    fontStyle: "italic",
    fontSize: s(38),
    color: "#7ea1dd",
    opacity: 0.85,
    height: s(40),
    textAlign: "center",
  },
  sigLine: {
    marginTop: s(6),
    width: "100%",
    // FIX: was a raw unscaled `2.5` — every other border/spacing value goes
    // through s(), so this was rendering visually thinner relative to the
    // rest of the page than the preview's `border-t-[2.5px]`.
    borderTopWidth: s(2.5),
    borderTopColor: "#2D55BB",
  },
  sigName: {
    fontFamily: SERIF_FONT_BOLD,
    fontSize: s(17),
    // FIX: preview has `tracking-wide` (0.025em) on the signer name —
    // wasn't set in the PDF at all, so names rendered slightly tighter
    // than the preview.
    letterSpacing: s(17 * 0.025),
    textTransform: "uppercase",
    color: "#000000",
    marginTop: s(6),
    marginBottom: s(4),
    textAlign: "center",
  },
  sigMeta: {
    fontFamily: SERIF_FONT,
    fontSize: s(15),
    lineHeight: 1.5,
    color: "#000000",
    textAlign: "center",
  },
  badgeWrap: {
    alignItems: "center",
    justifyContent: "center",
    // FIX: preview has `mb-6 pb-14` (24px margin + 56px padding) — the
    // marginBottom was missing entirely, so the badge sat too low/cramped
    // relative to the signature baseline compared to the preview.
    marginBottom: s(24),
    paddingBottom: s(56),
  },
  badgeImg: {
    // FIX: preview caps the badge at `max-h-10 max-w-12` (40px / 48px).
    // This was s(48)/s(64) — noticeably oversized vs. the live preview.
    maxHeight: s(40),
    maxWidth: s(48),
    objectFit: "contain",
  },
  badgeText: {
    // FIX: preview's fallback badge text uses `font-header` (serif/Times),
    // not the sans font — was SANS_FONT_BOLD, wrong typeface entirely.
    fontFamily: SERIF_FONT_BOLD,
    fontSize: s(22),
    lineHeight: 0.85,
    textAlign: "center",
  },
});

function Signature({ image, name, title, organization }) {
  const isKhmerName = hasKhmer(name);
  return (
    <View style={styles.sigCol}>
      {image ? (
        <Image src={image} style={styles.sigImg} />
      ) : (
        <Text style={styles.sigScript}>{name}</Text>
      )}
      <View style={styles.sigLine} />
      <Text
        style={[
          styles.sigName,
          isKhmerName
            ? { fontFamily: KHMER_FONT_BOLD, letterSpacing: 0, lineHeight: 1.35 }
            : null,
        ]}
      >
        {name}
      </Text>
      <Text style={styles.sigMeta}>
        {title}
        {"\n"}
        {organization}
      </Text>
    </View>
  );
}

function BodyText({ template, name }) {
  const runs = parseBold(template.replace(/\{name\}/g, name));
  return (
    <Text style={styles.body}>
      {runs.map((run, i) => (
        <Text
          key={i}
          style={{ fontFamily: run.bold ? SERIF_FONT_BOLD : SERIF_FONT }}
        >
          {run.text}
        </Text>
      ))}
    </Text>
  );
}

function CertificatePage({ form, name, images }) {
  const isKhmerName = hasKhmer(name);

  return (
    <Page size={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }} style={styles.page}>
      {images.background && (
        <Image src={images.background} style={styles.background} />
      )}

      <View style={styles.content}>
        <View style={styles.logoRow}>
          {images.logo && <Image src={images.logo} style={styles.logoImg} />}
          <Text style={styles.orgName}>{form.orgName}</Text>
        </View>
        {!!form.orgTag && <Text style={styles.orgTag}>{form.orgTag}</Text>}

        <Text style={styles.title}>{form.certTitle}</Text>
        <Text style={styles.subtitle}>{form.certSubtitle}</Text>

        <Text style={styles.presentedLabel}>{form.presentedLabel}</Text>
        <Text style={isKhmerName ? styles.nameKhmer : styles.name}>{name}</Text>

        <BodyText template={form.bodyText} name={name} />

        <View style={styles.sigRow}>
          <Signature
            image={images.sig1}
            name={form.sig1Name}
            title={form.sig1Title}
            organization={form.sig1Org}
          />

          <View style={styles.badgeWrap}>
            {images.badge ? (
              <Image src={images.badge} style={styles.badgeImg} />
            ) : (
              <Text style={styles.badgeText}>
                {form.badgeLine1}
                {"\n"}
                <Text style={{ color: "#e24a26" }}>{form.badgeLine2}</Text>
              </Text>
            )}
          </View>

          <Signature
            image={images.sig2}
            name={form.sig2Name}
            title={form.sig2Title}
            organization={form.sig2Org}
          />
        </View>
      </View>
    </Page>
  );
}

// Single-recipient PDF
export function CertificatePDF({ form, name, images }) {
  return (
    <Document>
      <CertificatePage form={form} name={name} images={images} />
    </Document>
  );
}

// Multi-recipient PDF — one page per name, in one file
export function CertificatesPDF({ form, names, images }) {
  return (
    <Document>
      {names.map((name, i) => (
        <CertificatePage key={`${name}-${i}`} form={form} name={name} images={images} />
      ))}
    </Document>
  );
}