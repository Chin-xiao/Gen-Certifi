import { useRef, useState } from "react";

import { pdf } from "@react-pdf/renderer";
import { CertificatePDF, CertificatesPDF } from "./components/CertificatePDF.jsx";
import logo from "./assets/CheckinMe_logo.png";
import background from "./assets/background.png";
import signature1 from "./assets/signatureceo.png";
import signature2 from "./assets/signatureproject.png";
import badge from "./assets/hrgo.png";

const initialRecipients = [];

export default function App() {
  const [recipients, setRecipients] = useState(initialRecipients);
  const [activeIndex, setActiveIndex] = useState(0);

  // Seed these with the imported static assets so they render on load,
  // without requiring a manual upload. The upload buttons below can
  // still override them per-session if needed.
  const [logoDataUrl, setLogoDataUrl] = useState(logo);
  const [bgDataUrl, setBgDataUrl] = useState(background);
  const [sig1ImgDataUrl, setSig1ImgDataUrl] = useState(signature1);
  const [sig2ImgDataUrl, setSig2ImgDataUrl] = useState(signature2);
  const [badgeImgDataUrl, setBadgeImgDataUrl] = useState(badge);

  const [showSigEdit, setShowSigEdit] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [form, setForm] = useState({

    certTitle: "CERTIFICATE",
    certSubtitle: "OF COMPLETION",
    presentedLabel: "This certificate is presented to",
    bodyText:
      "By mastering the **CheckinMe 2026 Software Updates**, and has shown a commitment to digital excellence and the future of automated HR workflows.",

    sig1Name: "Ley Kamthong",
    sig1Title: "Chief Executive Officer",
    sig1Org: "CheckinMe",

    sig2Name: "Kuch Kolyaney",
    sig2Title: "Project Chair",
    sig2Org: "2026 Software Update",

    badgeLine1: "HR",
    badgeLine2: "GO",
  });

  const activeName = recipients[activeIndex] || "";

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const mdBold = (str) => {
    const escaped = str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    return escaped
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");
  };

  const uploadImage = (file, setter) => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setter(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const addNames = () => {
    const textarea = document.getElementById("bulkNames");

    const names = textarea.value
      .split("\n")
      .map((name) => name.trim())
      .filter(Boolean);

    if (!names.length) return;

    setRecipients((prev) => {
      const wasEmpty = prev.length === 0;

      if (wasEmpty) {
        setActiveIndex(0);
      }

      return [...prev, ...names];
    });

    textarea.value = "";
  };

  const removeRecipient = (index) => {
    setRecipients((prev) => {
      const next = prev.filter((_, i) => i !== index);

      setActiveIndex((current) =>
        current >= next.length ? Math.max(0, next.length - 1) : current
      );

      return next;
    });
  };

  const buildImages = () => ({
    logo: logoDataUrl,
    background: bgDataUrl,
    sig1: sig1ImgDataUrl,
    sig2: sig2ImgDataUrl,
    badge: badgeImgDataUrl,
  });

  const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadOne = async () => {
    if (!recipients.length) return;

    setIsGenerating(true);

    try {
      const blob = await pdf(
        <CertificatePDF form={form} name={activeName} images={buildImages()} />
      ).toBlob();

      const safeName = activeName.replace(/[^a-z0-9]+/gi, "_");

      triggerDownload(blob, `Certificate_${safeName}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadAll = async () => {
    if (!recipients.length) return;

    setIsGenerating(true);

    try {
      const blob = await pdf(
        <CertificatesPDF form={form} names={recipients} images={buildImages()} />
      ).toBlob();

      triggerDownload(blob, `Certificates_${recipients.length}_recipients.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6fb] font-[Inter,sans-serif] text-[#1c1c2b]">
      <div className="flex min-h-screen">

        {/* ================= SIDEBAR ================= */}

        <aside className="w-[380px] shrink-0 overflow-y-auto border-r border-[#e1e4f0] bg-white px-[22px] pb-[100px] pt-6">

          {/* Brand */}

          <div className="mb-[22px] flex items-center gap-2.5">
            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-gradient-to-br from-[#3049d6] to-[#1c2b78] text-[15px] font-bold text-white">
              C
            </div>

            <div>
              <div className="text-[15px] font-bold">
                Certificate Generator
              </div>

              <div className="-mt-0.5 text-[11px] text-[#4a4a5e]">
                Same template, one click per client
              </div>
            </div>
          </div>

          {/* ================= BRANDING ================= */}

          <Section number="1" title="Branding">

            <label className="label">
              Background artwork (optional)
            </label>

            <FileUpload
              label="Upload background"
              preview={bgDataUrl}
              onChange={(file) =>
                uploadImage(file, setBgDataUrl)
              }
              onClear={() => setBgDataUrl(background)}
            />

            <p className="hint">
              If you have a full certificate background,
              upload it here and it replaces the built-in
              corner shapes.
            </p>

            <label className="label">
              Logo image (optional)
            </label>

            <FileUpload
              label="Upload logo"
              preview={logoDataUrl}
              onChange={(file) =>
                uploadImage(file, setLogoDataUrl)
              }
              onClear={() => setLogoDataUrl(logo)}
            />

          </Section>

          {/* ================= CERTIFICATE TEXT ================= */}

          <Section number="2" title="Certificate text">

            <div className="grid grid-cols-2 gap-2.5">

              <Input
                label="Title"
                value={form.certTitle}
                onChange={(v) =>
                  updateField("certTitle", v)
                }
              />

              <Input
                label="Subtitle"
                value={form.certSubtitle}
                onChange={(v) =>
                  updateField("certSubtitle", v)
                }
              />

            </div>

            <Input
              label='"Presented to" label'
              value={form.presentedLabel}
              onChange={(v) =>
                updateField("presentedLabel", v)
              }
            />

            <label className="label">
              Achievement text — use **bold** for emphasis,
              {" {name} "} inserts the recipient
            </label>

            <textarea
              className="input min-h-[90px]"
              value={form.bodyText}
              onChange={(e) =>
                updateField("bodyText", e.target.value)
              }
            />

          </Section>

          {/* ================= SIGNATORIES ================= */}

          <Section number="3" title="Signatories">

            <div className="mb-2 text-[11px] text-[#8a8ea3]">
              Static — stays identical on every certificate.
            </div>

            <button
              type="button"
              onClick={() => setShowSigEdit(!showSigEdit)}
              className="btn-secondary"
            >
              {showSigEdit
                ? "Hide signatories editor"
                : "Edit signatories"}
            </button>

            {showSigEdit && (
              <div className="mt-2.5">

                {/* Signature 1 */}

                <div className="sig-block">

                  <label className="label">
                    Signature 1 image
                  </label>

                  <FileUpload
                    label="Upload signature"
                    preview={sig1ImgDataUrl}
                    onChange={(file) =>
                      uploadImage(
                        file,
                        setSig1ImgDataUrl
                      )
                    }
                    onClear={() =>
                      setSig1ImgDataUrl(signature1)
                    }
                  />

                  <Input
                    label="Name"
                    value={form.sig1Name}
                    onChange={(v) =>
                      updateField("sig1Name", v)
                    }
                  />

                  <Input
                    label="Title"
                    value={form.sig1Title}
                    onChange={(v) =>
                      updateField("sig1Title", v)
                    }
                  />

                  <Input
                    label="Organization"
                    value={form.sig1Org}
                    onChange={(v) =>
                      updateField("sig1Org", v)
                    }
                  />

                </div>

                {/* Signature 2 */}

                <div className="sig-block">

                  <label className="label">
                    Signature 2 image
                  </label>

                  <FileUpload
                    label="Upload signature"
                    preview={sig2ImgDataUrl}
                    onChange={(file) =>
                      uploadImage(
                        file,
                        setSig2ImgDataUrl
                      )
                    }
                    onClear={() =>
                      setSig2ImgDataUrl(signature2)
                    }
                  />

                  <Input
                    label="Name"
                    value={form.sig2Name}
                    onChange={(v) =>
                      updateField("sig2Name", v)
                    }
                  />

                  <Input
                    label="Title"
                    value={form.sig2Title}
                    onChange={(v) =>
                      updateField("sig2Title", v)
                    }
                  />

                  <Input
                    label="Organization"
                    value={form.sig2Org}
                    onChange={(v) =>
                      updateField("sig2Org", v)
                    }
                  />

                </div>

                {/* Badge */}

                <label className="label">
                  Center badge image
                </label>

                <FileUpload
                  label="Upload badge"
                  preview={badgeImgDataUrl}
                  onChange={(file) =>
                    uploadImage(
                      file,
                      setBadgeImgDataUrl
                    )
                  }
                  onClear={() =>
                    setBadgeImgDataUrl(badge)
                  }
                />

                <Input
                  label="Badge line 1"
                  value={form.badgeLine1}
                  onChange={(v) =>
                    updateField("badgeLine1", v)
                  }
                />

                <Input
                  label="Badge line 2"
                  value={form.badgeLine2}
                  onChange={(v) =>
                    updateField("badgeLine2", v)
                  }
                />

              </div>
            )}

          </Section>

          {/* ================= RECIPIENTS ================= */}

          <Section number="4" title="Recipients">

            <label className="label">
              Paste names — one per line
            </label>

            <textarea
              id="bulkNames"
              className="input min-h-[80px]"
              placeholder={
                "Kheang Sokheng\nBro Kheng\nSeven"
              }
            />

            <button
              onClick={addNames}
              className="btn-secondary"
            >
              + Add to list
            </button>

            <div className="mt-2 max-h-[160px] overflow-y-auto rounded-lg border border-[#e1e4f0]">

              {recipients.map((name, index) => (
                <div
                  key={`${name}-${index}`}
                  onClick={() => setActiveIndex(index)}
                  className={`flex cursor-pointer items-center justify-between border-b border-[#e1e4f0] px-2.5 py-2 text-[12.5px] last:border-b-0 ${
                    index === activeIndex
                      ? "bg-[#eef1fd] font-semibold text-[#2a3fc4]"
                      : "hover:bg-[#f7f8fd]"
                  }`}
                >

                  <span>{name}</span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecipient(index);
                    }}
                    className="px-1 text-[#b7b7c4] hover:text-red-600"
                  >
                    ✕
                  </button>

                </div>
              ))}

            </div>

            <div className="mt-1.5 text-[11px] text-[#4a4a5e]">
              {recipients.length}{" "}
              {recipients.length === 0
                ? "recipient"
                : "recipients"}
            </div>

          </Section>

          {/* ================= EXPORT ================= */}

          <Section number="5" title="Export">

            <button
              disabled={!recipients.length || isGenerating}
              onClick={downloadOne}
              className="btn-secondary"
            >
              {isGenerating ? "Generating…" : "Download this certificate (PDF)"}
            </button>

            <button
              disabled={!recipients.length || isGenerating}
              onClick={downloadAll}
              className="btn-primary"
            >
              {isGenerating ? "Generating…" : "Download all as PDF (one file)"}
            </button>

            {isGenerating && (
              <div className="mt-2.5 text-[11px] text-[#4a4a5e]">
                Rendering {recipients.length}{" "}
                {recipients.length === 1 ? "certificate" : "certificates"}…
              </div>
            )}

          </Section>

        </aside>

        {/* ================= MAIN ================= */}

        <main className="flex flex-1 flex-col items-center px-6 py-[34px]">

          <div className="mb-4 flex w-full max-w-[1000px] items-center justify-between">

            <div>
              <h1 className="m-0 text-base font-bold">
                Preview
              </h1>

              <div className="mt-0.5 text-xs text-[#4a4a5e]">
                Edit fields on the left — this updates live
              </div>
            </div>

            <div className="flex items-center gap-1.5">

              <button
                disabled={activeIndex <= 0}
                onClick={() =>
                  setActiveIndex((i) =>
                    Math.max(0, i - 1)
                  )
                }
                className="nav-btn"
              >
                ‹
              </button>

              <div className="min-w-[70px] text-center text-xs text-[#4a4a5e]">
                {recipients.length
                  ? activeIndex + 1
                  : 0}{" "}
                / {recipients.length}
              </div>

              <button
                disabled={
                  activeIndex >=
                  recipients.length - 1
                }
                onClick={() =>
                  setActiveIndex((i) =>
                    Math.min(
                      recipients.length - 1,
                      i + 1
                    )
                  )
                }
                className="nav-btn"
              >
                ›
              </button>

            </div>

          </div>

          {/* Certificate */}

          <div className="w-full max-w-[1000px]">

            <div
              className="relative aspect-[1123/794] w-full overflow-hidden rounded-[10px] bg-white shadow-[0_10px_40px_rgba(28,43,120,.14)]"
              style={
                bgDataUrl
                  ? {
                      backgroundImage: `url("${bgDataUrl}")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : {}
              }
            >

              {!bgDataUrl && (
                <CertificateDecoration />
              )}

              <div className="relative z-10 flex h-full flex-col items-center px-[8%] pb-[34px] pt-[40px]">

               {/* Logo */}
<div className="mb-0.5 flex flex-col items-center">

  {/* Locked height wrapper to prevent vertical shifting */}
  <div className="flex h-[36px] items-center justify-center">

    {logoDataUrl ? (
      <img
        src={logoDataUrl}
        className="mb-8 mr-2 h-[36px] max-w-[290px] object-contain"
        alt=""
      />
    ) : (
      <svg
        width="32"
        height="32"
        className=" mr-2 h-[32px] w-[32px] text-[#2b52b3]"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
    )}

    {/* 
      1. leading-[32px] forces the text box to exactly match the 32px icon height. 
      2. relative -top-[2px] acts as a targeted override to pull the text baseline up 
         to compensate for the html2canvas descender bug. Adjust to -top-[3px] if needed.
    */}
    <div className="font-body relative -top-[2px] text-[30px] font-extrabold leading-[32px] tracking-tight text-[#4076F0]">
      {form.orgName}
    </div>

  </div>

  <div className="font-body mt-1 text-[10px] font-bold tracking-[.12em] text-[#333333]">
    {form.orgTag}
  </div>

</div>

                {/* Title */}

                <div className="font-header mt-2.5 text-[68px] font-normal leading-[1.15] tracking-wide text-[#2D55BB]">
                  {form.certTitle}
                </div>

                <div className="font-header mt-2 text-[30px] font-bold tracking-[0.2em] text-[#2D55BB]">
                  {form.certSubtitle}
                </div>

                {/* Presented */}

                <div className="font-header mt-[34px] mb-[6px] text-[20px] font-bold uppercase tracking-[0.1em] text-black">
                  {form.presentedLabel}
                </div>

                {/* Name */}

                <div className="font-header mt-7 mb-5 mt-2.5 max-w-[820px] text-center text-[62px] font-normal uppercase leading-none tracking-wide text-[#2D55BB]">
                  {activeName}
                </div>

                {/* Body */}

                <div
                  className="font-header mt-6 max-w-[760px] text-center text-[24px] leading-[1.8] text-black"
                  dangerouslySetInnerHTML={{
                    __html: mdBold(
                      form.bodyText.replace(
                        /\{name\}/g,
                        activeName
                      )
                    ),
                  }}
                />

                {/* Signatures */}

                <div className="mt-auto flex w-full max-w-[660px] items-end justify-between px-4 pt-5">

                  <Signature 
                    image={sig1ImgDataUrl}
                    name={form.sig1Name}
                    title={form.sig1Title}
                    organization={form.sig1Org}
                  />

                  <div className="flex items-center justify-center pb-14">

                    {badgeImgDataUrl ? (
                      <img
                        src={badgeImgDataUrl}
                        className="max-h-12 max-w-16 object-contain"
                        alt=""
                      />
                    ) : (
                      <div className="font-header text-center text-[22px] font-black leading-[.85]">
                        {form.badgeLine1}
                        <br />
                        <span className="text-[#e24a26]">
                          {form.badgeLine2}
                        </span>
                      </div>
                    )}

                  </div>

                  <Signature
                    image={sig2ImgDataUrl}
                    name={form.sig2Name}
                    title={form.sig2Title}
                    organization={form.sig2Org}
                  />

                </div>

              </div>
            </div>

          </div>

          <footer className="mt-[26px] max-w-[1000px] text-center text-[11px] text-[#a6a9ba]">
            Certificates render at high resolution for crisp
            PDF output. Uploaded logos stay in your browser
            only.
          </footer>

        </main>
      </div>

      <style>{`
        .font-header {
          font-family: "Times New Roman", Times, Georgia, "EB Garamond", "Battambang", serif;
        }

        .font-khmer-name {
          font-family: "Battambang", "Khmer OS Siemreap", "Khmer OS Battambang", sans-serif;
        }

        .font-body {
          font-family: Inter, Montserrat, Helvetica, Arial, sans-serif;
        }

        .label {
          display: block;
          margin: 10px 0 4px;
          font-size: 12px;
          font-weight: 600;
          color: #4a4a5e;
        }

        .input {
          width: 100%;
          border: 1px solid #e1e4f0;
          border-radius: 8px;
          background: white;
          padding: 9px 10px;
          font-family: Inter, sans-serif;
          font-size: 13px;
          color: #1c1c2b;
          resize: vertical;
        }

        .input:focus {
          outline: none;
          border-color: #7c94ef;
          box-shadow: 0 0 0 3px #eef1fd;
        }

        .hint {
          margin-top: 4px;
          font-size: 11px;
          color: #8a8ea3;
        }

        .btn-primary,
        .btn-secondary {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
          border-radius: 9px;
          padding: 11px 14px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-primary {
          border: none;
          background: #2a3fc4;
          color: white;
        }

        .btn-primary:hover {
          background: #1c2b78;
        }

        .btn-secondary {
          border: 1px solid #c8d3fb;
          background: #f5f6fb;
          color: #2a3fc4;
        }

        .btn-secondary:hover {
          background: #eef1fd;
        }

        button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .sig-block {
          margin-top: 8px;
          border: 1px solid #e1e4f0;
          border-radius: 10px;
          background: #f5f6fb;
          padding: 12px;
        }

        .nav-btn {
          display: flex;
          height: 30px;
          width: 30px;
          align-items: center;
          justify-content: center;
          border: 1px solid #e1e4f0;
          border-radius: 7px;
          background: white;
          cursor: pointer;
          font-size: 14px;
        }

        .nav-btn:hover {
          border-color: #7c94ef;
        }
      `}</style>
    </div>
  );
}


/* =========================================================
   SECTION
========================================================= */

function Section({ number, title, children }) {
  return (
    <div className="mb-[22px]">

      <div className="mb-2.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[.08em] text-[#2a3fc4]">

        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#eef1fd] text-[10px] font-extrabold text-[#2a3fc4]">
          {number}
        </span>

        {title}

      </div>

      {children}

    </div>
  );
}


/* =========================================================
   INPUT
========================================================= */

function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="label">{label}</label>

      <input
        type="text"
        className="input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}


/* =========================================================
   FILE UPLOAD
========================================================= */

function FileUpload({
  label,
  preview,
  onChange,
  onClear,
}) {
  const inputRef = useRef(null);

  return (
    <div className="mt-1.5 flex items-center gap-2.5">

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-[7px] border border-[#e1e4f0] bg-white px-3 py-[7px] text-xs font-semibold text-[#1c1c2b] hover:border-[#7c94ef] hover:text-[#2a3fc4]"
      >
        {label}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) =>
          onChange(e.target.files?.[0])
        }
      />

      {preview && (
        <>
          <img
            src={preview}
            alt=""
            className="h-8 w-8 rounded-md border border-[#e1e4f0] bg-white object-contain"
          />

          <button
            type="button"
            onClick={onClear}
            className="text-[11px] text-[#b23b3b] underline"
          >
            remove
          </button>
        </>
      )}

    </div>
  );
}


/* =========================================================
   SIGNATURE
========================================================= */

function Signature({
  image,
  name,
  title,
  organization,
}) {
  return (
    <div className="flex w-[250px] flex-col items-center">

      {image ? (
        <img
          src={image}
          alt=""
          className="mb-0.5 h-[60px] max-w-[220px] object-contain"
        />
      ) : (
        <div className="flex h-10 items-end font-['Brush_Script_MT','Alex_Brush',cursive] text-[38px] text-[#7ea1dd] opacity-85">
          {name}
        </div>
      )}

      <div className="mt-1.5 w-full border-t-[2.5px] border-[#2D55BB]" />

      <div className="font-header mb-1 mt-1.5 text-[17px] font-bold uppercase tracking-wide text-black">
        {name}
      </div>

      <div className="font-header text-center text-[15px] leading-[1.5] text-black">
        {title}
        <br />
        {organization}
      </div>

    </div>
  );
}


/* =========================================================
   CERTIFICATE DECORATION
========================================================= */

function CertificateDecoration() {
  return (
    <div className="pointer-events-none absolute inset-0">

      {/* Top-left */}

      <svg
        className="absolute left-0 top-0"
        width="505"
        height="505"
        viewBox="0 0 450 450"
        fill="none"
      >
        {[
          150,
          180,
          210,
          240,
          270,
          300,
          330,
        ].map((y) => (
          <path
            key={y}
            d={`M-50,${y} C${
              y
            },${y} ${y},${y - 50} ${y},-50`}
            stroke="#C0D0EF"
            strokeWidth="1.5"
          />
        ))}
      </svg>

      {/* Top-right */}

      <svg
        className="absolute right-0 top-0"
        width="562"
        height="562"
        viewBox="0 0 500 500"
        fill="none"
      >
        <path
          d="M150,0 C150,250 300,400 500,450 L500,0 Z"
          fill="#4076F0"
        />

        <path
          d="M220,0 C220,210 340,340 500,380 L500,0 Z"
          fill="#2D55BB"
        />

        <path
          d="M280,0 C280,180 380,300 500,320 L500,0 Z"
          fill="#1C56C2"
        />
      </svg>

      {/* Bottom-left */}

      <svg
        className="absolute bottom-0 left-0"
        width="505"
        height="393"
        viewBox="0 0 450 350"
        fill="none"
      >
        <path
          d="M0,0 Q180,80 350,350 L0,350 Z"
          fill="#4076F0"
        />

        <path
          d="M0,90 Q120,160 220,350 L0,350 Z"
          fill="#2D55BB"
        />

        <path
          d="M0,170 Q80,240 120,350 L0,350 Z"
          fill="#1C56C2"
        />
      </svg>

      {/* Bottom-right */}

      <svg
        className="absolute bottom-0 right-0"
        width="505"
        height="505"
        viewBox="0 0 450 450"
        fill="none"
      >
        {[
          300,
          270,
          240,
          210,
          180,
        ].map((y) => (
          <path
            key={y}
            d={`M500,${y} C350,${y} ${y},${
              y + 50
            } ${y},500`}
            stroke="#C0D0EF"
            strokeWidth="1.5"
          />
        ))}
      </svg>

    </div>
  );
}