"use client";

import Image from "next/image";
import { ChangeEvent, PointerEvent, useActionState, useRef, useState } from "react";
import { signAgreementAsCreator } from "./actions";
import styles from "../../workflow.module.css";

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

const initialState: SignAgreementState = { success: false, errors: {} };

export default function SignCreatorForm({ agreementId, creatorName }: { agreementId: string; creatorName: string }) {
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
    const point = getCanvasPoint(event);
    const context = canvas.getContext("2d");
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
    context.strokeStyle = "#16283a";
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
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureImage("");
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setSignatureImage(reader.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <form action={action} className={styles.signatureForm}>
      <input type="hidden" name="agreementId" value={agreementId} />
      <input type="hidden" name="signatureImage" value={signatureImage} />

      {state?.errors?.general && <div className={styles.errorBanner}>{state.errors.general}</div>}

      <div className={styles.confirmationGrid}>
        <label className={styles.checkCard}>
          <input type="checkbox" name="confirmedRead" className={styles.checkbox} />
          <span>
            <strong className={styles.checkTitle}>I completed the final review.</strong>
            <span className={styles.checkCopy}>I checked the counterparty signature, parties, amount, terms, and due date.</span>
          </span>
        </label>
        {state?.errors?.confirmedRead && <p className={styles.fieldError}>{state.errors.confirmedRead}</p>}

        <label className={styles.checkCard}>
          <input type="checkbox" name="consentedSignature" className={styles.checkbox} />
          <span>
            <strong className={styles.checkTitle}>I consent to electronic signing.</strong>
            <span className={styles.checkCopy}>I understand that my signature will finalize this agreement record.</span>
          </span>
        </label>
        {state?.errors?.consentedSignature && <p className={styles.fieldError}>{state.errors.consentedSignature}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor="typedSignature" className={styles.fieldLabel}>Typed legal signature</label>
        <input id="typedSignature" name="typedSignature" type="text" placeholder={creatorName} className={styles.control} />
        <p className={styles.fieldHint}>This must match your full name: {creatorName}</p>
        {state?.errors?.typedSignature && <p className={styles.fieldError}>{state.errors.typedSignature}</p>}
      </div>

      <div className={styles.signaturePanel}>
        <div className={styles.signatureHeader}>
          <div>
            <h3>Signature mark</h3>
            <p>Draw your signature or upload a clear image. It is saved with your final approval.</p>
          </div>
          <div className={styles.segmented}>
            <button type="button" onClick={() => setSignatureMode("draw")} className={signatureMode === "draw" ? styles.segmentActive : styles.segment}>Draw</button>
            <button type="button" onClick={() => setSignatureMode("upload")} className={signatureMode === "upload" ? styles.segmentActive : styles.segment}>Upload</button>
          </div>
        </div>

        {signatureMode === "draw" ? (
          <div className={styles.canvasStack}>
            <canvas
              ref={canvasRef}
              width={720}
              height={240}
              onPointerDown={startDrawing}
              onPointerMove={draw}
              onPointerUp={stopDrawing}
              onPointerCancel={stopDrawing}
              className={styles.signatureCanvas}
              aria-label="Draw signature"
            />
            <button type="button" onClick={clearSignature} className={styles.secondaryButton}>Clear signature</button>
          </div>
        ) : (
          <div className={styles.uploadBox}>
            <input accept="image/png,image/jpeg,image/webp" type="file" onChange={handleUpload} />
            <p className={styles.fieldHint}>PNG, JPG, or WebP works best. Keep the image small and readable.</p>
          </div>
        )}

        {signatureImage && (
          <div className={styles.preview}>
            <span className={styles.previewLabel}>Preview</span>
            <Image src={signatureImage} alt="Signature preview" width={420} height={120} unoptimized />
          </div>
        )}
        {state?.errors?.signatureImage && <p className={styles.fieldError}>{state.errors.signatureImage}</p>}
      </div>

      <button type="submit" disabled={pending} className={styles.submitButton}>
        {pending ? "Finalizing agreement…" : "Finalize with signature"}
      </button>
    </form>
  );
}
