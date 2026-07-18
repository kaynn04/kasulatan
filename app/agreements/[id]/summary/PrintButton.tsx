"use client";

import styles from "../../workflow.module.css";

export default function PrintButton({ pdfHref }: { pdfHref: string }) {
  return (
    <div className={styles.printActions}>
      <button type="button" onClick={() => window.print()} className={styles.printButton}>Print</button>
      <a href={pdfHref} className={styles.downloadButton}>Download PDF</a>
    </div>
  );
}
