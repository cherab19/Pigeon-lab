import { pdfjs } from "react-pdf";

// Use CDN worker matching installed pdfjs-dist version
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
