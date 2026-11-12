import os, urllib.request
job_id=os.environ["JOB_ID"]
base=os.environ["WORKER_URL"].rstrip("/")
secret=os.environ["WORKER_SHARED_SECRET"]
path="/tmp/audiobook.mp3"
with open(path,"rb") as audio:
    request=urllib.request.Request(
        f"{base}/internal/jobs/{job_id}/audio",
        data=audio.read(),
        headers={"Authorization":f"Bearer {secret}","Content-Type":"audio/mpeg"},
        method="POST"
    )
    with urllib.request.urlopen(request,timeout=180) as response:
        print(response.read().decode("utf-8"))
