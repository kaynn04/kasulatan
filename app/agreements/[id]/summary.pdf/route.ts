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

function signatureSource(signatureImage: string | null) {
  if (!signatureImage) return null;

  // The standalone PDFKit build uses its own Buffer implementation. Passing a
  // Node.js Buffer makes valid PNGs look like file paths, while passing the
  // data URL lets PDFKit decode the image with its compatible Buffer.
  return /^data:image\/(?:png|jpeg|jpg);base64,[a-z0-9+/]+={0,2}$/i.test(signatureImage)
    ? signatureImage
    : null;
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

function compactField(
  doc: PDFKit.PDFDocument,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number
) {
  doc.font("Helvetica-Bold").fontSize(6.5).fillColor("#64748b").text(label.toUpperCase(), x, y, { width });
  doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#0f172a").text(value, x, y + 12, {
    width,
    lineGap: 1.5,
  });

  return 12 + doc.heightOfString(value, { width, lineGap: 1.5 });
}

function partyDetailsHeight(doc: PDFKit.PDFDocument, party: AgreementParty | undefined, width: number) {
  if (!party) return 94;

  const innerWidth = width - 28;
  const fieldWidth = (innerWidth - 12) / 2;
  const fieldRows = [
    [party.fullName, party.mobileNumber ?? "Not provided"],
    [party.address ?? "Not provided", formatDateTime(party.signedAt)],
    [
      party.confirmedReadAgreement ? "Confirmed" : "Not confirmed",
      party.consentedToElectronicSignature ? "Consented" : "Not confirmed",
    ],
  ];

  doc.font("Helvetica-Bold").fontSize(7.5);
  const fieldsHeight = fieldRows.reduce((total, row) => {
    const rowHeight = Math.max(...row.map((value) => 12 + doc.heightOfString(value, { width: fieldWidth, lineGap: 1.5 })));
    return total + Math.max(34, rowHeight) + 8;
  }, 0);
  return 66 + fieldsHeight;
}

function partyDetailsCard(
  doc: PDFKit.PDFDocument,
  title: string,
  party: AgreementParty | undefined,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const padding = 14;
  const innerX = x + padding;
  const innerWidth = width - padding * 2;

  doc.roundedRect(x, y, width, height, 10).fillAndStroke("#ffffff", "#e5e7eb");
  doc.font("Helvetica-Bold").fontSize(11).fillColor("#111827").text(title, innerX, y + 15, { width: innerWidth - 54 });

  if (!party) {
    doc.font("Helvetica").fontSize(8).fillColor("#64748b").text("No party information is available.", innerX, y + 42, {
      width: innerWidth,
    });
    return;
  }

  doc.font("Helvetica-Bold").fontSize(6.5).fillColor(party.signedAt ? "#0f5267" : "#92400e").text(
    party.signedAt ? "SIGNED" : "NOT SIGNED",
    x + width - 65,
    y + 17,
    { width: 51, align: "right" }
  );
  doc.font("Helvetica").fontSize(7).fillColor("#64748b").text(party.email, innerX, y + 34, { width: innerWidth });

  const fieldWidth = (innerWidth - 12) / 2;
  let fieldY = y + 58;
  const rows: Array<[[string, string], [string, string]]> = [
    [["Full name", party.fullName], ["Mobile", party.mobileNumber ?? "Not provided"]],
    [["Address", party.address ?? "Not provided"], ["Signed at", formatDateTime(party.signedAt)]],
    [
      ["Read agreement", party.confirmedReadAgreement ? "Confirmed" : "Not confirmed"],
      ["E-signature consent", party.consentedToElectronicSignature ? "Consented" : "Not confirmed"],
    ],
  ];

  for (const row of rows) {
    const leftHeight = compactField(doc, row[0][0], row[0][1], innerX, fieldY, fieldWidth);
    const rightHeight = compactField(doc, row[1][0], row[1][1], innerX + fieldWidth + 12, fieldY, fieldWidth);
    const rowHeight = Math.max(34, leftHeight, rightHeight);
    const lineY = fieldY + rowHeight + 2;
    doc.moveTo(innerX, lineY).lineTo(innerX + fieldWidth, lineY).strokeColor("#e5e7eb").lineWidth(0.7).stroke();
    doc.moveTo(innerX + fieldWidth + 12, lineY).lineTo(innerX + innerWidth, lineY).stroke();
    fieldY = lineY + 9;
  }
}

