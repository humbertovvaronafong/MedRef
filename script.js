// script.js

let citationFormats = [];
const historyEvents = [];

// Show/hide messages
function showMessage(text, type = "loading") {
  const area = document.getElementById("messageArea");
  area.textContent = text;
  area.className = `message-${type}`;
  area.classList.remove("hidden");
}
function hideMessage() {
  document.getElementById("messageArea").classList.add("hidden");
}

// Render history with spacing
function renderHistory() {
  const list = document.getElementById("historyList");
  list.innerHTML = "";
  historyEvents.forEach((htmlCitation, idx) => {
    const li = document.createElement("li");
    li.innerHTML = htmlCitation;
    list.appendChild(li);
    if (idx < historyEvents.length - 1) {
      list.appendChild(document.createElement("br"));
      list.appendChild(document.createElement("br"));
    }
  });
}

// Strip HTML helper
function stripHtml(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

// Export history
function exportHistory() {
  if (!historyEvents.length) {
    showMessage("No history to export.", "error");
    return;
  }
  const plain = historyEvents.map(stripHtml).join("\n\n");
  const blob = new Blob([plain], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "history.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showMessage("History exported as history.txt", "success");
  setTimeout(hideMessage, 2000);
}

// Clear history
function clearHistory() {
  historyEvents.length = 0;
  renderHistory();
  showMessage("History cleared.", "success");
  setTimeout(hideMessage, 2000);
}

// Copy history: strip HTML and leading whitespace
async function copyHistory() {
  if (!historyEvents.length) {
    showMessage("No history to copy.", "error");
    return;
  }
  const plain = historyEvents
    .map(stripHtml)
    .map((text) => text.replace(/^\s+/, ""))
    .join("\n\n");
  try {
    await navigator.clipboard.writeText(plain);
    showMessage("History copied to clipboard.", "success");
    setTimeout(hideMessage, 2000);
  } catch (err) {
    console.error(err);
    showMessage("Error copying history.", "error");
  }
}

// Sort history: strip leading whitespace then sort
function sortHistory() {
  historyEvents.sort((a, b) => {
    const ta = stripHtml(a).replace(/^\s+/, "").toLowerCase();
    const tb = stripHtml(b).replace(/^\s+/, "").toLowerCase();
    return ta.localeCompare(tb);
  });
  renderHistory();
  showMessage("History sorted alphabetically.", "success");
  setTimeout(hideMessage, 2000);
}

// Load formats.json
async function loadFormats() {
  try {
    const resp = await fetch("citation_formats.json");
    if (!resp.ok) throw new Error(resp.statusText);
    const data = await resp.json();
    citationFormats = data.formats;
    populateStyleSelect();
  } catch (err) {
    console.error(err);
    showMessage("Error loading formats.json.", "error");
  }
}

// Populate select
function populateStyleSelect() {
  const styleSelect = document.getElementById("styleSelect");
  const formatInfo = document.getElementById("formatInfo");
  styleSelect.innerHTML = "";
  citationFormats.forEach((fmt) => {
    const opt = document.createElement("option");
    opt.value = fmt.cslId;
    opt.textContent = fmt.name;
    opt.dataset.formatId = fmt.id;
    styleSelect.appendChild(opt);
  });
  styleSelect.addEventListener("change", () => {
    const selId =
      styleSelect.options[styleSelect.selectedIndex].dataset.formatId;
    const fmt = citationFormats.find((f) => f.id === selId);
    if (fmt) {
      formatInfo.innerHTML = `<strong>Description:</strong> ${fmt.description}<br>
                              <strong>Example:</strong> <em>${fmt.example}</em>`;
      formatInfo.classList.remove("hidden");
    } else {
      formatInfo.classList.add("hidden");
    }
  });
  styleSelect.dispatchEvent(new Event("change"));
}

// Load locale XML
let currentLocaleXml = null;
async function getLocaleXml(langFile = "locales-en-US.xml") {
  if (currentLocaleXml) return currentLocaleXml;
  const resp = await fetch(
    `https://raw.githubusercontent.com/citation-style-language/locales/master/${langFile}`
  );
  if (!resp.ok) throw new Error(resp.statusText);
  currentLocaleXml = await resp.text();
  return currentLocaleXml;
}

// Clean citation HTML per style
function cleanCitationHtml(rawHtml, styleKey) {
  let cleaned = rawHtml.replace(/^\s*\[1\]\s*/, ""); // strip [1]
  if (styleKey === "vancouver" || styleKey === "american-medical-association") {
    cleaned = cleaned.replace(/^\s*1\.\s*/, ""); // strip leading "1."
  }
  if (styleKey === "modern-language-association") {
    cleaned = cleaned.replace(/Crossref,/g, ""); // remove Crossref,
  }
  if (styleKey === "ieee") {
    cleaned = cleaned.replace(/^\s*\[1\]\s*/, ""); // also strip [1] for IEEE
  }
  return cleaned;
}

// Format citation and record history
async function formatCitation(currentCslData) {
  if (typeof CSL === "undefined") {
    showMessage("citeproc-js not available.", "error");
    return;
  }
  const styleKey = document.getElementById("styleSelect").value;
  const styleResp = await fetch(
    `https://raw.githubusercontent.com/citation-style-language/styles/master/${styleKey}.csl`
  );
  if (!styleResp.ok) throw new Error(styleResp.statusText);
  const styleXml = await styleResp.text();
  const localeXml = await getLocaleXml();

  const item = Array.isArray(currentCslData)
    ? currentCslData[0]
    : currentCslData.message || currentCslData.items?.[0] || currentCslData;
  if (!item.id) item.id = item.DOI || "ITEM-1";

  const sys = {
    retrieveLocale: () => localeXml,
    retrieveItem: (id) => (id === item.id ? item : null),
  };

  const engine = new CSL.Engine(sys, styleXml, "en-US");
  engine.updateItems([item.id]);
  const bib = engine.makeBibliography();

  if (bib && bib[1].length) {
    const rawHtml = bib[1][0];
    const cleanedHtml = cleanCitationHtml(rawHtml, styleKey);

    document.getElementById("formattedCitationOutput").innerHTML = cleanedHtml;
    if (!historyEvents.includes(cleanedHtml)) {
      historyEvents.push(cleanedHtml);
      renderHistory();
    }

    showMessage("Citation generated!", "success");
    setTimeout(hideMessage, 3000);
  } else {
    throw new Error("The citation could not be generated.");
  }
}

// DOI regex
const doiRegex = /^10\.\d{4,9}\/\S+$/i;

// Paste DOI
async function handlePaste() {
  try {
    let text = await navigator.clipboard.readText();
    text = text.replace(/\s+/g, "");
    const prefix = "https://doi.org/";
    if (text.startsWith(prefix)) text = text.slice(prefix.length);
    if (!doiRegex.test(text.trim())) {
      showMessage("Clipboard text is not a valid DOI.", "error");
      return;
    }
    document.getElementById("doiInput").value = text.trim();
    showMessage("DOI pasted correctly.", "success");
    setTimeout(hideMessage, 2000);
  } catch (err) {
    console.error(err);
    showMessage("Could not read from clipboard.", "error");
  }
}

// Generate citation workflow
async function handleGenerate() {
  const doi = document.getElementById("doiInput").value.trim();
  if (!doi) {
    showMessage("Enter a DOI.", "error");
    return;
  }
  showMessage("Getting metadata…", "loading");
  try {
    const cslResp = await fetch(
      `https://api.crossref.org/works/${encodeURIComponent(
        doi
      )}/transform/application/vnd.citationstyles.csl+json`
    );
    if (!cslResp.ok) throw new Error("DOI not found.");
    const cslData = await cslResp.json();

    const bibResp = await fetch(
      `https://api.crossref.org/works/${encodeURIComponent(
        doi
      )}/transform/application/x-bibtex`
    );
    const bibText = bibResp.ok ? await bibResp.text() : "Could not get BibTeX.";
    document.getElementById("bibtexOutput").textContent = bibText;

    await formatCitation(cslData);
  } catch (err) {
    console.error(err);
    document.getElementById(
      "formattedCitationOutput"
    ).textContent = `Error: ${err.message}`;
    showMessage(err.message, "error");
  }
}

// Copy formatted citation
async function copyCitation() {
  const text = document
    .getElementById("formattedCitationOutput")
    .innerText.trim();
  if (!text) {
    showMessage("No citation to copy.", "error");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    showMessage("Citation copied to clipboard!", "success");
    setTimeout(hideMessage, 2000);
  } catch (err) {
    console.error(err);
    showMessage("Error copying citation.", "error");
  }
}

// Initialization
window.addEventListener("DOMContentLoaded", () => {
  loadFormats();
  document.getElementById("pasteButton").addEventListener("click", handlePaste);
  document
    .getElementById("generateButton")
    .addEventListener("click", handleGenerate);
  document
    .getElementById("exportHistoryButton")
    .addEventListener("click", exportHistory);
  document
    .getElementById("copyHistoryButton")
    .addEventListener("click", copyHistory);
  document
    .getElementById("sortHistoryButton")
    .addEventListener("click", sortHistory);
  document
    .getElementById("clearHistoryButton")
    .addEventListener("click", clearHistory);

  renderHistory();
});
