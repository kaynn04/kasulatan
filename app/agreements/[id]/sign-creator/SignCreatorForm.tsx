"use client";

import Image from "next/image";
import { ChangeEvent, PointerEvent, useActionState, useRef, useState } from "react";
import { signAgreementAsCreator } from "./actions";

type SignAgreementState = {
  success: boolean;
  errors: {
    confirmedRead?: string;
    consentedSignature?: string;
    typedSignature?: string;
    signatureImage?: string;
    general?: string;
  };
};

const initialState: SignAgreementState = {
  success: false,
  errors: {},
};

export default function SignCreatorForm({
  agreementId,
  creatorName,
}: {
  agreementId: string;
  creatorName: string;
}) {
  const [state, action, pending] = useActionState(signAgreementAsCreator, initialState);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const [signatureImage, setSignatureImage] = useState("");
  const [signatureMode, setSignatureMode] = useState<"draw" | "upload">("draw");

  function getCanvasPoint(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function startDrawing(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    isDrawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    const context = canvas.getContext("2d");
    const point = getCanvasPoint(event);
    context?.beginPath();
    context?.moveTo(point.x, point.y);
  }

  function draw(event: PointerEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const point = getCanvasPoint(event);
    context.lineWidth = 3;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#0f172a";
    context.lineTo(point.x, point.y);
    context.stroke();
    setSignatureImage(canvas.toDataURL("image/png"));
  }

  function stopDrawing(event: PointerEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    canvasRef.current?.releasePointerCapture(event.pointerId);
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignatureImage("");
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSignatureImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <form action={action} style={{ display: "grid", gap: "18px" }}>
      <input type="hidden" name="agreementId" value={agreementId} />
      <input type="hidden" name="signatureImage" value={signatureImage} />

      {state?.errors?.general && (
        <div style={errorBannerStyle}>{state.errors.general}</div>
      )}

      <div style={confirmationGridStyle}>
        <label style={checkCardStyle}>
          <input type="checkbox" name="confirmedRead" style={checkboxStyle} />
          <span>
            <strong style={checkTitleStyle}>I completed the final review.</strong>
            <span style={checkCopyStyle}>
              I checked the counterparty signature, parties, amount, terms, and due date.
            </span>
          </span>
        </label>
        {state?.errors?.confirmedRead && <p style={fieldErrorStyle}>{state.errors.confirmedRead}</p>}

        <label style={checkCardStyle}>
          <input type="checkbox" name="consentedSignature" style={checkboxStyle} />
          <span>
            <strong style={checkTitleStyle}>I consent to electronic signing.</strong>
            <span style={checkCopyStyle}>
              I understand my signature will finalize this agreement record.
            </span>
          </span>
        </label>
        {state?.errors?.consentedSignature && <p style={fieldErrorStyle}>{state.errors.consentedSignature}</p>}
      </div>

      <div style={fieldGroupStyle}>
        <label htmlFor="typedSignature" style={labelStyle}>
          Typed legal signature
        </label>
        <input
          id="typedSignature"
          name="typedSignature"
          type="text"
          placeholder={creatorName}
          style={inputStyle}
        />
        <p style={hintStyle}>This must match your full name: {creatorName}</p>
        {state?.errors?.typedSignature && <p style={fieldErrorStyle}>{state.errors.typedSignature}</p>}
      </div>

      <div style={signaturePanelStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "start", flexWrap: "wrap" }}>
          <div>
            <h3 style={{ margin: "0 0 6px", color: "#0f172a", fontSize: "16px", fontWeight: 900 }}>
              Signature mark
            </h3>
            <p style={{ margin: 0, color: "#64748b", fontSize: "13px", lineHeight: 1.55 }}>
              Draw your signature or upload a clear image. This is saved with your final approval.
            </p>
          </div>
          <div style={segmentedStyle}>
            <button
              type="button"
              onClick={() => setSignatureMode("draw")}
              style={signatureMode === "draw" ? segmentActiveStyle : segmentStyle}
            >
              Draw
            </button>
            <button
              type="button"
              onClick={() => setSignatureMode("upload")}
              style={signatureMode === "upload" ? segmentActiveStyle : segmentStyle}
            >
              Upload
            </button>
          </div>
        </div>

        {signatureMode === "draw" ? (
          <div style={{ display: "grid", gap: "10px" }}>
            <canvas
              ref={canvasRef}
              className="signature-paper"
              width={720}
              height={240}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerCancel={stopDrawing}
              style={canvasStyle}
              aria-label="Draw signature"
            />
            <button className="signature-secondary-button" type="button" onClick={clearSignature} style={secondaryButtonStyle}>
              Clear signature
            </button>
          </div>
        ) : (
          <div style={uploadBoxStyle}>
            <input accept="image/png,image/jpeg,image/webp" type="file" onChange={handleUpload} />
            <p style={hintStyle}>PNG, JPG, or WebP works best. Keep the image small and readable.</p>
          </div>
        )}

        {signatureImage && (
          <div className="signature-paper" style={previewStyle}>
            <span style={{ color: "#64748b", fontSize: "12px", fontWeight: 900, textTransform: "uppercase" }}>
              Preview
            </span>
            <Image
              src={signatureImage}
              alt="Signature preview"
              width={420}
              height={120}
              unoptimized
              style={{ width: "100%", maxHeight: "96px", objectFit: "contain" }}
            />
          </div>
        )}
        {state?.errors?.signatureImage && <p style={fieldErrorStyle}>{state.errors.signatureImage}</p>}
      </div>

      <button type="submit" disabled={pending} style={primaryButtonStyle}>
        {pending ? "Finalizing agreement..." : "Finalize with signature"}
      </button>
    </form>
  );
}

