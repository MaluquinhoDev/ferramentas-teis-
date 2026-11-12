(() => {
  const config = window.APP_CONFIG || {};
  const apiBase = (config.API_BASE_URL || "").replace(/\/$/, "");
  const textEl = document.querySelector("#text");
  const fileEl = document.querySelector("#file");
  const countEl = document.querySelector("#count");
  const speedEl = document.querySelector("#speed");
  const speedValue = document.querySelector("#speed-value");
  const submit = document.querySelector("#submit");
  const jobPanel = document.querySelector("#job");
  const heading = document.querySelector("#job-heading");
  const state = document.querySelector("#state");
  const message = document.querySelector("#job-message");
  const progress = document.querySelector("#progress-bar");
  const jobIdEl = document.querySelector("#job-id");
  const download = document.querySelector("#download");
  const runLink = document.querySelector("#run-link");
  let pollHandle = null;

  const fmt = n => n.toLocaleString("pt-BR");
  function updateCount() { countEl.textContent = fmt(textEl.value.length) + " / 120.000 caracteres"; }
  textEl.addEventListener("input", updateCount);
  speedEl.addEventListener("input", () => { speedValue.value = Number(speedEl.value).toLocaleString("pt-BR", {minimumFractionDigits:1,maximumFractionDigits:2}) + "×"; });
  fileEl.addEventListener("change", async () => {
    const file = fileEl.files && fileEl.files[0];
    if (!file) return;
    if (file.size > 700000) { alert("O arquivo é maior que 700 KB."); fileEl.value = ""; return; }
    textEl.value = await file.text();
    updateCount();
  });

  function showJob(id, runUrl) {
    jobPanel.hidden = false;
    heading.textContent = "Audiobook em preparação";
    state.textContent = "Na fila";
    message.textContent = "O pedido foi recebido. O GitHub Actions está preparando a voz e convertendo o texto.";
    progress.style.width = "12%";
    jobIdEl.textContent = "Identificador: " + id;
    download.hidden = true;
    runLink.href = runUrl || "#";
    runLink.hidden = !runUrl;
    jobPanel.scrollIntoView({behavior:"smooth",block:"nearest"});
  }

  async function poll(id) {
    try {
      const response = await fetch(apiBase + "/api/jobs/" + encodeURIComponent(id), {cache:"no-store"});
      if (!response.ok) throw new Error("Não foi possível consultar o processamento.");
      const data = await response.json();
      if (data.status === "completed") {
        clearInterval(pollHandle);
        heading.textContent = "Audiobook concluído";
        state.textContent = "Pronto";
        state.style.color = "var(--accent)";
        message.textContent = "O MP3 foi gerado e está disponível para baixar.";
        progress.style.width = "100%";
        download.href = apiBase + "/api/jobs/" + encodeURIComponent(id) + "/audio";
        download.hidden = false;
      } else if (data.status === "failed") {
        clearInterval(pollHandle);
        heading.textContent = "A conversão falhou";
        state.textContent = "Erro";
        state.style.color = "#ff9b9b";
        message.textContent = data.message || "O processamento terminou com erro. Consulte a execução do GitHub Actions.";
        progress.style.width = "100%";
      } else {
        state.textContent = data.status === "processing" ? "Convertendo" : "Na fila";
        progress.style.width = data.status === "processing" ? "58%" : "24%";
        message.textContent = data.status === "processing" ? "O texto está sendo convertido em áudio." : "A solicitação aguarda um executor do GitHub Actions.";
      }
    } catch (error) {
      message.textContent = error.message || "Falha temporária ao consultar o status.";
    }
  }

  submit.addEventListener("click", async () => {
    const text = textEl.value.trim();
    if (!apiBase || apiBase.includes("COLOQUE-SEU-WORKER")) { alert("O serviço ainda não foi configurado."); return; }
    if (!text) { alert("Insira o texto que será convertido."); textEl.focus(); return; }
    if (text.length > 120000) { alert("O limite é de 120.000 caracteres por audiobook."); return; }
    submit.disabled = true;
    submit.textContent = "Enviando solicitação…";
    try {
      const response = await fetch(apiBase + "/api/jobs", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({text, speed:Number(speedEl.value)})
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível enviar o texto.");
      if (pollHandle) clearInterval(pollHandle);
      showJob(data.id, data.run_url);
      await poll(data.id);
      pollHandle = setInterval(() => poll(data.id), 5000);
    } catch (error) {
      alert(error.message || "Falha ao enviar a solicitação.");
    } finally {
      submit.disabled = false;
      submit.innerHTML = 'Gerar audiobook <span aria-hidden="true">→</span>';
    }
  });

  if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  updateCount();
})();