function partySignatureCard(
  doc: PDFKit.PDFDocument,
  party: AgreementParty | undefined,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const padding = 14;
  const innerX = x + padding;
  const innerWidth = width - padding * 2;

  doc.roundedRect(x, y, width, height, 10).fillAndStroke("#ffffff", "#e5e7eb");
  doc.font("Helvetica-Bold").fontSize(6.5).fillColor("#64748b").text("SIGNATURE", innerX, y + 14, { width: innerWidth });

  if (!party || (!party.typedSignature && !party.signatureImage)) {
    doc.font("Helvetica").fontSize(8).fillColor("#64748b").text("No signature recorded.", innerX, y + 35, {
      width: innerWidth,
    });
    return;
  }

  let signatureY = y + 28;
  if (party.typedSignature) {
    doc.font("Times-Italic").fontSize(18).fillColor("#0f172a").text(party.typedSignature, innerX, signatureY, {
      width: innerWidth,
      height: 25,
    });
    signatureY += 31;
  }

  const imageSource = signatureSource(party.signatureImage);
  if (imageSource) {
    const paperHeight = 58;
    doc.save().roundedRect(innerX, signatureY, innerWidth, paperHeight, 7).dash(3, { space: 3 }).strokeColor("#cbd5e1").stroke().restore();
    try {
      doc.image(imageSource, innerX + 7, signatureY + 7, {
        fit: [innerWidth - 14, paperHeight - 14],
        align: "center",
        valign: "center",
      });
    } catch {
      doc.font("Helvetica").fontSize(7).fillColor("#64748b").text("Signature image could not be embedded.", innerX + 8, signatureY + 22, {
        width: innerWidth - 16,
        align: "center",
      });
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

  doc.rect(0, 0, doc.page.width, headerHeight).fill("#0f354f");
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("#efb642")
    .text("KASULATAN TRANSACTION SUMMARY", headerX, headerTop);
  doc
    .font("Times-Bold")
    .fontSize(26)
    .fillColor("white")
    .text(agreement.title, headerX, titleY, { width: titleWidth, lineGap: 2 });
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor("#d8e3ea")
    .text("Printable agreement record, signatures, and audit trail.", headerX, taglineY, { width: titleWidth });

  doc
    .roundedRect(430, statusCardY, 118, statusCardHeight, 8)
    .fill("#fae9ba");
  doc
    .font("Helvetica-Bold")
    .fontSize(8)
    .fillColor("#704c05")
    .text("STATUS", 444, 48);
  doc
    .font("Helvetica-Bold")
    .fontSize(15)
    .fillColor("#704c05")
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

  const partyGap = 16;
  const partyWidth = (contentWidth(doc) - partyGap) / 2;
  const partyDetailsCardHeight = Math.max(
    partyDetailsHeight(doc, creator, partyWidth),
    partyDetailsHeight(doc, counterparty, partyWidth)
  );
  ensureRoom(doc, partyDetailsCardHeight + 20);
  const partyY = doc.y + 6;
  partyDetailsCard(doc, "Creator", creator, doc.page.margins.left, partyY, partyWidth, partyDetailsCardHeight);
  partyDetailsCard(
    doc,
    "Counterparty",
    counterparty,
    doc.page.margins.left + partyWidth + partyGap,
    partyY,
    partyWidth,
    partyDetailsCardHeight
  );
  doc.y = partyY + partyDetailsCardHeight + 12;

  const signatureCardHeight = 124;
  ensureRoom(doc, signatureCardHeight + 20);
  const signatureY = doc.y + 6;
  partySignatureCard(doc, creator, doc.page.margins.left, signatureY, partyWidth, signatureCardHeight);
  partySignatureCard(
    doc,
    counterparty,
    doc.page.margins.left + partyWidth + partyGap,
    signatureY,
    partyWidth,
    signatureCardHeight
  );
  doc.y = signatureY + signatureCardHeight + 18;

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
        { parties: { some: { userId: session.id } } },
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
  const filenameBase = safeFilename(agreement.title) || safeFilename(agreement.referenceNumber) || "kasulatan-agreement";
  const filename = `${filenameBase}.pdf`;

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
