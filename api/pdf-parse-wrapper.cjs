let cachedMod = null;

async function getPDFParseClass() {
  if (!cachedMod) {
    cachedMod = await import('pdf-parse');
  }
  const mod = cachedMod;
  const PDFParse = mod.PDFParse || mod.default?.PDFParse || mod.default;
  if (typeof PDFParse !== 'function') {
    throw new Error('PDFParse is not a function');
  }
  return PDFParse;
}

async function pdfParse(data, options = {}) {
  const PDFParse = await getPDFParseClass();
  const loadParams = { data: new Uint8Array(data) };
  if (options.password && String(options.password).trim() !== '') {
    loadParams.password = String(options.password).trim();
  }
  
  const parser = new PDFParse(loadParams);
  try {
    const result = await parser.getText();
    if (typeof result === 'string') {
      return { text: result };
    }
    if (result && typeof result.text === 'string') {
      return result;
    }
    return { text: '' };
  } finally {
    if (typeof parser.destroy === 'function') {
      try {
        await parser.destroy();
      } catch (e) {
        // swallow cleanup errors
      }
    }
  }
}

module.exports = pdfParse;
module.exports.default = pdfParse;