const confirmationGridStyle = {
  display: "grid",
  gap: "10px",
};

const checkCardStyle = {
  display: "grid",
  gridTemplateColumns: "20px 1fr",
  gap: "12px",
  alignItems: "start",
  padding: "14px",
  border: "1px solid #dbeafe",
  borderRadius: "14px",
  background: "#f8fafc",
};

const checkboxStyle = {
  width: "18px",
  height: "18px",
  marginTop: "2px",
  accentColor: "#005461",
};

const checkTitleStyle = {
  display: "block",
  color: "#0f172a",
  fontSize: "14px",
  fontWeight: 900,
  marginBottom: "3px",
};

const checkCopyStyle = {
  display: "block",
  color: "#64748b",
  fontSize: "13px",
  lineHeight: 1.5,
};

const fieldGroupStyle = {
  display: "grid",
  gap: "8px",
};

const labelStyle = {
  color: "#0f172a",
  fontSize: "13px",
  fontWeight: 900,
};

const inputStyle = {
  width: "100%",
  minHeight: "46px",
  border: "1px solid #dbe3ef",
  borderRadius: "12px",
  padding: "0 14px",
  color: "#0f172a",
  fontSize: "15px",
  outline: "none",
};

const hintStyle = {
  margin: 0,
  color: "#64748b",
  fontSize: "12px",
  lineHeight: 1.5,
};

const fieldErrorStyle = {
  margin: 0,
  color: "#b91c1c",
  fontSize: "13px",
  fontWeight: 800,
};

const errorBannerStyle = {
  border: "1px solid #fecaca",
  background: "#fef2f2",
  color: "#991b1b",
  borderRadius: "12px",
  padding: "12px 14px",
  fontSize: "14px",
  fontWeight: 800,
};

const signaturePanelStyle = {
  display: "grid",
  gap: "14px",
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  padding: "16px",
  background: "white",
};

const segmentedStyle = {
  display: "inline-flex",
  padding: "4px",
  borderRadius: "12px",
  background: "#f1f5f9",
  gap: "4px",
};

const segmentStyle = {
  border: 0,
  borderRadius: "9px",
  background: "transparent",
  color: "#64748b",
  padding: "8px 12px",
  fontSize: "13px",
  fontWeight: 900,
  cursor: "pointer",
};

const segmentActiveStyle = {
  ...segmentStyle,
  background: "#005461",
  color: "white",
};

const canvasStyle = {
  width: "100%",
  aspectRatio: "3 / 1",
  border: "1px dashed #94a3b8",
  borderRadius: "14px",
  background: "#fbfdff",
  touchAction: "none",
  cursor: "crosshair",
};

const uploadBoxStyle = {
  display: "grid",
  gap: "8px",
  border: "1px dashed #94a3b8",
  borderRadius: "14px",
  background: "#fbfdff",
  padding: "18px",
};

const previewStyle = {
  display: "grid",
  gap: "8px",
  borderTop: "1px solid #eef2f7",
  paddingTop: "14px",
};

const secondaryButtonStyle = {
  justifySelf: "start",
  border: "1px solid #dbe3ef",
  borderRadius: "10px",
  background: "white",
  color: "#0f172a",
  minHeight: "38px",
  padding: "0 13px",
  fontSize: "13px",
  fontWeight: 900,
  cursor: "pointer",
};

const primaryButtonStyle = {
  border: 0,
  borderRadius: "12px",
  background: "#3BC1A8",
  color: "#005461",
  minHeight: "48px",
  padding: "0 18px",
  fontSize: "15px",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 12px 24px rgba(0, 84, 97, 0.14)",
};
