// Direct PDF text extraction using pure JS pdfjs-dist, completely bypassing native canvas module load failures.
let cachedLib = null;

async function getPdfjsLib() {
  if (!cachedLib) {
    cachedLib = await import('pdfjs-dist');
  }
  return cachedLib;
}

async function pdfParse(data, options = {}) {
  const pdfjsLib = await getPdfjsLib();
  
  // Set the workerSrc dynamically to the correct path
  try {
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      const workerModule = await import('pdfjs-dist/build/pdf.worker.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;
    }
  } catch (workerErr) {
    console.warn("Failed to set pdfjs-dist workerSrc:", workerErr);
  }

  const loadParams = {
    data: new Uint8Array(data),
    useSystemArr: true,
    disableFontFace: true,
    ignoreErrors: true
  };

  const trimmedPassword = options.password ? String(options.password).trim() : "";
  if (trimmedPassword) {
    loadParams.password = trimmedPassword;
  }

  const loadingTask = pdfjsLib.getDocument(loadParams);
  
  let pdfDocument;
  try {
    pdfDocument = await loadingTask.promise;
  } catch (err) {
    const errName = err.name || "";
    const errMsg = err.message || String(err);
    
    // Map standard PDF.js PasswordException so portfolio-audit.ts handles it gracefully
    if (errName === "PasswordException" || errMsg.toLowerCase().includes("password") || errMsg.toLowerCase().includes("decrypt")) {
      const passErr = new Error(errMsg || "PasswordException: Incorrect or missing password.");
      passErr.name = "PasswordException";
      throw passErr;
    }
    throw err;
  }

  try {
    let textContent = "";
    const numPages = pdfDocument.numPages;

    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await pdfDocument.getPage(i);
        const pageTextContent = await page.getTextContent();
        const pageText = pageTextContent.items
          .map(item => item.str)
          .join(" ");
        textContent += pageText + "\n";
      } catch (pageErr) {
        console.warn(`[PDF Parser] Error parsing page ${i}:`, pageErr);
      }
    }

    return { text: textContent };
  } finally {
    if (pdfDocument) {
      try {
        await pdfDocument.destroy();
      } catch (destroyErr) {
        // Safe discard
      }
    }
  }
}

module.exports = pdfParse;
module.exports.default = pdfParse;
