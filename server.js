const express=require("express");
const app=express();
const port=process.env.PORT||8080;
const radar=process.env.RADAR_URL||"http://host.docker.internal:5080";

async function getJson(path){
  try{
    const r=await fetch(`${radar}${path}`,{signal:AbortSignal.timeout(3000)});
    const text=await r.text();
    let body=null;
    try{body=JSON.parse(text)}catch{}
    return {status:r.status,ok:r.ok,body};
  }catch(error){
    return {status:0,ok:false,body:null,error:error.message};
  }
}

app.use(express.static("public"));

app.get("/api/warroom",async(_req,res)=>{
  const [health,status,events]=await Promise.all([
    getJson("/health"),
    getJson("/api/status"),
    getJson("/api/events")
  ]);

  res.json({
    timestampUtc:new Date().toISOString(),
    radar:{
      health:health.status===200?"UP":"DOWN",
      api:status.ok?"UP":"DOWN",
      capabilities:status.body,
      events:Array.isArray(events.body)?events.body.slice(0,25):[]
    }
  });
});

app.listen(port,()=>console.log(`WPWW War Room listening on :${port}`));
