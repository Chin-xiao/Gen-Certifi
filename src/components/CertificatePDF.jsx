import { Document, Page, View, Text, Image, Font, StyleSheet } from "@react-pdf/renderer";

// ---------------------------------------------------------------------------
// FONTS
// ---------------------------------------------------------------------------
// @react-pdf/renderer can't read fonts from the browser/OS or from a Google
// Fonts <link> — it needs a direct .ttf/.woff file it can embed. The most
// reliable way (won't break if a gstatic URL ever changes) is to download the
// files once and bundle them, so your Vite/CRA build resolves them to a URL
// automatically:
//
//   src/assets/fonts/EBGaramond-Regular.ttf
//   src/assets/fonts/EBGaramond-Bold.ttf
//   src/assets/fonts/Battambang-Regular.ttf   (for Khmer-script names)
//   src/assets/fonts/Battambang-Bold.ttf
//   src/assets/fonts/Inter-Regular.ttf
//   src/assets/fonts/Inter-Bold.ttf
//
// Get them from https://fonts.google.com/specimen/EB+Garamond (and
// .../Battambang, .../Inter) → "Download family" → unzip → grab the
// -Regular and -Bold .ttf files (skip the variable-font ones, react-pdf
// doesn't support those).
//
// Then uncomment these imports and the Font.register calls below.

// import ebGaramondRegular from "./assets/fonts/EBGaramond-Regular.ttf";
// import ebGaramondBold from "./assets/fonts/EBGaramond-Bold.ttf";
// import battambangRegular from "./assets/fonts/Battambang-Regular.ttf";
// import battambangBold from "./assets/fonts/Battambang-Bold.ttf";
// import interRegular from "./assets/fonts/Inter-Regular.ttf";
// import interBold from "./assets/fonts/Inter-Bold.ttf";

// Font.register({
//   family: "EBGaramond",
//   fonts: [
//     { src: ebGaramondRegular, fontWeight: 400 },
//     { src: ebGaramondBold, fontWeight: 700 },
//   ],
// });

// Font.register({
//   family: "Battambang",
//   fonts: [
//     { src: battambangRegular, fontWeight: 400 },
//     { src: battambangBold, fontWeight: 700 },
//   ],
// });

// Font.register({
//   family: "Inter",
//   fonts: [
//     { src: interRegular, fontWeight: 400 },
//     { src: interBold, fontWeight: 700 },
//   ],
// });

// Until you add the files above, react-pdf falls back to its built-in
// Helvetica/Times-Roman — the PDF will still generate, just with a
// slightly different look (and no Khmer glyph support) until you register
// real fonts.
const SERIF_FONT = "Times-Roman";
const SERIF_FONT_BOLD = "Times-Bold";
const KHMER_FONT = "Times-Roman"; // swap to "Battambang" once registered
const SANS_FONT = "Helvetica";
const SANS_FONT_BOLD = "Helvetica-Bold";

// ---------------------------------------------------------------------------
// LAYOUT
// ---------------------------------------------------------------------------
// The on-screen preview is designed at ~1000px card width, then jsPDF used
// to stretch that capture onto a 1123x794pt page. To keep every size/spacing
// number visually identical, we scale each "design px" value by the same
// ratio (1123/1000) instead of re-eyeballing everything from scratch.
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
    paddingHorizontal: s(80), // ~8% of the 1000px design width
    paddingTop: s(40),
    paddingBottom: s(34),
    height: "100%",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoImg: {
    width: s(320),
    height: s(36),
    marginRight: s(8),
    marginBottom: s(6),
    objectFit: "contain",
  },
  orgName: {
    fontFamily: SANS_FONT_BOLD,
    fontSize: s(30),
    color: "#4076F0",
  },
  orgTag: {
    fontFamily: SANS_FONT_BOLD,
    fontSize: s(10),
    letterSpacing: 1,
    color: "#333333",
    marginTop: s(6),
  },
  title: {
    fontFamily: SERIF_FONT,
    fontSize: s(68),
    color: "#2D55BB",
    marginTop: s(10),
    textAlign: "center",
  },
  subtitle: {
    fontFamily: SERIF_FONT_BOLD,
    fontSize: s(30),
    letterSpacing: s(9),
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
    textAlign: "center",
  },
  name: {
    fontSize: s(58),
    color: "#2D55BB",
    textTransform: "uppercase",
    marginTop: s(10),
    textAlign: "center",
    maxWidth: s(820),
  },
  body: {
    fontFamily: SERIF_FONT,
    fontSize: s(24),
    lineHeight: 1.8,
    color: "#000000",
    marginTop: s(24),
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
  sigLine: {
    marginTop: s(6),
    width: "100%",
    borderTopWidth: 2.5,
    borderTopColor: "#2D55BB",
  },
  sigName: {
    fontFamily: SERIF_FONT_BOLD,
    fontSize: s(17),
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
    paddingBottom: s(56),
  },
  badgeImg: {
    maxHeight: s(48),
    maxWidth: s(64),
    objectFit: "contain",
  },
  badgeText: {
    fontFamily: SANS_FONT_BOLD,
    fontSize: s(22),
    textAlign: "center",
  },
});

function Signature({ image, name, title, organization }) {
  const nameFont = hasKhmer(name) ? KHMER_FONT : SERIF_FONT_BOLD;
  return (
    <View style={styles.sigCol}>
      {image && <Image src={image} style={styles.sigImg} />}
      <View style={styles.sigLine} />
      <Text style={[styles.sigName, { fontFamily: nameFont }]}>{name}</Text>
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
  const nameFont = hasKhmer(name) ? KHMER_FONT : SERIF_FONT;

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
        <Text style={[styles.name, { fontFamily: nameFont }]}>{name}</Text>

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
                {form.badgeLine2}
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