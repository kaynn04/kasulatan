import PDFDocument from "pdfkit/js/pdfkit.standalone.js";
import type { Agreement, AgreementParty, AuditLog } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

type AgreementSummary = Agreement & {
  parties: AgreementParty[];
  auditLogs: AuditLog[];
};

function formatDate(date: Date | null) {
  if (!date) return "Not set";

  return date.toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(date: Date | null) {
  if (!date) return "Not signed";

  return date.toLocaleString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function actionLabel(action: string) {
  const labels: Record<string, string> = {
    agreement_created: "Agreement created",
    agreement_signed_by_counterparty: "Counterparty signed",
    agreement_signed_by_creator: "Creator signed and finalized",
  };

  return labels[action] ?? action.replaceAll("_", " ");
}

function getParty(agreement: AgreementSummary, role: "CREATOR" | "COUNTERPARTY") {
  return agreement.parties.find((party) => party.role === role);
}

function safeFilename(value: string) {
  return value
    .replace(/[^a-z0-9-_ ]/gi, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80)
    .toLowerCase();
}

function signatureBuffer(signatureImage: string | null) {
  if (!signatureImage) return null;

  const match = signatureImage.match(/^data:image\/(?:png|jpeg|jpg|webp);base64,(.+)$/);
  if (!match) return null;

  return Buffer.from(match[1], "base64");
}

function ensureRoom(doc: PDFKit.PDFDocument, height = 80) {
  if (doc.y + height > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
}

function contentWidth(doc: PDFKit.PDFDocument) {
  return doc.page.width - doc.page.margins.left - doc.page.margins.right;
}

function sectionTitle(doc: PDFKit.PDFDocument, title: string) {
  ensureRoom(doc, 46);
  const x = doc.page.margins.left;
  const width = contentWidth(doc);
  const y = doc.y + 9;

  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor("#111827")
    .text(title, x, y, { width });

  const lineY = doc.y + 6;
  doc
    .moveTo(x, lineY)
    .lineTo(doc.page.width - doc.page.margins.right, lineY)
    .strokeColor("#dbe3ef")
    .lineWidth(1)
    .stroke();
  doc.y = lineY + 13;
}

function bodyText(doc: PDFKit.PDFDocument, value: string) {
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#334155")
    .text(value, doc.page.margins.left, doc.y, { width: contentWidth(doc), lineGap: 3 });
}

function keyValue(doc: PDFKit.PDFDocument, label: string, value: string, x: number, y: number, width: number) {
  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor("#64748b")
    .text(label.toUpperCase(), x, y, { width });
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#0f172a")
    .text(value, x, y + 14, { width });
}

function partyBlock(doc: PDFKit.PDFDocument, title: string, party: AgreementParty | undefined) {
  sectionTitle(doc, title);

  if (!party) {
    bodyText(doc, "No party information available.");
    return;
  }

  const startY = doc.y;
  const pageWidth = contentWidth(doc);
  const colWidth = (pageWidth - 16) / 2;

  keyValue(doc, "Full name", party.fullName, doc.page.margins.left, startY, colWidth);
  keyValue(doc, "Email", party.email, doc.page.margins.left + colWidth + 16, startY, colWidth);
  keyValue(doc, "Mobile", party.mobileNumber ?? "Not provided", doc.page.margins.left, startY + 48, colWidth);
  keyValue(doc, "Address", party.address ?? "Not provided", doc.page.margins.left + colWidth + 16, startY + 48, colWidth);
  keyValue(doc, "Signed at", formatDateTime(party.signedAt), doc.page.margins.left, startY + 96, colWidth);
  keyValue(
    doc,
    "E-signature consent",
    party.consentedToElectronicSignature ? "Consented" : "Not confirmed",
    doc.page.margins.left + colWidth + 16,
    startY + 96,
    colWidth
  );

  doc.y = startY + 148;

  if (party.typedSignature || party.signatureImage) {
    const signatureX = doc.page.margins.left;
    const signatureWidth = Math.min(280, contentWidth(doc));

    doc.font("Helvetica-Bold").fontSize(8).fillColor("#64748b").text("SIGNATURE", signatureX, doc.y, {
      width: signatureWidth,
    });

    if (party.typedSignature) {
      doc
        .font("Times-Italic")
        .fontSize(22)
        .fillColor("#0f172a")
        .text(party.typedSignature, signatureX, doc.y + 3, { width: signatureWidth });
    }

    const imageBuffer = signatureBuffer(party.signatureImage);
    if (imageBuffer) {
      try {
        doc.image(imageBuffer, signatureX, doc.y + 6, { fit: [240, 70] });
        doc.y += 76;
      } catch {
        doc
          .font("Helvetica")
          .fontSize(9)
          .fillColor("#64748b")
          .text("Signature image could not be embedded.", signatureX, doc.y + 6, { width: signatureWidth });
      }
    }
  }
}

async function createPdf(agreement: AgreementSummary) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 46,
    info: {
      Title: `${agreement.title} - Kasulatan Summary`,
      Author: "Kasulatan",
      Subject: "Transaction agreement summary",
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const complete = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  const creator = getParty(agreement, "CREATOR");
  const counterparty = getParty(agreement, "COUNTERPARTY");
  const isFinalized = agreement.status === "FINALIZED";

  const headerX = 46;
  const headerTop = 34;
  const titleY = 54;
  const titleWidth = 360;
  const statusCardY = 34;
  const statusCardHeight = 62;
  const titleHeight = doc.font("Times-Bold").fontSize(26).heightOfString(agreement.title, {
    width: titleWidth,
    lineGap: 2,
  });
  const taglineY = titleY + titleHeight + 8;
  const headerHeight = Math.max(132, taglineY + 28, statusCardY + statusCardHeight + 24);

  doc.rect(0, 0, doc.page.width, headerHeight).fill("#005461");
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("#B7F7EC")
    .text("KASULATAN TRANSACTION SUMMARY", headerX, headerTop);
  doc
    .font("Times-Bold")
    .fontSize(26)
    .fillColor("white")
    .text(agreement.title, headerX, titleY, { width: titleWidth, lineGap: 2 });
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#d7fffa")
    .text("Printable agreement record, signatures, and audit trail.", headerX, taglineY, { width: titleWidth });

  doc
    .roundedRect(430, statusCardY, 118, statusCardHeight, 8)
    .fill("#E6FFFA");
  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor("#005461")
    .text("STATUS", 444, 48);
  doc
    .font("Helvetica-Bold")
    .fontSize(15)
    .fillColor("#005461")
    .text(isFinalized ? "Finalized" : agreement.status.replaceAll("_", " "), 444, 66, { width: 86 });

  doc.y = headerHeight + 24;

  sectionTitle(doc, "Agreement details");
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const colWidth = (pageWidth - 32) / 3;
  const detailY = doc.y;
  keyValue(doc, "Reference number", agreement.referenceNumber, 46, detailY, colWidth);
  keyValue(doc, "Agreement type", agreement.agreementType, 46 + colWidth + 16, detailY, colWidth);
  keyValue(doc, "Amount", `${agreement.currency} ${agreement.amount.toString()}`, 46 + (colWidth + 16) * 2, detailY, colWidth);
  keyValue(doc, "Due date", formatDate(agreement.dueDate), 46, detailY + 52, colWidth);
  keyValue(doc, "Created", formatDate(agreement.createdAt), 46 + colWidth + 16, detailY + 52, colWidth);
  keyValue(doc, "Finalized", isFinalized ? formatDate(agreement.updatedAt) : "Not finalized", 46 + (colWidth + 16) * 2, detailY + 52, colWidth);
  doc.y = detailY + 104;

  sectionTitle(doc, "Subject matter");
  bodyText(doc, agreement.subjectMatter);

  sectionTitle(doc, "Payment terms");
  bodyText(doc, agreement.paymentTerms);

  sectionTitle(doc, "Agreement terms");
  bodyText(doc, agreement.termsText);

  ensureRoom(doc, 220);
  partyBlock(doc, "Creator", creator);
  ensureRoom(doc, 220);
  partyBlock(doc, "Counterparty", counterparty);

  sectionTitle(doc, "Audit trail");
  if (agreement.auditLogs.length > 0) {
    agreement.auditLogs.forEach((log) => {
      ensureRoom(doc, 42);
      const y = doc.y;
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#64748b").text(formatDateTime(log.createdAt), 46, y, { width: 150 });
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#0f172a").text(actionLabel(log.action), 210, y, { width: 280 });
      doc.font("Helvetica").fontSize(8).fillColor("#64748b").text(log.actorEmail, 210, y + 14, { width: 280 });
      doc.y = y + 36;
    });
  } else {
    bodyText(doc, "No activity recorded.");
  }

  ensureRoom(doc, 52);
  doc.y += 12;
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#64748b")
    .text(
      `Generated from Kasulatan on ${formatDateTime(new Date())}. This PDF is a convenience copy of the agreement record and should be reviewed together with the full agreement details.`,
      doc.page.margins.left,
      doc.y,
      { width: contentWidth(doc), lineGap: 2 }
    );

  doc.end();
  return complete;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await context.params;
  const agreement = await prisma.agreement.findFirst({
    where: {
      id,
      OR: [
        { createdById: session.id },
        { parties: { some: { email: session.email } } },
      ],
    },
    include: {
      parties: true,
      auditLogs: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!agreement) {
    return new Response("Agreement not found", { status: 404 });
  }

  const pdf = await createPdf(agreement);
  const filename = `${safeFilename(agreement.referenceNumber || agreement.title)}-summary.pdf`;

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
