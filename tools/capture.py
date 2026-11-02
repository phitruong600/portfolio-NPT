# Chụp lại trang cho film 3D sau khi sửa nội dung index.html.
# Cài một lần: pip install playwright pillow  &&  python -m playwright install chromium
# Chạy: python tools/capture.py
import sys, asyncio, os, json, io
sys.path.insert(0, os.path.dirname(__file__))
from srv import serve
from playwright.async_api import async_playwright
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'); OUT=os.path.join(ROOT,'assets','film'); PAD=28; BAND=1024; OV=16
os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT): os.remove(os.path.join(OUT,f))
JS_MEASURE = """()=>{
 const R=e=>{const b=e.getBoundingClientRect();return {x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}};
 const els=[...document.querySelectorAll('[data-layer]:not([data-layer=tile-hi])')];
 const layers=els.map((e,i)=>{e.dataset.lid='L'+i; const cs=getComputedStyle(e);
   return {id:'L'+i,kind:e.dataset.layer,role:e.dataset.role||'',r:parseFloat(cs.borderTopLeftRadius)||0,...R(e),
           label:(e.innerText||'').trim().slice(0,28)}});
 const line=(el)=>{const r=document.createRange(); const n=el.firstChild; r.setStart(n,0); r.setEnd(n,n.textContent.trimEnd().length); const b=r.getBoundingClientRect(); return {y:b.top+scrollY,h:b.height}};
 const sec=id=>R(document.getElementById(id));
 const about=document.querySelector('#about .h2'), ft=document.getElementById('footer-title');
 return {H:document.documentElement.scrollHeight, W:document.documentElement.scrollWidth, layers,
   hero:sec('hero'), sections:Object.fromEntries([...document.querySelectorAll('main > section[id]')].map(s=>[s.id,sec(s.id)])),
   marks:{s2Title:R(about), footerTitle:line(ft)}};
}"""
async def main():
    httpd,url=serve(ROOT)
    async with async_playwright() as p:
        exe=os.environ.get('CHROME')
        b=await p.chromium.launch(executable_path=exe) if exe else await p.chromium.launch()
        pg=await b.new_page(viewport={'width':1440,'height':900},device_scale_factor=2)
        await pg.goto(url+'/index.html?capture', wait_until='networkidle'); await pg.evaluate("document.fonts.ready")
        await pg.evaluate("async()=>{for(let y=0;y<document.body.scrollHeight;y+=500){scrollTo(0,y);await new Promise(r=>setTimeout(r,60))} scrollTo(0,document.body.scrollHeight); await new Promise(r=>setTimeout(r,300)); scrollTo(0,0)}")
        await pg.evaluate("Promise.all([...document.images].map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r})))")
        await pg.wait_for_timeout(400)
        info=await pg.evaluate(JS_MEASURE)
        H=info['H']; print('page',info['W'],H,'layers',len(info['layers']))
        # hero card (layers on) for the static fallback
        hero_h=info['hero']['y']+info['hero']['h']
        png=await pg.screenshot(clip={'x':0,'y':0,'width':1440,'height':hero_h}, full_page=True)
        im=Image.open(io.BytesIO(png)).convert('RGB'); im.resize((2036, round(im.height*2036/im.width)), Image.LANCZOS).save(f'{OUT}/hero-card.webp', quality=86, method=6)
        # full page without layers
        await pg.evaluate("document.documentElement.classList.add('layers-off')"); await pg.wait_for_timeout(200)
        png=await pg.screenshot(full_page=True)
        full=Image.open(io.BytesIO(png)).convert('RGB'); print('full',full.size)
        bands=[]; y=0; k=0
        while y < H:
            y1=min(H,y+BAND); a=max(0,y-OV); b2=min(H,y1+OV)
            crop=full.crop((0,a*2,2880,b2*2))
            crop.save(f'{OUT}/p2_{k}.webp', quality=90, method=6)
            crop.resize((1440,(b2-a)), Image.LANCZOS).save(f'{OUT}/p1_{k}.webp', quality=88, method=6)
            bands.append({'y0':y,'y1':y1,'a':a,'b':b2,'s2':f'p2_{k}.webp','s1':f'p1_{k}.webp'}); y=y1; k+=1
        await pg.evaluate("document.documentElement.classList.remove('layers-off');document.documentElement.classList.add('solo')")
        # each layer alone on transparent
        out_layers=[]
        for L in info['layers']+[{'id':'TILE','kind':'tile-hi'}]:
            sel=f"[data-lid='{L['id']}']" if L['id']!='TILE' else "[data-layer='tile-hi']"
            await pg.evaluate(f"""()=>{{document.querySelectorAll('[data-solo]').forEach(e=>e.removeAttribute('data-solo'));document.querySelector("{sel}").setAttribute('data-solo','')}}""")
            r=await pg.evaluate(f"""()=>{{const b=document.querySelector("{sel}").getBoundingClientRect();return {{x:b.left+scrollX,y:b.top+scrollY,w:b.width,h:b.height}}}}""")
            clip={'x':r['x']-PAD,'y':r['y']-PAD,'width':r['w']+2*PAD,'height':r['h']+2*PAD}
            png=await pg.screenshot(clip=clip, full_page=True, omit_background=True)
            im=Image.open(io.BytesIO(png)).convert('RGBA')
            name=L['id']
            im.save(f'{OUT}/{name}@2.webp', quality=90, method=6)
            im.resize((max(1,im.width//2),max(1,im.height//2)), Image.LANCZOS).save(f'{OUT}/{name}@1.webp', quality=88, method=6)
            if L['id']=='TILE': tile={'w':r['w'],'h':r['h'],'pad':PAD,'r':r['w']*0.28}
            else: out_layers.append({**L,'pad':PAD})
        data={'W':1440,'H':H,'hero':info['hero'],'heroBottom':hero_h,'sections':info['sections'],'marks':info['marks'],'bands':bands,'layers':out_layers,'tile':tile}
        json.dump(data,open(f'{OUT}/layers.json','w',encoding='utf-8'),indent=1,ensure_ascii=False)
        await b.close()
    httpd.shutdown()
asyncio.run(main())
