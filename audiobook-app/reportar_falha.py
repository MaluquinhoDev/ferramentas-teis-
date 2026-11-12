import json, os, urllib.error, urllib.request
job_id=os.environ.get("JOB_ID","")
base=os.environ.get("WORKER_URL","").rstrip("/")
secret=os.environ.get("WORKER_SHARED_SECRET","")
if job_id and base and secret:
    request=urllib.request.Request(
        f"{base}/internal/jobs/{job_id}/status",
        data=json.dumps({"status":"failed","message":"A execução do GitHub Actions terminou com erro. Consulte os logs da execução."}).encode(),
        headers={"Authorization":f"Bearer {secret}","Content-Type":"application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(request,timeout=20) as response: print(response.read().decode())
    except Exception as error:
        print(f"Não foi possível atualizar o status no Worker: {error}")
