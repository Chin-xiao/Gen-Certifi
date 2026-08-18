# Certificate Generator

React + Tailwind tool that reproduces your CheckinMe certificate template, lets you
swap in your own artwork (logo, corner graphics, signatures), and exports
print-quality PDFs — one at a time or in bulk for a whole client list.

## Stack

- React 18 + Vite (fast dev server, no config needed)
- Tailwind CSS for styling
- `html2canvas` — renders the certificate DOM to a high-res canvas (scale 3 ≈ 300dpi)
- `jspdf` — wraps that canvas into a PDF sized exactly to the certificate
- `jszip` + `file-saver` — bundles a batch run into one `certificates.zip`

## Run it

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

For a production build:

```bash
npm run build
npm run preview
```

## How to use it

1. **Text fields (left panel, section 1)** — edit the course/achievement line,
   both signatory names/titles, or override the whole body sentence.
2. **Artwork** — on the certificate preview itself, every logo and signature is
   a dashed box. Click one to upload that image from your computer. Nothing is
   hardcoded or bundled — it's blank until you upload it, and stays that way
   between page reloads only if you keep the tab open (see "Extend" below for
   persistence). Click an already-filled image to replace it.
3. **Recipients (section 3)** — paste one name per line. The list drives both
   the single-download dropdown and the batch export.
4. **Export (section 4)**
   - *Download this one as PDF* — exports exactly what's in the live preview.
   - *Download all N as ZIP* — silently re-renders the certificate once per
     name off-screen, captures each at high resolution, and packs every PDF
     into `certificates.zip`.

## Notes on quality

The canvas is captured at `scale: 3`, so a 1200×848px certificate becomes a
~3600×2544px PDF page — sharp enough for print, not just screen viewing. If
file size matters more than print quality, lower `scale` in `App.jsx`
(`captureNode`) to `2`.

## What I'd extend first

1. **Persist uploaded artwork** — right now images live in browser memory
   (`URL.createObjectURL`) and vanish on refresh. Swap in `localStorage`
   (base64) or, better, drag the 8 image slots into a tiny backend/S3 bucket
   so the whole team shares one template.
2. **CSV import for recipients** — instead of a one-name-per-line textarea,
   accept a CSV with `name, course, date` columns so each certificate can
   carry different course names/dates, not just a different name.
3. **Multi-page single PDF option** — `downloadAllAsZip` currently makes one
   PDF per person; add a sibling function that appends each canvas as a new
   page (`pdf.addPage()`) into *one* combined PDF for print shops that want a
   single file.
4. **Server-side rendering for very large batches** — html2canvas in the
   browser is fine for tens of certificates; for hundreds, move the same
   render logic into a headless-Chromium (Puppeteer) endpoint so the browser
   tab doesn't have to stay open.
5. **Template picker** — abstract `CertificateCanvas` layout constants (font
   sizes, positions) into a JSON "template" object so you can add a second
   certificate design without duplicating the component.

## Project structure

```
src/
  App.jsx                    # control panel + preview + export logic
  components/
    CertificateCanvas.jsx    # the certificate itself (fixed 1200x848px)
    ImageSlot.jsx            # click-to-upload image box, used 8x
  index.css                  # Tailwind + small component classes
```
# Gen-Certifi
