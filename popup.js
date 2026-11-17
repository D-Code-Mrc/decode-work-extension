async function loadTabContext() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  document.getElementById("url").value = tab.url || "";
  document.getElementById("title").value = tab.title || "Capture web";
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection()?.toString() || "",
    });
    if (result) document.getElementById("selection").value = result;
  } catch {
    /* restricted pages */
  }
}

async function sendClip() {
  const status = document.getElementById("status");
  status.textContent = "Envoi…";
  const base = document.getElementById("baseUrl").value.replace(/\/$/, "");
  try {
    void chrome.storage.local.set({ decodeWorkBaseUrl: base });
  } catch {
    /* ignore */
  }
  const payload = {
    url: document.getElementById("url").value,
    title: document.getElementById("title").value,
    selection: document.getElementById("selection").value,
    note: document.getElementById("note").value,
  };
  try {
    const res = await fetch(`${base}/api/v1/import/clip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      status.textContent = data.message || data.error || `Erreur ${res.status}`;
      return;
    }
    status.textContent = `Page créée : ${data.page_url}`;
  } catch (e) {
    status.textContent = e instanceof Error ? e.message : "Échec réseau";
  }
}

document.getElementById("send").addEventListener("click", sendClip);
loadTabContext();
