const JSON_HEADERS = {"content-type":"application/json; charset=utf-8"};
const MAX_TEXT = 120000;
const cors = origin => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin"
});
const json = (data, status=200, origin="*") => new Response(JSON.stringify(data), {status,headers:{...JSON_HEADERS,...cors(origin)}});
const validId = id => /^[0-9a-f-]{36}$/i.test(id);

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = env.ALLOWED_ORIGIN || "*";
    const responseOrigin = !origin ? allowed : (allowed === "*" || origin === allowed ? (allowed === "*" ? "*" : allowed) : "null");
    if (request.method === "OPTIONS") return new Response(null,{status:204,headers:cors(responseOrigin)});
    if (responseOrigin === "null") return json({error:"Origem não autorizada."},403,"null");
    const url = new URL(request.url);
    const parts = url.pathname.split("/").filter(Boolean);

    if (parts[0] === "internal") {
      if (request.headers.get("Authorization") !== "Bearer " + env.SHARED_SECRET) return json({error:"Não autorizado."},401,responseOrigin);
      const id = parts[2];
      if (!validId(id)) return json({error:"Identificador inválido."},400,responseOrigin);
      const inputKey = "jobs/" + id + "/input.json";
      const statusKey = "jobs/" + id + "/status.json";
      if (parts[1] === "jobs" && parts[3] === "input" && request.method === "GET") {
        const object = await env.AUDIO_JOBS.get(inputKey);
        if (!object) return json({error:"Solicitação não encontrada."},404,responseOrigin);
        return new Response(object.body,{headers:{...cors(responseOrigin),"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
      }
      if (parts[1] === "jobs" && parts[3] === "status" && request.method === "POST") {
        const body = await request.json();
        const status = ["processing","failed"].includes(body.status) ? body.status : null;
        if (!status) return json({error:"Status inválido."},400,responseOrigin);
        await env.AUDIO_JOBS.put(statusKey,JSON.stringify({status,message:String(body.message || "").slice(0,500),updated_at:new Date().toISOString()}));
        return json({ok:true},200,responseOrigin);
      }
      if (parts[1] === "jobs" && parts[3] === "audio" && request.method === "POST") {
        if (!request.body) return json({error:"Áudio vazio."},400,responseOrigin);
        await env.AUDIO_JOBS.put("jobs/" + id + "/audio.mp3",request.body,{httpMetadata:{contentType:"audio/mpeg",contentDisposition:'attachment; filename="audiobook.mp3"'}});
        await env.AUDIO_JOBS.put(statusKey,JSON.stringify({status:"completed",updated_at:new Date().toISOString()}));
        await env.AUDIO_JOBS.delete(inputKey);
        return json({ok:true},200,responseOrigin);
      }
      return json({error:"Rota interna inexistente."},404,responseOrigin);
    }

    if (parts[0] === "api" && parts[1] === "jobs" && request.method === "POST" && parts.length === 2) {
      let body;
      try { body = await request.json(); } catch { return json({error:"JSON inválido."},400,responseOrigin); }
      const text = typeof body.text === "string" ? body.text.trim() : "";
      if (!text) return json({error:"O texto está vazio."},400,responseOrigin);
      if (text.length > MAX_TEXT) return json({error:"O limite é de 120.000 caracteres."},413,responseOrigin);
      const speed = Number(body.speed || 1);
      if (!Number.isFinite(speed) || speed < 0.8 || speed > 1.3) return json({error:"Velocidade fora do intervalo permitido."},400,responseOrigin);
      const id = crypto.randomUUID();
      const payload = {text,speed,created_at:new Date().toISOString()};
      await env.AUDIO_JOBS.put("jobs/" + id + "/input.json",JSON.stringify(payload));
      await env.AUDIO_JOBS.put("jobs/" + id + "/status.json",JSON.stringify({status:"queued",created_at:payload.created_at}));
      const api = "https://api.github.com/repos/" + env.GITHUB_OWNER + "/" + env.GITHUB_REPO + "/actions/workflows/" + env.GITHUB_WORKFLOW_FILE + "/dispatches";
      const dispatch = await fetch(api,{method:"POST",headers:{
        "Authorization":"Bearer " + env.GITHUB_TOKEN,
        "Accept":"application/vnd.github+json",
        "X-GitHub-Api-Version":"2022-11-28",
        "Content-Type":"application/json",
        "User-Agent":"Voz-Audiobook-App"
      },body:JSON.stringify({ref:env.GITHUB_REF || "main",inputs:{job_id:id}})});
      if (!dispatch.ok) {
        await env.AUDIO_JOBS.delete("jobs/" + id + "/input.json");
        await env.AUDIO_JOBS.delete("jobs/" + id + "/status.json");
        return json({error:"O GitHub Actions recusou a solicitação. Verifique a configuração do token e do workflow."},502,responseOrigin);
      }
      return json({id,status:"queued",run_url:"https://github.com/" + env.GITHUB_OWNER + "/" + env.GITHUB_REPO + "/actions"},202,responseOrigin);
    }

    if (parts[0] === "api" && parts[1] === "jobs" && validId(parts[2])) {
      const id = parts[2];
      if (parts.length === 3 && request.method === "GET") {
        const object = await env.AUDIO_JOBS.get("jobs/" + id + "/status.json");
        if (!object) return json({error:"Solicitação não encontrada."},404,responseOrigin);
        return new Response(object.body,{headers:{...cors(responseOrigin),"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
      }
      if (parts.length === 4 && parts[3] === "audio" && request.method === "GET") {
        const object = await env.AUDIO_JOBS.get("jobs/" + id + "/audio.mp3");
        if (!object) return json({error:"O áudio ainda não está disponível."},404,responseOrigin);
        const headers = new Headers(cors(responseOrigin));
        object.writeHttpMetadata(headers);
        headers.set("cache-control","private, no-store");
        headers.set("content-disposition",'attachment; filename="audiobook.mp3"');
        return new Response(object.body,{headers});
      }
    }
    return json({error:"Rota inexistente."},404,responseOrigin);
  }
};