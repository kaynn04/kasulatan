"use client";

export default function PrintButton({ pdfHref }: { pdfHref: string }) {
  return (
    <div
      className="summary-print-actions"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap",
      }}
    >
      <button type="button" onClick={() => window.print()} style={primaryButtonStyle}>
        Print
      </button>
      <a href={pdfHref} style={secondaryButtonStyle}>
        Download PDF
      </a>
    </div>
  );
}

const primaryButtonStyle = {
  border: 0,
  borderRadius: "12px",
  background: "#3BC1A8",
  color: "#005461",
  minHeight: "44px",
  padding: "0 16px",
  fontSize: "14px",
  fontWeight: 900,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #B7F7EC",
  borderRadius: "12px",
  background: "white",
  color: "#005461",
  textDecoration: "none",
  minHeight: "44px",
  padding: "0 16px",
  fontSize: "14px",
  fontWeight: 900,
  cursor: "pointer",
};
