/* ══════════════════════════════════════════════
   Remove Spline watermark by injecting into shadow DOM
   ══════════════════════════════════════════════ */
function killSplineLogo(){
  const sv=document.querySelector('spline-viewer');
  if(!sv||!sv.shadowRoot)return;
  const style=document.createElement('style');
  style.textContent=`
    #logo,a[href*="spline"],canvas+a,[class*="logo"],[id*="logo"],
    a[target="_blank"],div[style*="position: absolute"][style*="bottom"],
    div[style*="position:absolute"][style*="bottom"]
    {display:none!important;opacity:0!important;pointer-events:none!important;}
  `;
  sv.shadowRoot.appendChild(style);
}
window.addEventListener('load',()=>{
  killSplineLogo();
  setTimeout(killSplineLogo,1000);
  setTimeout(killSplineLogo,3000);
});
const _sObs=new MutationObserver(()=>{
  const sv=document.querySelector('spline-viewer');
  if(sv&&sv.shadowRoot){killSplineLogo();_sObs.disconnect();}
});
document.addEventListener('DOMContentLoaded',()=>{
  _sObs.observe(document.body,{childList:true,subtree:true});
  killSplineLogo();
});

/* ══ LOADER — Liquid Ball ══ */
(function(){
  const site=document.getElementById('site');
  const loader=document.getElementById('loader');
  function revealSite(){
    if(!site)return;
    site.classList.add('visible');
    if(loader){loader.style.opacity='0';setTimeout(()=>loader.style.display='none',400);}
    const lb=document.getElementById('lb');
    if(lb)lb.remove();
  }
  const fallbackTimer=setTimeout(revealSite,3500);

  try{
    const ballCanvas=document.getElementById('loaderBallCanvas');
    if(!ballCanvas){revealSite();return;}
    const bCtx=ballCanvas.getContext('2d');
    if(!bCtx){revealSite();return;}
    const ln=document.getElementById('ln');
    const lb=document.getElementById('lb');

    const SIZE=64,R=32;
    let pct=0,waveT=0;

    function ease(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}

    function drawBall(fill){
      bCtx.clearRect(0,0,SIZE,SIZE);
      bCtx.save();
      bCtx.beginPath();bCtx.arc(R,R,R-1,0,Math.PI*2);bCtx.clip();
      bCtx.fillStyle='rgba(0,0,0,0.04)';
      bCtx.fillRect(0,0,SIZE,SIZE);
      const liquidY=SIZE*(1-fill);
      const amp=3*(1-Math.abs(fill*2-1));
      bCtx.beginPath();
      bCtx.moveTo(0,SIZE);
      bCtx.lineTo(0,liquidY);
      for(let x=0;x<=SIZE;x++){
        const y=liquidY+Math.sin(x*0.18+waveT)*amp+Math.sin(x*0.3-waveT*1.3)*amp*0.5;
        bCtx.lineTo(x,y);
      }
      bCtx.lineTo(SIZE,SIZE);
      bCtx.closePath();
      bCtx.fillStyle='#000';
      bCtx.fill();
      const grad=bCtx.createLinearGradient(0,liquidY,0,SIZE);
      grad.addColorStop(0,'rgba(255,255,255,0.08)');
      grad.addColorStop(1,'rgba(255,255,255,0)');
      bCtx.fillStyle=grad;
      bCtx.fillRect(0,liquidY,SIZE,SIZE-liquidY);
      bCtx.restore();
    }

    const t0=performance.now();
    let done=false;

    function tick(now){
      if(done)return;
      const raw=Math.min((now-t0)/2400,1);
      const e=ease(raw);
      pct=Math.floor(e*100);
      waveT=(now-t0)*0.004;
      drawBall(e);
      ln.textContent=pct;
      if(raw<1)requestAnimationFrame(tick);
      else{
        done=true;
        pct=100;ln.textContent=100;
        drawBall(1);
        setTimeout(startFall,300);
      }
    }
    requestAnimationFrame(tick);

    function startFall(){
      const bRect=ballCanvas.getBoundingClientRect();
      const bx=bRect.left+bRect.width/2;
      const by=bRect.top+bRect.height/2;
      lb.style.cssText=`position:fixed;left:${bx}px;top:${by}px;width:64px;height:64px;background:#000;border-radius:50%;transform:translate(-50%,-50%);z-index:1002;display:block;transition:none;`;
      ballCanvas.style.opacity='0';
      lb.getBoundingClientRect();
      lb.style.transition='top 0.5s cubic-bezier(.4,0,1,1)';
      lb.style.top=(window.innerHeight+80)+'px';
      setTimeout(()=>{
        lb.style.transition='none';
        lb.style.top='100%';
        lb.style.left='50%';
        lb.getBoundingClientRect();
        lb.style.transition='width 1.1s cubic-bezier(.2,0,.1,1), height 1.1s cubic-bezier(.2,0,.1,1)';
        lb.style.width='320vmax';
        lb.style.height='320vmax';
        setTimeout(()=>{
          clearTimeout(fallbackTimer);
          site.classList.add('visible');
          loader.style.transition='opacity .3s ease';
          loader.style.opacity='0';
          setTimeout(()=>{
            loader.style.display='none';
            lb.style.display='none';
            lb.remove();
          },350);
        },750);
      },520);
    }
  }catch(err){
    revealSite();
  }
})();

/* ══ TARGET CURSOR ══ */
(function(){
  const wrap=document.getElementById('tcW'),dot=document.getElementById('tcD');
  const corners=[document.getElementById('tcTL'),document.getElementById('tcTR'),document.getElementById('tcBR'),document.getElementById('tcBL')];
  const CS=12,BW=3;let spinTl=null,activeTarget=null,snapTgt=null;
  gsap.set(wrap,{xPercent:-50,yPercent:-50,x:window.innerWidth/2,y:window.innerHeight/2});
  function spin(){if(spinTl)spinTl.kill();spinTl=gsap.timeline({repeat:-1}).to(wrap,{rotation:'+=360',duration:2,ease:'none'});}
  spin();
  window.addEventListener('mousemove',e=>gsap.to(wrap,{x:e.clientX,y:e.clientY,duration:.1,ease:'power3.out'}));
  window.addEventListener('mousedown',()=>{gsap.to(dot,{scale:.7,duration:.2});gsap.to(wrap,{scale:.9,duration:.15});});
  window.addEventListener('mouseup',()=>{gsap.to(dot,{scale:1,duration:.2});gsap.to(wrap,{scale:1,duration:.15});});
  function defCorners(){const p=[{x:-CS*1.5,y:-CS*1.5},{x:CS*.5,y:-CS*1.5},{x:CS*.5,y:CS*.5},{x:-CS*1.5,y:CS*.5}];corners.forEach((c,i)=>gsap.to(c,{x:p[i].x,y:p[i].y,duration:.3,ease:'power3.out'}));}
  function attach(el){
    if(activeTarget===el)return;activeTarget=el;
    spinTl.pause();gsap.set(wrap,{rotation:0});
    const rect=el.getBoundingClientRect(),cx=gsap.getProperty(wrap,'x'),cy=gsap.getProperty(wrap,'y');
    const pts=[{x:rect.left-BW,y:rect.top-BW},{x:rect.right+BW-CS,y:rect.top-BW},{x:rect.right+BW-CS,y:rect.bottom+BW-CS},{x:rect.left-BW,y:rect.bottom+BW-CS}];
    corners.forEach((c,i)=>gsap.to(c,{x:pts[i].x-cx,y:pts[i].y-cy,duration:.25,ease:'power2.out'}));
    snapTgt=pts;
    el.addEventListener('mouseleave',()=>{activeTarget=null;snapTgt=null;defCorners();setTimeout(()=>{if(!activeTarget)spin();},60);},{once:true});
  }
  window.addEventListener('mouseover',e=>{let el=e.target;while(el&&el!==document.body){if(el.matches('.cursor-target')){attach(el);return;}el=el.parentElement;}});
  gsap.ticker.add(()=>{
    if(!snapTgt||!activeTarget)return;
    const cx=gsap.getProperty(wrap,'x'),cy=gsap.getProperty(wrap,'y');
    const rect=activeTarget.getBoundingClientRect();
    const pts=[{x:rect.left-BW,y:rect.top-BW},{x:rect.right+BW-CS,y:rect.top-BW},{x:rect.right+BW-CS,y:rect.bottom+BW-CS},{x:rect.left-BW,y:rect.bottom+BW-CS}];
    corners.forEach((c,i)=>gsap.to(c,{x:pts[i].x-cx,y:pts[i].y-cy,duration:.2,ease:'power1.out',overwrite:'auto'}));
  });
})();

/* ══ TYPEWRITER ══ */
(function(){
  const LINES=['Hi.',"Hope you're doing fine.","I'm Padmesh.","I'm a Cybersecurity Analyst",'& a Web Designer.'];
  const el=document.getElementById('twLine'),hint=document.getElementById('scrollHint');
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const set=t=>{el.innerHTML=t.replace(/ /g,'&nbsp;')+'<span class="tw-cursor"></span>';};
  async function type(t){let c='';set('');for(const ch of t){c+=ch;set(c);await sleep(22);}}
  async function back(t){for(let i=t.length;i>=0;i--){set(t.slice(0,i));await sleep(18);}}
  async function run(){
    await sleep(300);
    for(let i=0;i<LINES.length;i++){
      await type(LINES[i]);
      await sleep(800);
      if(i===LINES.length-1){hint.classList.add('show');break;}
      await back(LINES[i]);
      await sleep(180);
    }
  }
  const mo=new MutationObserver(()=>{if(document.getElementById('site').classList.contains('visible')){mo.disconnect();run();}});
  mo.observe(document.getElementById('site'),{attributes:true,attributeFilter:['class']});
})();

/* ══ FLOWING MENU ══ */
(function(){
  const SI=n=>`https://cdn.simpleicons.org/${n}`;
  const DV=n=>`https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${n}/${n}-original.svg`;

  const items=[
    {text:'Python',tools:[{name:'NumPy',img:DV('numpy')},{name:'Flask',img:DV('flask')},{name:'Pandas',img:DV('pandas')},{name:'Scapy',img:DV('python')},{name:'Requests',img:SI('python')}]},
    {text:'DSA',tools:[{name:'LeetCode',img:SI('leetcode')},{name:'HackerRank',img:SI('hackerrank')},{name:'GraphQL',img:SI('graphql')},{name:'Codeforces',img:SI('codeforces')},{name:'Codechef',img:SI('codechef')}]},
    {text:'Web Development',tools:[{name:'React',img:DV('react')},{name:'Node.js',img:DV('nodejs')},{name:'Tailwind',img:SI('tailwindcss')},{name:'Docker',img:DV('docker')},{name:'TypeScript',img:DV('typescript')}]},
    {text:'Pentesting',tools:[{name:'Burp Suite',img:SI('burpsuite')},{name:'Metasploit',img:SI('metasploit')},{name:'Wireshark',img:SI('wireshark')},{name:'Nmap',img:DV('linux')},{name:'Kali Linux',img:SI('kalilinux')}]},
    {text:'Reverse Engineering',tools:[{name:'IDA Pro',img:SI('intel')},{name:'Ghidra',img:SI('github')},{name:'GDB',img:SI('gnu')},{name:'x64dbg',img:SI('windows')},{name:'Radare2',img:SI('linux')}]},
    {text:'Bug Hunting',tools:[{name:'OWASP ZAP',img:SI('owasp')},{name:'Nuclei',img:SI('go')},{name:'ffuf',img:SI('go')},{name:'HackerOne',img:SI('hackerone')},{name:'Bugcrowd',img:SI('bugcrowd')}]},
    {text:'OS Management',tools:[{name:'Kali Linux',img:SI('kalilinux')},{name:'Arch Linux',img:SI('archlinux')},{name:'Ubuntu',img:SI('ubuntu')},{name:'Debian',img:SI('debian')},{name:'Fedora',img:SI('fedora')}]},
    {text:'Capture The Flag',tools:[{name:'TryHackMe',img:SI('tryhackme')},{name:'HackTheBox',img:SI('hackthebox')},{name:'Wireshark',img:SI('wireshark')},{name:'pwntools',img:SI('python')},{name:'CyberChef',img:SI('javascript')}]},
  ];

  const ul=document.getElementById('flowMenu');
  items.forEach((item,i)=>{
    const li=document.createElement('li');
    li.className='menu-item';
    const singleSet=item.tools.map(tool=>
      `<div class="marquee-part">
        <img class="marquee-logo" src="${tool.img}" alt="${tool.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <span class="marquee-logo-fb" style="display:none;width:36px;height:36px;background:#e8e8e8;border-radius:8px;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#444;flex-shrink:0;">${tool.name.slice(0,2).toUpperCase()}</span>
        <span>${tool.name}</span>
      </div>`
    ).join('');
    const parts=singleSet.repeat(6);
    li.innerHTML=`
      <div class="menu-label">${item.text}</div>
      <div class="marquee-overlay">
        <div class="marquee-track" id="mt${i}">${parts}</div>
      </div>`;
    ul.appendChild(li);
  });

  items.forEach((_,i)=>{
    const t=document.getElementById('mt'+i);
    const dir=i%2===0?-1:1;
    let x=dir===-1?0:-(t.scrollWidth/6);
    (function run(){
      x+=dir*2.5;
      const unit=t.scrollWidth/6;
      if(dir===-1&&x<=-unit)x=0;
      if(dir===1&&x>=0)x=-unit;
      t.style.transform=`translateX(${x}px)`;
      requestAnimationFrame(run);
    })();
  });

  const allItems=document.querySelectorAll('.menu-item');
  allItems.forEach(item=>{
    item.addEventListener('touchstart',(e)=>{
      e.stopPropagation();
      const wasActive=item.classList.contains('mob-active');
      allItems.forEach(i=>i.classList.remove('mob-active'));
      if(!wasActive) item.classList.add('mob-active');
    },{passive:true});
  });
})();

/* ══ INTERNSHIP PREVIEW ══ */
(function(){
  const preview=document.getElementById('internPrev');
  const img=document.getElementById('iPrevImg');
  const lbl=document.getElementById('iPrevLbl');
  let mx=0,my=0;

  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});

  document.querySelectorAll('.intern-card').forEach(card=>{
    card.addEventListener('mouseenter',()=>{
      img.src=card.dataset.preview||'';
      lbl.textContent=card.dataset.label||'';
      preview.classList.add('show');
    });
    card.addEventListener('mousemove',()=>{
      const pw=280,ph=200,pad=20;
      let px=mx+pad,py=my-ph/2;
      if(px+pw>window.innerWidth)px=mx-pw-pad;
      if(py<0)py=0;
      if(py+ph>window.innerHeight)py=window.innerHeight-ph;
      preview.style.left=px+'px';
      preview.style.top=py+'px';
    });
    card.addEventListener('mouseleave',()=>preview.classList.remove('show'));
  });

  const INTERN_DETAILS=[
    {tag:'Internship 01',role:'Cyber Forensics Intern',org:'Police Cyber Department',year:'2024',body:'Embedded with the Police Cyber Department\'s digital forensics unit. Assisted in analysing digital evidence from seized devices, extracting data from damaged drives, recovering deleted files, examining browser histories, and documenting findings for legal proceedings. Learned chain-of-custody procedures, evidence handling protocols, and how cybercrime investigations are structured within law enforcement.',tags:['Forensics']},
    {tag:'Internship 02',role:'Penetration Testing Intern',org:'Hacktify Cyber Security',year:'2024',body:'Worked in an offensive security team running assessments for client web applications. Performed manual and automated vulnerability assessments — identifying SQL injection, XSS, IDOR, broken authentication, and misconfigured servers. Used Burp Suite, OWASP ZAP, and custom scripts to map attack surfaces. Wrote detailed vulnerability reports with CVSS scores and remediation recommendations.',tags:['Offensive Sec']},
    {tag:'Internship 03',role:'Penetration Tester Intern',org:'Human Initials',year:'2024',body:'Conducted security testing on web applications and internal network components. Used Nmap for network mapping, Metasploit for exploitation attempts against test environments, and Burp Suite for web application assessments. Participated in client debriefs and helped translate technical findings into business-impact language.',tags:['Pen Testing']},
    {tag:'Internship 04',role:'VAPT Intern',org:'BCBUZZ',year:'2025',body:'Conducted end-to-end Vulnerability Assessment and Penetration Testing (VAPT) engagements at BCBUZZ. Performed black-box and grey-box assessments across web applications, APIs, and internal network infrastructure. Identified and documented critical vulnerabilities including authentication bypasses, insecure direct object references, and misconfigured server components.',tags:['VAPT']},
    {tag:'Internship 05',role:'Top 1% Global Rank',org:'TryHackMe',year:'2025',body:'Achieved a Top 1% global ranking on TryHackMe through consistent hands-on practice across hundreds of rooms and challenges. Completed structured learning paths covering web exploitation, Active Directory attacks, network security, cryptography, privilege escalation, and blue-team defence.',tags:['Top 1%']},
  ];
  const INTERN_IMGS=['assets/Police station intern.png','assets/Hactify.png','assets/Human initials.png','assets/under.png','assets/TryHackme.png'];

  document.querySelectorAll('.intern-card').forEach((card,i)=>{
    card.addEventListener('click',()=>{
      const d=INTERN_DETAILS[i];
      if(!d)return;
      const modal=document.getElementById('detailModal');
      const modalBox=document.getElementById('modalBox');
      const imgEl=document.getElementById('modalImg');
      const imgPanel=document.getElementById('modalImgPanel');
      document.getElementById('modalTag').textContent=d.tag;
      document.getElementById('modalTitle').textContent=d.role;
      document.getElementById('modalSub').textContent=d.org+' — '+d.year;
      document.getElementById('modalBody').textContent=d.body;
      document.getElementById('modalTagsEl').innerHTML=d.tags.map(t=>`<span class="modal-tag-pill">${t}</span>`).join('');
      document.getElementById('modalImgCat').textContent=d.tag;
      imgEl.src=INTERN_IMGS[i]||'';
      imgPanel.style.display='';
      modalBox.classList.remove('no-img-panel');
      const lnk=document.getElementById('modalLink');
      lnk.style.display='none';
      modal.classList.add('open');
    });
  });
})();

/* ══ CERTIFICATIONS — GRAVITY FIELD ══ */
(function(){
  const CERTS=[
    {num:1,name:'API Documentation Best Practices',issuer:'APISEC University',year:'2025'},
    {num:2,name:'API Authentication',issuer:'APISEC University',year:'2025'},
    {num:3,name:'API Penetration Testing',issuer:'APISEC University',year:'2025'},
    {num:4,name:'API Security Fundamentals',issuer:'APISEC University',year:'2025'},
    {num:5,name:'Building Security into AI',issuer:'APISEC University',year:'2026'},
    {num:6,name:'API Documentation Best Practices',issuer:'APISEC University',year:'2025'},
    {num:7,name:'OWASP API Security Top 10',issuer:'APISEC University',year:'2025'},
    {num:8,name:'Securing API Servers',issuer:'APISEC University',year:'2025'},
    {num:9,name:'Creating With Git',issuer:'Taggart Institute',year:'2025'},
    {num:10,name:'Practical Web Application Security and Testing',issuer:'Taggart Institute',year:'2025'},
    {num:11,name:'Cryptography',issuer:'IT Masters',year:'2025'},
    {num:12,name:'Next-Gen Network Security',issuer:'IT Masters',year:'2025'},
    {num:13,name:'Pen Testing',issuer:'IT Masters',year:'2025'},
    {num:14,name:'Enterprise Cyber Security Fundamentals',issuer:'IT Masters',year:'2025'},
    {num:15,name:'Introduction to Kali Linux Basics',issuer:'Simplilearn',year:'2025'},
    {num:16,name:'Cyber Security and Privacy',issuer:'NPTEL',year:'2025'},
    {num:17,name:'Generative AI Overview for Project Managers',issuer:'PMI',year:'2025'},
    {num:18,name:'Introduction to Cybersecurity',issuer:'Cisco Networking Academy',year:'2025'},
    {num:19,name:'Networking Basics',issuer:'Cisco Networking Academy',year:'2025'},
  ];

  const cv=document.getElementById('certCanvas');
  if(!cv)return;
  const ctx=cv.getContext('2d');
  const sec=document.getElementById('p5');
  const hudNum=document.getElementById('certHudNum');
  const hudLabel=document.getElementById('certHudLabel');
  const focusPanel=document.getElementById('certFocus');
  const cfIssuer=document.getElementById('cfIssuer');
  const cfName=document.getElementById('cfName');
  const cfYear=document.getElementById('cfYear');
  const filtersBar=document.getElementById('certFiltersBar');
  const totalBadge=document.getElementById('certTotalBadge');

  let W,H,nodes=[],mouse={x:null,y:null},hovered=null,activeFilter='All',tick=0;

  function sr(s){return((Math.sin(s*127.1+311.7)*43758.5453)%1+1)%1;}

  function buildNodes(filter){
    const vis=filter==='All'?CERTS:CERTS.filter(c=>c.issuer===filter);
    const n=vis.length;
    const golden=Math.PI*(3-Math.sqrt(5));
    nodes=vis.map((cert,i)=>{
      const theta=golden*i;
      const r=(0.22+0.32*(i/n))*Math.min(W,H);
      const bx=W/2+Math.cos(theta)*r+(sr(i*3+1)*60-30);
      const yFactor=H>W?0.75:0.52;
      const by=H/2+Math.sin(theta)*r*yFactor+(sr(i*3+2)*42-21);
      return{cert,bx,by,x:bx,y:by,vx:0,vy:0,baseR:6+sr(i*7)*4,phase:sr(i*5)*Math.PI*2,spd:0.3+sr(i*11)*.45,op:0,targetOp:1,born:Date.now()+i*30};
    });
    let cur=parseInt(hudNum.textContent)||0;
    const target=n;const step=Math.ceil(Math.abs(target-cur)/18)||1;
    const iv=setInterval(()=>{
      cur+=(target>cur?1:-1)*step;
      if(target>cur?cur>=target:cur<=target){cur=target;clearInterval(iv);}
      hudNum.textContent=cur;
    },40);
    hudLabel.textContent=filter==='All'?'credentials earned':filter+' · '+n+' cert'+(n!==1?'s':'');
    totalBadge.textContent=n+' total';
  }

  function resize(){
    W=cv.width=sec.offsetWidth;H=cv.height=sec.offsetHeight;
    buildNodes(activeFilter);
  }

  const issuers=['All',...new Set(CERTS.map(c=>c.issuer))];
  issuers.forEach(iss=>{
    const b=document.createElement('button');
    b.className='c-filt cursor-target'+(iss==='All'?' on':'');
    b.textContent=iss;
    b.addEventListener('click',()=>{
      activeFilter=iss;
      document.querySelectorAll('.c-filt').forEach(f=>f.classList.remove('on'));
      b.classList.add('on');
      nodes.forEach(n=>n.targetOp=0);
      setTimeout(()=>buildNodes(iss),260);
    });
    filtersBar.appendChild(b);
  });

  cv.addEventListener('mousemove',e=>{
    const rect=cv.getBoundingClientRect();
    mouse.x=e.clientX-rect.left;
    mouse.y=e.clientY-rect.top;
    let best=null,minD=18;
    nodes.forEach((n,i)=>{
      const d=Math.hypot(n.x-mouse.x,n.y-mouse.y);
      if(d<Math.max(n.baseR+14,minD)){minD=d;best=i;}
    });
    if(best!==hovered){
      hovered=best;
      if(best!==null){
        const c=nodes[best].cert;
        cfIssuer.textContent=c.issuer;
        cfName.textContent=c.name;
        cfYear.textContent=c.year;
        focusPanel.classList.add('show');
      }else{
        focusPanel.classList.remove('show');
      }
    }
  });
  cv.addEventListener('mouseleave',()=>{mouse.x=null;mouse.y=null;hovered=null;focusPanel.classList.remove('show');});

  function draw(){
    ctx.clearRect(0,0,W,H);
    tick+=0.009;
    const now=Date.now();
    for(let i=0;i<nodes.length;i++){
      const a=nodes[i];if(a.op<.04)continue;
      for(let j=i+1;j<nodes.length;j++){
        const b=nodes[j];if(b.op<.04)continue;
        if(a.cert.issuer!==b.cert.issuer)continue;
        const d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d>190)continue;
        const isNearA=hovered!==null&&(nodes[hovered]===a||nodes[hovered]===b);
        const al=(1-d/190)*(isNearA?0.28:0.07)*Math.min(a.op,b.op);
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
        ctx.strokeStyle=`rgba(255,255,255,${al})`;
        ctx.lineWidth=isNearA?.8:.4;ctx.stroke();
      }
    }
    nodes.forEach((n,i)=>{
      if(now<n.born)return;
      n.op+=(n.targetOp-n.op)*0.05;
      const fx=Math.sin(tick*n.spd+n.phase)*3;
      const fy=Math.cos(tick*n.spd*.7+n.phase+1)*2.2;
      if(mouse.x!==null){
        const dx=mouse.x-n.x,dy=mouse.y-n.y;
        const dist=Math.hypot(dx,dy);
        const pullR=110;
        if(dist<pullR&&dist>1){
          const f=(1-dist/pullR)*0.16;
          n.vx+=dx/dist*f;n.vy+=dy/dist*f;
        }
      }
      n.vx+=(n.bx+fx-n.x)*0.02;
      n.vy+=(n.by+fy-n.y)*0.02;
      n.vx*=0.78;n.vy*=0.78;
      n.x+=n.vx;n.y+=n.vy;
      const isH=hovered===i;
      const r=isH?n.baseR*2.8:n.baseR;
      const alpha=n.op*(isH?1:0.55);
      if(isH){
        const g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,r*5.5);
        g.addColorStop(0,`rgba(255,255,255,${n.op*.16})`);
        g.addColorStop(1,'rgba(255,255,255,0)');
        ctx.beginPath();ctx.arc(n.x,n.y,r*5.5,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();
        const pulse=1+.1*Math.sin(tick*7);
        ctx.beginPath();ctx.arc(n.x,n.y,r*2*pulse,0,Math.PI*2);
        ctx.strokeStyle=`rgba(255,255,255,${n.op*.3})`;ctx.lineWidth=.8;ctx.stroke();
        ctx.beginPath();ctx.arc(n.x,n.y,r*3.2,0,Math.PI*2);
        ctx.strokeStyle=`rgba(255,255,255,${n.op*.1})`;ctx.lineWidth=.4;ctx.stroke();
      }
      ctx.beginPath();ctx.arc(n.x,n.y,r,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,255,255,${alpha})`;ctx.fill();
      const lbl=n.cert.name.length>22?n.cert.name.slice(0,21)+'…':n.cert.name;
      ctx.save();
      if(isH){
        ctx.font=`italic 500 13px 'Instrument Serif'`;
        ctx.fillStyle=`rgba(255,255,255,${n.op*.9})`;
      }else{
        ctx.font=`300 9px 'DM Mono'`;
        ctx.fillStyle=`rgba(255,255,255,${n.op*.42})`;
      }
      ctx.textAlign='center';ctx.textBaseline='top';
      ctx.fillText(lbl,n.x,n.y+r+5);
      if(n.baseR>=7||isH){
        ctx.font=`500 ${isH?9:7}px 'DM Mono'`;
        ctx.fillStyle=`rgba(0,0,0,${n.op*(isH?.95:.8)})`;
        ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText(String(n.cert.num||''),n.x,n.y);
      }
      ctx.restore();
    });
    requestAnimationFrame(draw);
  }

  /* touch: tap nodes on mobile */
  cv.addEventListener('touchstart',e=>{
    const rect=cv.getBoundingClientRect();
    const t=e.touches[0];
    const tx=(t.clientX-rect.left)*(W/rect.width);
    const ty=(t.clientY-rect.top)*(H/rect.height);
    mouse.x=tx;mouse.y=ty;
    let best=null,minD=28;
    nodes.forEach((n,i)=>{
      const d=Math.hypot(n.x-tx,n.y-ty);
      if(d<Math.max(n.baseR+20,minD)){minD=d;best=i;}
    });
    hovered=best;
    if(best!==null){
      const c=nodes[best].cert;
      cfIssuer.textContent=c.issuer;cfName.textContent=c.name;cfYear.textContent=c.year;
      focusPanel.classList.add('show');
    }else{focusPanel.classList.remove('show');}
  },{passive:true});
  cv.addEventListener('touchend',()=>{setTimeout(()=>{hovered=null;mouse.x=null;mouse.y=null;focusPanel.classList.remove('show');},1800);},{passive:true});

  const sObs=new IntersectionObserver(entries=>{
    if(entries[0].isIntersecting){sObs.disconnect();resize();draw();}
  },{threshold:0.1});
  sObs.observe(sec);
  window.addEventListener('resize',()=>{if(W)resize();});
})();

/* ══ XP DATA & MODAL ══ */

function openDetailModal(tag,title,sub,body,tags,link){
  document.getElementById('modalTag').textContent=tag;
  document.getElementById('modalTitle').textContent=title;
  document.getElementById('modalSub').textContent=sub||'';
  document.getElementById('modalBody').textContent=body;
  document.getElementById('modalTagsEl').innerHTML=(tags||[]).map(t=>`<span class="modal-tag-pill">${t}</span>`).join('');
  document.getElementById('modalImg').src='';
  document.getElementById('modalBox').classList.add('no-img-panel');
  const lnk=document.getElementById('modalLink');
  if(link&&link!=='#'){lnk.href=link;lnk.textContent='Open Project ↗';lnk.classList.remove('disabled');lnk.style.display='';}
  else if(link==='#'){lnk.href='#';lnk.textContent='View Project ↗';lnk.classList.remove('disabled');lnk.style.display='';}
  else{lnk.style.display='none';}
  document.getElementById('detailModal').classList.add('open');
}

function closeDetailModal(){
  document.getElementById('detailModal').classList.remove('open');
}

document.getElementById('modalClose').addEventListener('click',closeDetailModal);
document.getElementById('detailModal').addEventListener('click',e=>{
  if(e.target===document.getElementById('detailModal'))closeDetailModal();
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDetailModal();});

/* ══ EXPERIENCE XCARDS ══ */
(function(){
  const XP=[
    {tag:'Systems',title:'OS Management',sub:'Daily driver across distributions',body:'Arch, Debian, Kali, Ubuntu — not just installed, but maintained over months and years. Configured window managers, package managers, and system services from scratch. Diagnosed boot failures, kernel panics, and hardware conflicts at the OS level. Comfortable in both systemd and runit-based environments. Understand the difference between a working install and a hardened one.',tags:['Arch','Debian','Kali','Ubuntu','systemd']},
    {tag:'Security',title:'Offensive Security & CTF',sub:'Hands-on exploitation, not slides',body:'Competed in CTF challenges spanning web exploitation, binary exploitation, privilege escalation, cryptography, and forensics. Applied real techniques — SQLi, SSRF, XSS, LFI, IDOR, buffer overflows — in sandboxed environments before using them in live bug bounty work. Top 1% on TryHackMe. Built custom tooling when off-the-shelf failed.',tags:['Web Exploitation','Priv-Esc','Crypto','Forensics','CTF']},
    {tag:'Tools',title:'Security Tooling',sub:'Real-world use, not demos',body:'Burp Suite (manual + Intruder + Repeater + Collaborator), Nmap, Metasploit, sqlmap, ffuf, Gobuster, Nikto, Wireshark, Shodan, OWASP ZAP — used against real targets with written scope, not labs. Know when tools lie, when they miss, and when to write a curl command instead. Built custom recon scripts to automate surface mapping.',tags:['Burp Suite','Nmap','sqlmap','ffuf','Metasploit']},
    {tag:'Hardware',title:'Diagnostics & Repair',sub:'Dedcell — component-level triage',body:'Ran Dedcell, a local tech repair service handling laptop and phone hardware failures. Diagnosed faulty RAM, corrupted eMMC, failed display controllers, and charging circuit issues — not by swapping components blindly, but by reading symptoms and narrowing faults. Also handled OS-level hardware issues: driver conflicts, corrupted bootloaders, failing storage mid-session.',tags:['Hardware','Repair','Diagnostics','Embedded']},
    {tag:'AI',title:'Applied AI & Models',sub:'Custom deployment, not just API calls',body:'Deployed and fine-tuned local LLMs (Mistral, LLaMA variants) on constrained hardware. Quantized models to fit GPU VRAM budgets. Built ROOK — a voice assistant that routes between local and cloud inference based on query complexity. Understands token limits, context windows, temperature behavior, and hallucination patterns from direct use, not documentation.',tags:['LLM','Quantization','Local AI','ROOK','Python']},
    {tag:'Web',title:'Web Design & Dev',sub:'Built from layout to deployment',body:'Designed and developed web projects with attention to performance, security, and interaction design. Familiar with vanilla JS, React basics, Tailwind, and writing CSS that does not fight the browser. Security-first approach: no third-party scripts without audit, headers set, no unvalidated input reaching the DOM. This portfolio is one artifact of that.',tags:['JS','CSS','Tailwind','Performance','Security']},
    {tag:'UX',title:'System Ricing & Workflow',sub:'Optimised for speed and clarity',body:'Configured tiling window managers (i3, Hyprland), custom terminal setups (Alacritty, tmux), and keybinding systems designed to eliminate mouse dependency. Every setup is documented and version-controlled — reproducible from scratch in under an hour. Automation via shell scripts and cron. The goal: zero friction between intent and action.',tags:['i3','Hyprland','tmux','Shell','Automation']},
    {tag:'Research',title:'Vulnerability Research',sub:'Bug hunting on live targets',body:'Conducted security assessments on live web applications under responsible disclosure. Found and documented SQL injection, XSS, IDOR, CSRF, authentication bypasses, exposed API keys, and misconfigured cloud storage across multiple targets including Zomato, TNSTC, and inDrive. Wrote structured CVSS-scored reports. One engagement caused a platform-wide outage through a single unauthenticated SQLi — documented and disclosed.',tags:['Bug Bounty','SQLi','IDOR','CSRF','Disclosure']},
  ];
  document.querySelectorAll('.xcard').forEach((card,i)=>{
    card.style.cursor='pointer';
    card.addEventListener('click',()=>{
      const d=XP[i];
      if(!d)return;
      openDetailModal(d.tag,d.title,d.sub,d.body,d.tags,null);
    });
  });
})();

/* ══ FINDER PROJECTS ══ */
(function(){
  const PROJECTS=[
    {id:0,name:'not-this-time',icon:'ti-lock',domain:'Auth · Biometrics',cat:'auth',stack:['Node.js','WebSockets','TS'],status:'ACTIVE',desc:'Renders passwords obsolete. Keystroke rhythm verifies identity — no passwords stored, no hashes.',size:'12.4 KB',modified:'2024-12-01',link:'https://pendulum-j7nc.onrender.com/'},
    {id:1,name:'unveil',icon:'ti-eye',domain:'OSINT · Web Security',cat:'security',stack:['Python','CLI'],status:'ACTIVE',desc:'Full security posture in seconds. Scans headers, certs, subdomains, open redirects, and leaked credentials.',size:'8.1 KB',modified:'2024-11-28',link:'https://github.com/padmesh6119/Unveil'},
    {id:2,name:'revealt',icon:'ti-file-search',domain:'Forensics · Windows',cat:'security',stack:['Hex','Windows','C#'],status:'ACTIVE',desc:'Magic numbers don\'t lie. Extensions do. Reads raw hex to surface truth.',size:'6.7 KB',modified:'2024-11-20',link:'https://github.com/padmesh6119/Revealt'},
    {id:3,name:'proximal-identity-fortress',icon:'ti-cpu',domain:'Hardware · IoT',cat:'hardware',stack:['ESP32','NFC','BLAKE3'],status:'ACTIVE',desc:'NFC + BLAKE3 PUF + Zero Trust. Hardware-bound identity — cloning declared impossible.',size:'18.9 KB',modified:'2024-11-15',link:'https://github.com/padmesh6119/Proximal_Identity_Fortress'},
    {id:4,name:'munch',icon:'ti-terminal',domain:'CTF · CLI Tools',cat:'tools',stack:['CLI','Bash','Go'],status:'ACTIVE',desc:'Base64, Hex, ROT, SHA, MD5 — one chainable CLI. Built for speed under CTF pressure.',size:'4.2 KB',modified:'2024-11-10',link:'https://github.com/padmesh6119/Munch'},
    {id:5,name:'wind0c',icon:'ti-brand-windows',domain:'Systems · Optimisation',cat:'tools',stack:['PowerShell','Windows'],status:'ACTIVE',desc:'Telemetry removed. Bloatware purged. Cortana gone. One script.',size:'3.8 KB',modified:'2024-11-08',link:'#'},
    {id:7,name:'nfc-auth-desk',icon:'ti-device-mobile',domain:'Hardware · Auth',cat:'hardware',stack:['ESP32','NFC','Node'],status:'IN DEV',desc:'Desktop NFC authentication bridge. Tap your card, unlock your session.',size:'11.2 KB',modified:'2024-10-30',link:'#'},
    {id:8,name:'crypto-suite',icon:'ti-lock-code',domain:'Cryptography',cat:'indev',stack:['Python','Cryptography'],status:'IN DEV',desc:'Auto-identifies encryption algorithm from ciphertext structure, then decrypts it.',size:'7.1 KB',modified:'2024-10-20',link:null},
    {id:9,name:'maliketh',icon:'ti-key',domain:'Password Manager',cat:'security',stack:['AES-256-GCM','Zero-Knowledge'],status:'IN DEV',desc:'Zero-knowledge vault — AES-256-GCM local encryption. Master key never leaves the device.',size:'14.3 KB',modified:'2024-10-15',link:null},
  ];

  const section=document.getElementById('p6');
  if(!section)return;

  section.innerHTML=`
  <div class="finder-host"><div class="finder-window">
    <div class="titlebar">
      <div class="traffic-lights"><div class="tl tl-close"></div><div class="tl tl-min"></div><div class="tl tl-max"></div></div>
      <span class="window-title">The Breach Report — Projects</span>
    </div>
    <div class="toolbar">
      <div class="tb-nav">
        <button class="tb-btn"><i class="ti ti-chevron-left" style="font-size:13px"></i></button>
        <button class="tb-btn"><i class="ti ti-chevron-right" style="font-size:13px"></i></button>
      </div>
      <div class="tb-divider"></div>
      <div class="breadcrumb"><span>breach-report</span><span class="breadcrumb-sep">›</span><span class="breadcrumb-active">projects</span></div>
      <div class="tb-view">
        <button class="tb-btn tb-btn--active"><i class="ti ti-layout-grid" style="font-size:13px"></i></button>
        <button class="tb-btn"><i class="ti ti-list" style="font-size:13px"></i></button>
      </div>
    </div>
    <div class="finder-body">
      <div class="finder-sidebar">
        <div class="sidebar-section">
          <div class="sidebar-header">Favourites</div>
          <div class="sidebar-item active" data-cat="all"><i class="ti ti-folder" style="font-size:14px"></i>Projects</div>
          <div class="sidebar-item" data-cat="all"><i class="ti ti-clock" style="font-size:14px"></i>Recent</div>
          <div class="sidebar-item" data-cat="all"><i class="ti ti-star" style="font-size:14px"></i>Starred</div>
        </div>
        <div class="sidebar-section">
          <div class="sidebar-header">Categories</div>
          <div class="sidebar-item" data-cat="auth"><i class="ti ti-lock" style="font-size:14px"></i>Auth</div>
          <div class="sidebar-item" data-cat="security"><i class="ti ti-shield-lock" style="font-size:14px"></i>Security</div>
          <div class="sidebar-item" data-cat="hardware"><i class="ti ti-cpu" style="font-size:14px"></i>Hardware</div>
          <div class="sidebar-item" data-cat="tools"><i class="ti ti-terminal" style="font-size:14px"></i>Tools</div>
          <div class="sidebar-item" data-cat="indev"><i class="ti ti-code" style="font-size:14px"></i>In Dev</div>
        </div>
      </div>
      <div class="finder-file-area"><div class="file-grid" id="fileGrid"></div></div>
      <div class="finder-preview">
        <div class="preview-empty" id="previewEmpty">
          <i class="ti ti-folder-open" style="font-size:36px;color:#CCC"></i>
          <p style="font-size:11px;color:#BBB;text-align:center">Select a project<br>to inspect</p>
        </div>
        <div id="previewFilled" style="display:none;flex-direction:column;height:100%">
          <div class="preview-header"><div class="preview-title" id="previewName"></div></div>
          <div class="preview-content" id="previewContent"></div>
          <div class="preview-open-wrap" id="previewOpenWrap"></div>
        </div>
      </div>
    </div>
    <div class="finder-statusbar"><span class="finder-status-text" id="statusText">10 items</span></div>
  </div></div>`;

  let selectedId=null,activeCat='all';

  section.querySelectorAll('.sidebar-item').forEach(item=>{
    item.addEventListener('click',()=>{
      section.querySelectorAll('.sidebar-item').forEach(i=>i.classList.remove('active'));
      item.classList.add('active');
      activeCat=item.dataset.cat||'all';
      selectedId=null;
      renderGrid();
      showEmpty();
    });
  });

  function visible(){return activeCat==='all'?PROJECTS:PROJECTS.filter(p=>p.cat===activeCat);}

  function renderGrid(){
    const grid=document.getElementById('fileGrid');
    if(!grid)return;
    grid.innerHTML='';
    visible().forEach((p,i)=>{
      const dotClass=p.status==='ACTIVE'?'badge-active':p.status==='IN DEV'?'badge-dev':'badge-new';
      const el=document.createElement('div');
      el.className='file-item';el.dataset.id=p.id;
      el.style.animationDelay=(i*0.04)+'s';
      el.innerHTML=`<div class="file-icon-wrap"><i class="ti ${p.icon} file-icon"></i><span class="file-badge ${dotClass}"></span></div><div class="file-label">${p.name}</div>`;
      el.addEventListener('click',()=>selectProject(p.id));
      grid.appendChild(el);
    });
    document.getElementById('statusText').textContent=visible().length+' items';
  }

  function selectProject(id){
    if(selectedId===id){
      selectedId=null;
      section.querySelectorAll('.file-item').forEach(e=>e.classList.remove('selected'));
      showEmpty();
      document.getElementById('statusText').textContent=visible().length+' items';
      return;
    }
    selectedId=id;
    section.querySelectorAll('.file-item').forEach(e=>e.classList.toggle('selected',parseInt(e.dataset.id)===id));
    const p=PROJECTS.find(p=>p.id===id);
    showPreview(p);
    document.getElementById('statusText').textContent='1 item selected — '+p.size;
  }

  function showEmpty(){
    document.getElementById('previewEmpty').style.display='flex';
    document.getElementById('previewFilled').style.display='none';
  }

  function showPreview(p){
    document.getElementById('previewEmpty').style.display='none';
    document.getElementById('previewFilled').style.display='flex';
    document.getElementById('previewName').textContent=p.name;
    const badgeClass=p.status==='ACTIVE'?'active-badge':p.status==='IN DEV'?'dev-badge':'new-badge';
    document.getElementById('previewContent').innerHTML=`
      <i class="ti ${p.icon} preview-big-icon"></i>
      <p class="preview-desc">${p.desc}</p>
      <div class="preview-tags">${p.stack.map(s=>`<span class="preview-tag">${s}</span>`).join('')}</div>
      <div class="preview-meta">
        <div class="meta-row"><span class="meta-key">Domain</span><span class="meta-val" style="font-size:10px;text-align:right;max-width:120px;line-height:1.3">${p.domain}</span></div>
        <div class="meta-row"><span class="meta-key">Status</span><span class="meta-val ${badgeClass}">${p.status}</span></div>
        <div class="meta-row"><span class="meta-key">Size</span><span class="meta-val">${p.size}</span></div>
        <div class="meta-row"><span class="meta-key">Modified</span><span class="meta-val">${p.modified}</span></div>
      </div>`;
    const wrap=document.getElementById('previewOpenWrap');
    if(p.link&&p.link!=='#'){
      wrap.innerHTML=`<a class="finder-open-btn" href="${p.link}" target="_blank">Open Project ↗</a>`;
    }else if(p.link==='#'){
      wrap.innerHTML=`<a class="finder-open-btn" href="#" onclick="openDetailModal('${p.domain}','${p.name}','','${p.desc}',[],null);return false;">View Project ↗</a>`;
    }else{
      wrap.innerHTML=`<span class="finder-open-btn disabled">Coming soon</span>`;
    }
  }

  const obs=new IntersectionObserver(entries=>{
    if(entries[0].isIntersecting){section.classList.add('revealed');obs.disconnect();}
  },{threshold:0.3});
  obs.observe(section);

  renderGrid();
  showEmpty();
})();

/* ══ GLOBE (Contact) ══ */
(function(){
  const {mat4,quat,vec2,vec3}=glMatrix;
  const ITEMS=[
    {title:'GitHub',desc:'padmesh6119',link:'https://github.com/padmesh6119',draw:dGH},
    {title:'Instagram',desc:'@mightbepadmesh',link:'https://instagram.com/mightbepadmesh',draw:dIG},
    {title:'X',desc:'Follow me',link:'https://x.com',draw:dX},
    {title:'Gmail',desc:'padmesh77123',link:'mailto:padmesh77123'+'@gmail.com',draw:dGM},
    {title:'LinkedIn',desc:'padmesh1101',link:'https://linkedin.com/in/padmesh1101',draw:dLI},
    {title:'TryHackMe',desc:'Top 1% Global',link:'https://tryhackme.com',draw:dTHM},
  ];
  function base(ctx,s,bg){ctx.fillStyle=bg;ctx.beginPath();ctx.arc(s/2,s/2,s*0.46,0,Math.PI*2);ctx.fill();}
  function drawSVG(ctx,s,bg,fg,d,vbW,vbH){
    base(ctx,s,bg);
    const pad=s*0.2,availW=s-pad*2,availH=s-pad*2;
    const scX=availW/vbW,scY=availH/vbH,sc=Math.min(scX,scY);
    const offX=pad+(availW-vbW*sc)/2;
    const offY=pad+(availH-vbH*sc)/2;
    ctx.save();ctx.translate(offX,offY);ctx.scale(sc,sc);
    ctx.fillStyle=fg;ctx.fill(new Path2D(d));ctx.restore();
  }
  function dGH(ctx,s){drawSVG(ctx,s,'#24292e','#fff','M12 2c5.5228 0 10 4.47715 10 10 0 4.5716-3.0686 8.4239-7.2578 9.6162v-3.0117c0-.7275-.1595-1.4465-.4678-2.1055 2.1883-.7822 4.2783-2.4447 4.2783-4.4355 0-1.2663-.4671-2.75174-1.5127-3.63186V6l-2.9462.98828c-.6589-.16036-1.3628-.24706-2.0938-.24707-.731 0-1.4349.08673-2.09375.24707L6.95996 6v2.43164c-1.04555.88009-1.51163 2.36566-1.51172 3.63186 0 1.9907 2.08913 3.6533 4.27735 4.4355-.26358.5635-.41862 1.1711-.45801 1.7901-.13854.0283-.25191.0415-.34473.04-.20756-.0033-.36606-.06-.51953-.1562-1.11532-.7-1.54401-1.9835-3.05566-2.1543-.19076-.0214-.3474.1371-.34766.3291 0 .1922.15921.3423.34473.3925 1.44216.39 1.42755 3.2266 3.54785 3.2598.11976.0019.24101-.0069.36426-.0186v1.6348C5.06807 20.4236 2 16.5713 2 12 2 6.47715 6.47715 2 12 2',24,24);}
  function dIG(ctx,s){const g=ctx.createLinearGradient(s*0.1,s*0.9,s*0.9,s*0.1);g.addColorStop(0,'#f09433');g.addColorStop(0.25,'#e6683c');g.addColorStop(0.5,'#dc2743');g.addColorStop(0.75,'#cc2366');g.addColorStop(1,'#bc1888');ctx.fillStyle=g;ctx.beginPath();ctx.arc(s/2,s/2,s*0.46,0,Math.PI*2);ctx.fill();const pad=s*0.2,sz=s-pad*2,sc=sz/24;ctx.save();ctx.translate(pad,pad);ctx.scale(sc,sc);ctx.fillStyle='#fff';ctx.fill(new Path2D('M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'));ctx.restore();}
  function dX(ctx,s){drawSVG(ctx,s,'#000','#fff','M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H0.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',24,24);}
  function dGM(ctx,s){drawSVG(ctx,s,'#EA4335','#fff','M111.5 3.8L103 10.1L66.7 37.4L30.3 10.1L21.8 3.7C12.8 -3 0 3.4 0 14.7V26.8V92C0 97 4.1 101.1 9.1 101.1H30.3V49.5L66.7 76.8L103 49.5V101H124.2C129.2 101 133.3 96.9 133.3 91.9V26.8V14.7C133.3 3.4 120.5 -3 111.5 3.8Z',133.3,101.1);}
  function dLI(ctx,s){drawSVG(ctx,s,'#0A66C2','#fff','M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',24,24);}
  function dTHM(ctx,s){drawSVG(ctx,s,'#212c42','#fff','M10.705 0C7.54 0 4.902 2.285 4.349 5.291a4.525 4.525 0 0 0-4.107 4.5 4.525 4.525 0 0 0 4.52 4.52h6.761a0.625 0.625 0 1 0 0-1.25H4.761a3.273 3.273 0 0 1-3.27-3.27A3.273 3.273 0 0 1 6.59 7.08a0.625 0.625 0 0 0 0.7-1.035 4.488 4.488 0 0 0-1.68-0.69 5.223 5.223 0 0 1 5.096-4.104 5.221 5.221 0 0 1 5.174 4.57 4.489 4.489 0 0 0-0.488 0.305 0.625 0.625 0 1 0 0.731 1.013 3.245 3.245 0 0 1 1.912-0.616 3.278 3.278 0 0 1 3.203 2.61 0.625 0.625 0 0 0 1.225-0.251 4.533 4.533 0 0 0-4.428-3.61 4.54 4.54 0 0 0-0.958 0.105C16.556 2.328 13.9 0 10.705 0zm5.192 10.64a0.925 0.925 0 0 0-0.462 0.108 0.913 0.913 0 0 0-0.313 0.29 1.27 1.27 0 0 0-0.175 0.427 2.39 2.39 0 0 0-0.054 0.514c0 0.181 0.018 0.353 0.054 0.517 0.036 0.164 0.095 0.307 0.175 0.43a0.899 0.899 0 0 0 0.313 0.297c0.127 0.073 0.281 0.11 0.462 0.11 0.18 0 0.334-0.037 0.46-0.11a0.897 0.897 0 0 0 0.309-0.296c0.08-0.124 0.137-0.267 0.173-0.431 0.036-0.164 0.054-0.336 0.054-0.517 0-0.18-0.018-0.352-0.054-0.514a1.271 1.271 0 0 0-0.173-0.426 0.901 0.901 0 0 0-0.309-0.291 0.917 0.917 0 0 0-0.46-0.108zm6.486 0a0.925 0.925 0 0 0-0.462 0.108 0.913 0.913 0 0 0-0.313 0.29 1.27 1.27 0 0 0-0.175 0.427 2.39 2.39 0 0 0-0.053 0.514c0 0.181 0.017 0.353 0.053 0.517 0.036 0.164 0.095 0.307 0.175 0.43a0.899 0.899 0 0 0 0.313 0.297c0.127 0.073 0.281 0.11 0.462 0.11 0.18 0 0.334-0.037 0.46-0.11a0.897 0.897 0 0 0 0.31-0.296c0.078-0.124 0.136-0.267 0.172-0.431 0.036-0.164 0.054-0.336 0.054-0.517 0-0.18-0.018-0.352-0.054-0.514a1.271 1.271 0 0 0-0.173-0.426 0.901 0.901 0 0 0-0.308-0.291 0.916 0.916 0 0 0-0.461-0.108zm-8.537 0.068-0.84 0.618 0.313 0.43 0.476-0.368v1.877h0.603v-2.557zm6.486 0-0.841 0.618 0.314 0.43 0.477-0.368v1.877h0.603v-2.557z',24,24);}

  const N=ITEMS.length,ATLS=Math.ceil(Math.sqrt(N)),CELL=256;
  const ac=document.createElement('canvas');ac.width=ATLS*CELL;ac.height=ATLS*CELL;
  const actx=ac.getContext('2d');
  ITEMS.forEach((item,i)=>{const x=(i%ATLS)*CELL,y=Math.floor(i/ATLS)*CELL;actx.save();actx.translate(x,y);item.draw(actx,CELL);actx.restore();});

  class F{constructor(a,b,c){this.a=a;this.b=b;this.c=c;}}
  class V{constructor(x,y,z){this.p=vec3.fromValues(x,y,z);this.n=vec3.create();this.uv=vec2.create();}}
  class G{constructor(){this.v=[];this.f=[];}av(...a){for(let i=0;i<a.length;i+=3)this.v.push(new V(a[i],a[i+1],a[i+2]));return this;}af(...a){for(let i=0;i<a.length;i+=3)this.f.push(new F(a[i],a[i+1],a[i+2]));return this;}get last(){return this.v[this.v.length-1];}sub(d=1){let f=this.f;const mp={};for(let dv=0;dv<d;dv++){const nf=new Array(f.length*4);f.forEach((face,ndx)=>{const mAB=this._m(face.a,face.b,mp),mBC=this._m(face.b,face.c,mp),mCA=this._m(face.c,face.a,mp);const i=ndx*4;nf[i]=new F(face.a,mAB,mCA);nf[i+1]=new F(face.b,mBC,mAB);nf[i+2]=new F(face.c,mCA,mBC);nf[i+3]=new F(mAB,mBC,mCA);});f=nf;}this.f=f;return this;}sph(r=1){this.v.forEach(v=>{vec3.normalize(v.n,v.p);vec3.scale(v.p,v.n,r);});return this;}get vd(){return new Float32Array(this.v.flatMap(v=>Array.from(v.p)));}get ud(){return new Float32Array(this.v.flatMap(v=>Array.from(v.uv)));}get id(){return new Uint16Array(this.f.flatMap(f=>[f.a,f.b,f.c]));}_m(a,b,c){const k=a<b?`${b}_${a}`:`${a}_${b}`;if(c[k]!=null)return c[k];const va=this.v[a].p,vb=this.v[b].p;const n=this.v.length;c[k]=n;this.av((va[0]+vb[0])*.5,(va[1]+vb[1])*.5,(va[2]+vb[2])*.5);return n;}}
  class Ico extends G{constructor(){super();const t=Math.sqrt(5)*.5+.5;this.av(-1,t,0,1,t,0,-1,-t,0,1,-t,0,0,-1,t,0,1,t,0,-1,-t,0,1,-t,t,0,-1,t,0,1,-t,0,-1,-t,0,1).af(0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1);}}
  class Disc extends G{constructor(steps=4,r=1){super();steps=Math.max(4,steps);const a=(2*Math.PI)/steps;this.av(0,0,0);this.last.uv[0]=.5;this.last.uv[1]=.5;for(let i=0;i<steps;i++){const x=Math.cos(a*i),y=Math.sin(a*i);this.av(r*x,r*y,0);this.last.uv[0]=x*.5+.5;this.last.uv[1]=y*.5+.5;if(i>0)this.af(0,i,i+1);}this.af(0,steps,1);}}
  const VT=`#version 300 es\nuniform mat4 uW,uV,uP;uniform vec4 uRAV;\nin vec3 aP;in vec2 aUV;in mat4 aIM;\nout vec2 vUV;out float vA;flat out int vIID;\nvoid main(){vec4 wp=uW*aIM*vec4(aP,1.);vec3 cp=(uW*aIM*vec4(0.,0.,0.,1.)).xyz;float rad=length(cp);\nif(gl_VertexID>0){vec3 ra=uRAV.xyz;float rv=min(.15,uRAV.w*15.);vec3 sd=normalize(cross(cp,ra));vec3 rp=normalize(wp.xyz-cp);float s=dot(sd,rp);float ias=min(0.,abs(s)-1.);s=rv*sign(s)*abs(ias*ias*ias+1.);wp.xyz+=sd*s;}\nwp.xyz=rad*normalize(wp.xyz);gl_Position=uP*uV*wp;vA=smoothstep(.5,1.,normalize(wp.xyz).z)*.9+.1;vUV=aUV;vIID=gl_InstanceID;}`;
  const FT=`#version 300 es\nprecision highp float;uniform sampler2D uTex;uniform int uIC,uAS;\nout vec4 oC;in vec2 vUV;in float vA;flat in int vIID;\nvoid main(){int idx=vIID%uIC,cpr=uAS,cx=idx%cpr,cy=idx/cpr;vec2 cs=vec2(1.)/vec2(float(cpr)),co=vec2(float(cx),float(cy))*cs;vec2 st=vec2(vUV.x,1.-vUV.y);st=clamp(st,0.,1.);st=st*cs+co;oC=texture(uTex,st);oC.a*=vA;}`;
  function mkS(gl,t,src){const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);return s;}
  function mkP(gl,srcs){const p=gl.createProgram();[gl.VERTEX_SHADER,gl.FRAGMENT_SHADER].forEach((t,i)=>{const s=mkS(gl,t,srcs[i]);if(s)gl.attachShader(p,s);});gl.bindAttribLocation(p,0,'aP');gl.bindAttribLocation(p,2,'aUV');gl.bindAttribLocation(p,3,'aIM');gl.linkProgram(p);return p;}
  function mkB(gl,d){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,d,gl.STATIC_DRAW);gl.bindBuffer(gl.ARRAY_BUFFER,null);return b;}
  const canvas=document.getElementById('globe-canvas');
  const gl=canvas.getContext('webgl2',{antialias:true,alpha:false});if(!gl)return;
  const prog=mkP(gl,[VT,FT]);
  const L={uW:gl.getUniformLocation(prog,'uW'),uV:gl.getUniformLocation(prog,'uV'),uP:gl.getUniformLocation(prog,'uP'),uRAV:gl.getUniformLocation(prog,'uRAV'),uTex:gl.getUniformLocation(prog,'uTex'),uIC:gl.getUniformLocation(prog,'uIC'),uAS:gl.getUniformLocation(prog,'uAS')};
  const aP=gl.getAttribLocation(prog,'aP'),aUV=gl.getAttribLocation(prog,'aUV'),aIM=gl.getAttribLocation(prog,'aIM');
  const SR=2;const dg=new Disc(56,1);const dd=dg.vd,du=dg.ud,di=dg.id;
  const ig=new Ico();ig.sub(1).sph(SR);const iPos=ig.v.map(v=>v.p);const IC=ig.v.length;
  const va=gl.createVertexArray();gl.bindVertexArray(va);
  const bP=mkB(gl,dd);gl.bindBuffer(gl.ARRAY_BUFFER,bP);gl.enableVertexAttribArray(aP);gl.vertexAttribPointer(aP,3,gl.FLOAT,false,0,0);
  const bUV=mkB(gl,du);gl.bindBuffer(gl.ARRAY_BUFFER,bUV);gl.enableVertexAttribArray(aUV);gl.vertexAttribPointer(aUV,2,gl.FLOAT,false,0,0);
  const ib2=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib2);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,di,gl.STATIC_DRAW);
  const iArr=new Float32Array(IC*16),iMats=[];const instBuf=gl.createBuffer();
  for(let i=0;i<IC;i++){const s=new Float32Array(iArr.buffer,i*64,16);s.set(mat4.create());iMats.push(s);}
  gl.bindBuffer(gl.ARRAY_BUFFER,instBuf);gl.bufferData(gl.ARRAY_BUFFER,iArr.byteLength,gl.DYNAMIC_DRAW);
  for(let j=0;j<4;j++){const loc=aIM+j;gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,4,gl.FLOAT,false,64,j*16);gl.vertexAttribDivisor(loc,1);}
  gl.bindBuffer(gl.ARRAY_BUFFER,null);gl.bindVertexArray(null);
  const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,ac);
  const cam={pos:vec3.fromValues(0,0,3),up:vec3.fromValues(0,1,0),view:mat4.create(),proj:mat4.create()};
  function updCam(){mat4.lookAt(cam.view,cam.pos,[0,0,0],cam.up);}
  function updProj(){const asp=canvas.clientWidth/canvas.clientHeight;const h=SR*.35,d=cam.pos[2];const fov=asp>1?2*Math.atan(h/d):2*Math.atan(h/asp/d);mat4.perspective(cam.proj,fov,asp,.1,40);}
  updCam();updProj();
  let isDown2=false,pPos=vec2.create(),ppPos=vec2.create();
  let ori=quat.create(),pRot=quat.create(),_cq=quat.create(),rotVel=0,rotAxis=vec3.fromValues(1,0,0),snapTarget=null;
  const IDQ=quat.create();
  canvas.addEventListener('pointerdown',e=>{vec2.set(pPos,e.clientX,e.clientY);vec2.copy(ppPos,pPos);isDown2=true;});
  canvas.addEventListener('pointerup',()=>isDown2=false);canvas.addEventListener('pointerleave',()=>isDown2=false);
  canvas.addEventListener('pointermove',e=>{if(isDown2)vec2.set(pPos,e.clientX,e.clientY);});canvas.style.touchAction='none';
  function proj2(pos){const r=2,w=canvas.clientWidth,h=canvas.clientHeight,s=Math.max(w,h)-1;const x=(2*pos[0]-w-1)/s,y=(2*pos[1]-h-1)/s;const xySq=x*x+y*y,rSq=r*r;return vec3.fromValues(-x,y,xySq<=rSq/2?Math.sqrt(rSq-xySq):rSq/Math.sqrt(xySq));}
  function qFV(a,b,out,af=1){const ax=vec3.normalize(vec3.create(),vec3.cross(vec3.create(),a,b));quat.setAxisAngle(out,ax,Math.acos(Math.max(-1,Math.min(1,vec3.dot(a,b))))*af);}
  function updateArc(dt){
    const ts=dt/16+.00001;let snap=quat.create();
    if(isDown2){const INT=.3*ts,AMP=5/ts;const mid=vec2.sub(vec2.create(),pPos,ppPos);vec2.scale(mid,mid,INT);if(vec2.sqrLen(mid)>.1){vec2.add(mid,ppPos,mid);const p=proj2(mid),q=proj2(ppPos);const a=vec3.normalize(vec3.create(),p),b=vec3.normalize(vec3.create(),q);vec2.copy(ppPos,mid);qFV(a,b,pRot,ts*AMP);}else quat.slerp(pRot,pRot,IDQ,.1*ts);}
    else{quat.slerp(pRot,pRot,IDQ,.1*ts);if(snapTarget){const df=Math.max(.1,1-vec3.squaredDistance(snapTarget,vec3.fromValues(0,0,-1))*10);qFV(snapTarget,vec3.fromValues(0,0,-1),snap,ts*.2*df);}}
    const cq=quat.multiply(quat.create(),snap,pRot);ori=quat.normalize(quat.create(),quat.multiply(quat.create(),cq,ori));
    quat.slerp(_cq,_cq,cq,.8*ts);quat.normalize(_cq,_cq);
    const rad=Math.acos(_cq[3])*2,s=Math.sin(rad/2);
    if(s>.000001){rotVel=(rad/(2*Math.PI))/ts;rotAxis[0]=_cq[0]/s;rotAxis[1]=_cq[1]/s;rotAxis[2]=_cq[2]/s;}else rotVel*=0.9;
  }
  const titleEl=document.getElementById('faceTitle'),descEl=document.getElementById('faceDesc'),btnEl=document.getElementById('actionBtn');
  let isMoving2=false,lastActive=-1;
  function setActive(idx){if(idx===lastActive)return;lastActive=idx;const item=ITEMS[idx%ITEMS.length];titleEl.textContent=item.title;descEl.textContent=item.desc;btnEl.href=item.link;if(item.link.startsWith('mailto'))btnEl.removeAttribute('target');else btnEl.setAttribute('target','_blank');}
  function setMoving(m){if(m===isMoving2)return;isMoving2=m;const on=m?'inactive':'active';titleEl.className='face-title '+on;descEl.className='face-description '+on;btnEl.className='action-button '+on;}
  let prevT2=0;const wM=mat4.create();
  function frame(time){
    const dt=Math.min(32,time-prevT2);prevT2=time;updateArc(dt);setMoving(isDown2||Math.abs(rotVel)>.01);
    let targetZ=3,damp=5/(dt/16+.00001);
    if(!isDown2){const invO=quat.conjugate(quat.create(),ori);const nt=vec3.transformQuat(vec3.create(),vec3.fromValues(0,0,-1),invO);let mx3=-1,ni=0;for(let i=0;i<iPos.length;i++){const d=vec3.dot(nt,iPos[i]);if(d>mx3){mx3=d;ni=i;}}setActive(ni);snapTarget=vec3.normalize(vec3.create(),vec3.transformQuat(vec3.create(),iPos[ni],ori));}else{targetZ+=rotVel*80+2.5;damp=7/(dt/16+.00001);}
    cam.pos[2]+=(targetZ-cam.pos[2])/damp;updCam();
    iPos.forEach((p,i)=>{const wp=vec3.transformQuat(vec3.create(),p,ori);const sc=((Math.abs(wp[2])/SR)*.6+(1-.6))*.25;const m=mat4.create();mat4.multiply(m,m,mat4.fromTranslation(mat4.create(),vec3.negate(vec3.create(),wp)));mat4.multiply(m,m,mat4.targetTo(mat4.create(),[0,0,0],wp,[0,1,0]));mat4.multiply(m,m,mat4.fromScaling(mat4.create(),[sc,sc,sc]));mat4.multiply(m,m,mat4.fromTranslation(mat4.create(),[0,0,-SR]));mat4.copy(iMats[i],m);});
    gl.bindBuffer(gl.ARRAY_BUFFER,instBuf);gl.bufferSubData(gl.ARRAY_BUFFER,0,iArr);gl.bindBuffer(gl.ARRAY_BUFFER,null);
    const dpr=Math.min(2,devicePixelRatio);const cw=Math.round(canvas.clientWidth*dpr),ch=Math.round(canvas.clientHeight*dpr);if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;gl.viewport(0,0,cw,ch);}updProj();
    gl.useProgram(prog);gl.enable(gl.CULL_FACE);gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(L.uW,false,wM);gl.uniformMatrix4fv(L.uV,false,cam.view);gl.uniformMatrix4fv(L.uP,false,cam.proj);
    gl.uniform4f(L.uRAV,rotAxis[0],rotAxis[1],rotAxis[2],rotVel*1.1);gl.uniform1i(L.uIC,ITEMS.length);gl.uniform1i(L.uAS,ATLS);
    gl.uniform1i(L.uTex,0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);
    gl.bindVertexArray(va);gl.drawElementsInstanced(gl.TRIANGLES,di.length,gl.UNSIGNED_SHORT,0,IC);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.addEventListener('resize',updProj);
})();

/* ══ SCROLL TRANSITION + NAV ══ */
(function(){
  const ov=document.createElement('div');ov.style.cssText='position:fixed;inset:0;z-index:400;background:#000;pointer-events:none;opacity:0;transition:opacity .32s cubic-bezier(.4,0,.6,1);';document.body.appendChild(ov);
  const sc=document.getElementById('sc');let scrolling=false;
  function goTo(n){
    const ps=sc.querySelectorAll('section');
    if(n<0||n>=ps.length){scrolling=false;return;}
    ov.style.opacity='1';
    setTimeout(()=>{sc.scrollTop=n*window.innerHeight;setTimeout(()=>{ov.style.opacity='0';setTimeout(()=>{scrolling=false;},360);},55);},320);
  }
  function safeGoTo(n){
    if(!document.getElementById('site').classList.contains('visible'))return;
    if(scrolling)return;
    scrolling=true;
    goTo(n);
  }
  window._goTo=safeGoTo;
  window._curSection=()=>Math.round(sc.scrollTop/window.innerHeight);
  const isTouch=()=>window.matchMedia('(hover:none) and (pointer:coarse)').matches;
  window.addEventListener('wheel',e=>{
    if(isTouch())return;
    if(!document.getElementById('site').classList.contains('visible'))return;
    e.preventDefault();
    if(scrolling)return;
    const cur=Math.round(sc.scrollTop/window.innerHeight);
    const next=cur+(e.deltaY>0?1:-1);
    const ps=sc.querySelectorAll('section');
    if(next<0||next>=ps.length)return;
    scrolling=true;
    goTo(next);
  },{passive:false});
  /* on touch devices, native scroll-snap handles section-by-section swiping */
  let ty=0;
  window.addEventListener('touchstart',e=>{ty=e.touches[0].clientY;},{passive:true});
  window.addEventListener('touchend',e=>{
    if(isTouch())return; /* let native snap handle it */
    if(!document.getElementById('site').classList.contains('visible'))return;
    if(scrolling)return;
    const dy=ty-e.changedTouches[0].clientY;
    if(Math.abs(dy)<40)return;
    const cur=Math.round(sc.scrollTop/window.innerHeight);
    const next=cur+(dy>0?1:-1);
    const ps=sc.querySelectorAll('section');
    if(next<0||next>=ps.length)return;
    scrolling=true;
    goTo(next);
  },{passive:true});
  /* keyboard navigation — works on every section, escape hatch from contact globe */
  window.addEventListener('keydown',e=>{
    if(!document.getElementById('site').classList.contains('visible'))return;
    const tag=document.activeElement?.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA')return;
    const ps=sc.querySelectorAll('section');
    const cur=Math.round(sc.scrollTop/window.innerHeight);
    let next=null;
    if(e.key==='ArrowDown'||e.key==='PageDown'||e.key===' '||e.key==='j')next=cur+1;
    else if(e.key==='ArrowUp'||e.key==='PageUp'||e.key==='k')next=cur-1;
    else if(e.key==='Home')next=0;
    else if(e.key==='End')next=ps.length-1;
    if(next===null||scrolling)return;
    e.preventDefault();
    if(next<0||next>=ps.length)return;
    scrolling=true;goTo(next);
  });
})();

/* ══ LANYARD PHYSICS ══ */
(function(){
  const sec=document.getElementById('pAbout');
  const cv=document.getElementById('lanyardCanvas');
  if(!cv||!sec)return;
  const ctx=cv.getContext('2d');
  let W,H,dragging=false,dragOffX=0,dragOffY=0;

  const SEGS=12;
  const nodes=[];

  /* FIX: use setTransform instead of scale to avoid compounding DPR on resize */
  function initNodes(){
    const dpr=window.devicePixelRatio||1;
    W=cv.offsetWidth;
    H=cv.offsetHeight;
    cv.width=W*dpr;
    cv.height=H*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    nodes.length=0;
    const ox=W*0.5,oy=H*0.04;
    for(let i=0;i<=SEGS;i++){
      nodes.push({
        x:ox+Math.sin(i*0.3)*8,
        y:oy+i*(H*0.32/SEGS),
        px:ox+Math.sin(i*0.3)*8,
        py:oy+i*(H*0.32/SEGS),
        pinned:i===0
      });
    }
  }
  initNodes();

  const card={
    get w(){return W*0.46;},
    get h(){return W*0.46*1.5;},
    get pivot(){return this.h*0.46;}, /* hole sits near the top edge */
    cx:0,cy:0,angle:0,vAngle:0
  };
  function resetCard(){
    const last=nodes[nodes.length-1];
    card.cx=last.x;card.cy=last.y+card.pivot;
    card.angle=0;card.vAngle=0;
  }
  resetCard();

  const GRAV=1800,DAMP=0.985,ITERS=18,SEGLEN=()=>H*0.32/SEGS;

  function simulate(dt){
    const sl=SEGLEN();
    nodes.forEach(n=>{
      if(n.pinned)return;
      const vx=n.x-n.px,vy=n.y-n.py;
      n.px=n.x;n.py=n.y;
      n.x+=vx*DAMP;
      n.y+=vy*DAMP+GRAV*dt*dt;
    });
    for(let k=0;k<ITERS;k++){
      for(let i=0;i<nodes.length-1;i++){
        const a=nodes[i],b=nodes[i+1];
        if(a.pinned&&b.pinned)continue;
        const dx=b.x-a.x,dy=b.y-a.y;
        const d=Math.hypot(dx,dy)||0.001;
        const diff=(d-sl)/d*0.5;
        if(!a.pinned){a.x+=dx*diff;a.y+=dy*diff;}
        if(!b.pinned){b.x-=dx*diff;b.y-=dy*diff;}
      }
    }
    const last=nodes[nodes.length-1];
    const prev=nodes[nodes.length-2];
    const ropeAngle=Math.atan2(last.y-prev.y,last.x-prev.x);
    const d=card.pivot; /* hole→centre distance */
    if(!dragging){
      const targetAngle=ropeAngle-Math.PI/2;
      card.vAngle+=(targetAngle-card.angle)*0.06;
      card.vAngle*=0.85;
      card.angle+=card.vAngle;
      /* keep the card's hole pinned exactly at the last rope node */
      card.cx=last.x-d*Math.sin(card.angle);
      card.cy=last.y+d*Math.cos(card.angle);
    }else{
      /* card is dragged: rope follows the hole */
      last.x=card.cx+d*Math.sin(card.angle);
      last.y=card.cy-d*Math.cos(card.angle);
    }
  }

  const photoImg=new Image();
  let photoCache=null,photoCacheSize=0;
  function getScaledPhoto(targetPx){
    if(photoCache&&Math.abs(photoCacheSize-targetPx)<2)return photoCache;
    let src=photoImg,sw=photoImg.naturalWidth,sh=photoImg.naturalHeight;
    while(sw>targetPx*2||sh>targetPx*2){
      sw=Math.max(Math.ceil(sw/2),targetPx);
      sh=Math.max(Math.ceil(sh/2),targetPx);
      const tmp=document.createElement('canvas');tmp.width=sw;tmp.height=sh;
      const tc=tmp.getContext('2d');tc.imageSmoothingEnabled=true;tc.imageSmoothingQuality='high';
      tc.drawImage(src,0,0,sw,sh);src=tmp;
    }
    photoCache=src;photoCacheSize=targetPx;return src;
  }
  photoImg.src='assets/Idcard.png';

  function drawRope(){
    const last=nodes[nodes.length-1];
    const sl=nodes[nodes.length-2];
    function path(){
      ctx.beginPath();
      ctx.moveTo(nodes[0].x,nodes[0].y);
      for(let i=1;i<nodes.length-1;i++){
        const p=nodes[i-1],c=nodes[i];
        ctx.quadraticCurveTo(p.x,p.y,(p.x+c.x)/2,(p.y+c.y)/2);
      }
      ctx.quadraticCurveTo(sl.x,sl.y,last.x,last.y);
    }
    path();
    ctx.strokeStyle='rgba(255,255,255,0.06)';ctx.lineWidth=7;ctx.lineCap='round';ctx.stroke();
    path();
    ctx.strokeStyle='rgba(255,255,255,0.26)';ctx.lineWidth=2.5;ctx.stroke();
  }

  function drawCard(){
    const cw=card.w,ch=card.h,r=cw*0.07;
    ctx.save();
    ctx.translate(card.cx,card.cy);
    ctx.rotate(card.angle);

    /* card body */
    ctx.shadowColor='rgba(0,0,0,0.75)';ctx.shadowBlur=40;ctx.shadowOffsetY=16;
    ctx.beginPath();ctx.roundRect(-cw/2,-ch/2,cw,ch,r);
    ctx.fillStyle='#0b0b0e';ctx.fill();
    ctx.shadowColor='transparent';

    ctx.save();
    ctx.beginPath();ctx.roundRect(-cw/2,-ch/2,cw,ch,r);ctx.clip();

    /* subtle top sheen */
    const sheen=ctx.createLinearGradient(0,-ch/2,0,-ch/2+ch*0.5);
    sheen.addColorStop(0,'rgba(255,255,255,0.05)');sheen.addColorStop(1,'rgba(255,255,255,0)');
    ctx.fillStyle=sheen;ctx.fillRect(-cw/2,-ch/2,cw,ch*0.5);

    /* clip-on tab notch at the very top */
    const notchW=cw*0.2,notchH=ch*0.022;
    ctx.fillStyle='rgba(255,255,255,0.10)';
    ctx.beginPath();ctx.roundRect(-notchW/2,-ch/2+ch*0.018,notchW,notchH,notchH/2);ctx.fill();

    /* photo */
    const phPad=cw*0.07;
    const phX=-cw/2+phPad;
    const phY=-ch/2+ch*0.085;
    const phW=cw-phPad*2;
    const phH=ch*0.5;
    if(photoImg.complete&&photoImg.naturalWidth>0){
      ctx.save();
      ctx.beginPath();ctx.roundRect(phX,phY,phW,phH,cw*0.05);ctx.clip();
      const iAR=photoImg.naturalWidth/photoImg.naturalHeight;
      const fAR=phW/phH;
      let dw,dh,dx,dy;
      if(iAR>fAR){dh=phH;dw=dh*iAR;dx=phX-(dw-phW)/2;dy=phY;}
      else{dw=phW;dh=dw/iAR;dx=phX;dy=phY-(dh-phH)/2;}
      ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
      const dpr=window.devicePixelRatio||1;
      const src=photoImg.naturalWidth>dw*dpr*2?getScaledPhoto(Math.ceil(dw*dpr*2)):photoImg;
      ctx.drawImage(src,dx,dy,dw,dh);
      ctx.restore();
    }else{
      ctx.fillStyle='rgba(255,255,255,0.05)';
      ctx.beginPath();ctx.roundRect(phX,phY,phW,phH,cw*0.05);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.22)';
      ctx.font=`${Math.round(cw*0.16)}px 'Instrument Serif',serif`;
      ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText('PS',0,phY+phH/2);
    }

    /* name */
    const nameY=phY+phH+ch*0.05;
    ctx.fillStyle='rgba(255,255,255,0.96)';
    ctx.font=`${Math.round(cw*0.13)}px 'Instrument Serif',serif`;
    ctx.textAlign='center';ctx.textBaseline='top';
    ctx.fillText('Padmesh P S',0,nameY);

    /* role — mono, tracked, uppercase */
    ctx.fillStyle='rgba(255,255,255,0.42)';
    ctx.font=`${Math.round(cw*0.044)}px 'DM Mono',monospace`;
    ctx.fillText('S E C U R I T Y   R E S E A R C H E R',0,nameY+ch*0.085);

    /* footer strip */
    const stripY=ch/2-ch*0.085;
    ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(-cw*0.4,stripY);ctx.lineTo(cw*0.4,stripY);ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.30)';
    ctx.textAlign='left';
    ctx.font=`${Math.round(cw*0.04)}px 'DM Mono',monospace`;
    ctx.fillText('ID · 0xPS',-cw*0.4,stripY+ch*0.022);
    ctx.textAlign='right';
    ctx.fillText('2026',cw*0.4,stripY+ch*0.022);

    ctx.restore();

    /* border */
    ctx.beginPath();ctx.roundRect(-cw/2,-ch/2,cw,ch,r);
    ctx.strokeStyle='rgba(255,255,255,0.16)';ctx.lineWidth=1;ctx.stroke();

    /* punch hole near the top — the rope's anchor point */
    ctx.beginPath();ctx.arc(0,-ch/2+ch*0.04,cw*0.04,0,Math.PI*2);
    ctx.fillStyle='#050508';ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.35)';ctx.lineWidth=1.4;ctx.stroke();

    ctx.restore();
  }

  function drawPin(){
    ctx.beginPath();
    ctx.arc(nodes[0].x,nodes[0].y,4,0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,0.5)';ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=8;ctx.stroke();
  }

  let raf,last=0;
  function loop(ts){
    const dt=Math.min((ts-last)/1000,0.033);last=ts;
    ctx.clearRect(0,0,W,H);
    simulate(dt);
    drawRope();
    drawCard();
    drawPin();
    raf=requestAnimationFrame(loop);
  }

  function getPos(e){
    const r=cv.getBoundingClientRect();
    const cl=e.touches?e.touches[0]:e;
    return{x:(cl.clientX-r.left)*(W/r.width),y:(cl.clientY-r.top)*(H/r.height)};
  }
  function onDown(e){
    const p=getPos(e);
    if(Math.hypot(p.x-card.cx,p.y-card.cy)<Math.max(card.w,card.h)*0.6){
      dragging=true;dragOffX=p.x-card.cx;dragOffY=p.y-card.cy;
      e.preventDefault();
    }
  }
  function onMove(e){
    const p=getPos(e);
    if(dragging){card.cx=p.x-dragOffX;card.cy=p.y-dragOffY;e.preventDefault();}
  }
  function onUp(){dragging=false;}
  cv.addEventListener('mousedown',onDown);
  cv.addEventListener('mousemove',onMove);
  cv.addEventListener('mouseup',onUp);
  cv.addEventListener('touchstart',onDown,{passive:false});
  cv.addEventListener('touchmove',onMove,{passive:false});
  cv.addEventListener('touchend',onUp);

  /* preload fonts so canvas text renders correctly */
  document.fonts.load(`16px 'Instrument Serif'`).catch(()=>{});
  document.fonts.load(`16px 'DM Mono'`).catch(()=>{});

  const obs=new IntersectionObserver(entries=>{
    if(entries[0].isIntersecting){obs.disconnect();raf=requestAnimationFrame(loop);}
    else if(raf){cancelAnimationFrame(raf);raf=null;}
  },{threshold:0.1});
  obs.observe(sec);
  window.addEventListener('resize',()=>{if(!raf)return;photoCache=null;initNodes();resetCard();});
})();

/* ══ ABOUT BENTO — ANIMATIONS ══ */
(function(){
  const sec=document.getElementById('pAbout');
  if(!sec)return;
  const spotlight=document.getElementById('abSpotlight');
  const bento=document.getElementById('abGrid');
  if(!bento)return;
  const cards=[...bento.querySelectorAll('.ab-card')];

  const entrObs=new IntersectionObserver(entries=>{
    if(!entries[0].isIntersecting)return;
    entrObs.disconnect();
    cards.forEach((c,i)=>{
      setTimeout(()=>{
        c.classList.add('ab-in');
        const sw=document.createElement('div');
        sw.style.cssText='position:absolute;inset:0;z-index:10;pointer-events:none;border-radius:12px;overflow:hidden;';
        const sh=document.createElement('div');
        sh.style.cssText='position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent);';
        sw.appendChild(sh);c.appendChild(sw);
        gsap.to(sh,{left:'160%',duration:.6,ease:'power2.inOut',delay:.12,onComplete:()=>sw.remove()});
      },i*55);
    });
  },{threshold:0.05});
  entrObs.observe(sec);

  let spotActive=false;
  sec.addEventListener('mousemove',e=>{
    if(!spotlight)return;
    const r=sec.getBoundingClientRect();
    const sx=e.clientX-r.left,sy=e.clientY-r.top;
    if(!spotActive){spotActive=true;gsap.to(spotlight,{opacity:1,duration:.3});}
    gsap.to(spotlight,{left:sx,top:sy,duration:.08,ease:'none'});
    cards.forEach(card=>{
      const cr=card.getBoundingClientRect();
      const dist=Math.max(0,Math.hypot(e.clientX-(cr.left+cr.width/2),e.clientY-(cr.top+cr.height/2))-Math.max(cr.width,cr.height)/2);
      const gi=dist<=140?1:dist<=240?(240-dist)/100:0;
      card.style.setProperty('--gx',((e.clientX-cr.left)/cr.width*100).toFixed(1)+'%');
      card.style.setProperty('--gy',((e.clientY-cr.top)/cr.height*100).toFixed(1)+'%');
      card.style.setProperty('--gi',gi.toFixed(3));
    });
  });
  sec.addEventListener('mouseleave',()=>{
    spotActive=false;gsap.to(spotlight,{opacity:0,duration:.4});
    cards.forEach(c=>c.style.setProperty('--gi','0'));
  });

  cards.forEach(card=>{
    let pts=[];
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const nx=(e.clientX-r.left)/r.width-.5,ny=(e.clientY-r.top)/r.height-.5;
      gsap.to(card,{rotateX:-ny*10,rotateY:nx*10,duration:.18,ease:'power2.out',transformPerspective:800});
      const inn=card.querySelector('.ab-card-inner');
      if(inn)gsap.to(inn,{x:nx*5,y:ny*5,duration:.22,ease:'power2.out'});
    });
    card.addEventListener('mouseleave',()=>{
      gsap.to(card,{rotateX:0,rotateY:0,scale:1,duration:.45,ease:'elastic.out(1,.6)',transformPerspective:800});
      const inn=card.querySelector('.ab-card-inner');
      if(inn)gsap.to(inn,{x:0,y:0,duration:.4,ease:'elastic.out(1,.6)'});
      pts.forEach(p=>gsap.to(p,{scale:0,opacity:0,duration:.22,onComplete:()=>p.remove()}));pts=[];
    });
    card.addEventListener('mouseenter',()=>{
      gsap.to(card,{scale:1.012,duration:.18,ease:'power2.out'});
      for(let i=0;i<8;i++)setTimeout(()=>{
        if(!card.matches(':hover'))return;
        const p=document.createElement('div');p.className='ab-particle';
        const r=card.getBoundingClientRect();
        p.style.cssText=`left:${Math.random()*r.width}px;top:${Math.random()*r.height}px;opacity:0;`;
        card.appendChild(p);pts.push(p);
        gsap.fromTo(p,{scale:0,opacity:0},{scale:1,opacity:.55,duration:.28,ease:'back.out(1.7)'});
        gsap.to(p,{x:(Math.random()-.5)*80,y:(Math.random()-.5)*65,duration:1.8+Math.random()*2,ease:'none',repeat:-1,yoyo:true});
        gsap.to(p,{opacity:.12,duration:1.1,ease:'power2.inOut',repeat:-1,yoyo:true});
      },i*65);
    });
    card.addEventListener('click',e=>{
      const r=card.getBoundingClientRect();
      const x=e.clientX-r.left,y=e.clientY-r.top;
      const maxD=Math.max(Math.hypot(x,y),Math.hypot(x-r.width,y),Math.hypot(x,y-r.height),Math.hypot(x-r.width,y-r.height));
      const rip=document.createElement('div');rip.className='ab-ripple';
      rip.style.cssText=`width:${maxD*2}px;height:${maxD*2}px;left:${x-maxD}px;top:${y-maxD}px;background:radial-gradient(circle,rgba(255,255,255,.14) 0%,rgba(255,255,255,.05) 40%,transparent 70%);`;
      card.appendChild(rip);setTimeout(()=>rip.remove(),900);
      gsap.fromTo(card,{boxShadow:'0 0 0 1px rgba(255,255,255,.4)'},{boxShadow:'0 0 0 1px rgba(255,255,255,0)',duration:.55,ease:'power2.out'});
    });
  });
})();

/* ══ PAGE TITLE DECRYPT ══ */
function decryptPageTitle(el){
  const text=el.dataset.decrypt||el.textContent.trim();
  if(!text)return;
  const CHARS='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#—';
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  async function run(){
    let disp=text.split('').map(c=>c===' '?' ':CHARS[Math.floor(Math.random()*CHARS.length)]);
    el.textContent=disp.join('');
    for(let i=0;i<text.length;i++){
      for(let s=0;s<3;s++){
        disp=disp.map((c,j)=>j<i?text[j]:(text[j]===' '?' ':CHARS[Math.floor(Math.random()*CHARS.length)]));
        el.textContent=disp.join('');
        await sleep(13);
      }
      disp[i]=text[i];
      el.textContent=disp.join('');
    }
  }
  run();
}

/* ══ SECTION FADE-IN ══ */
(function(){
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const sec=e.target;
        sec.classList.add('revealed');
        sec.querySelectorAll('.anim-el').forEach((el,i)=>{
          el.style.transitionDelay=(el.style.transitionDelay||((i*0.12)+'s'));
        });
        const t=sec.querySelector('.page-title[data-decrypt]');
        if(t)setTimeout(()=>decryptPageTitle(t),180);
      }
    });
  },{threshold:0});
  document.querySelectorAll('.page-section').forEach(s=>obs.observe(s));
  document.querySelectorAll('.page-section').forEach(s=>{
    if(s.getBoundingClientRect().top<window.innerHeight)s.classList.add('revealed');
  });
  const siteEl=document.getElementById('site');
  const mo=new MutationObserver(()=>{
    if(siteEl.classList.contains('visible')){
      mo.disconnect();
      const p1=document.getElementById('p1');
      p1.classList.add('revealed');
      const t=p1.querySelector('.page-title[data-decrypt]');
      if(t)setTimeout(()=>decryptPageTitle(t),400);
    }
  });
  mo.observe(siteEl,{attributes:true,attributeFilter:['class']});
})();

/* ══ RESUME DOWNLOAD ══ */
(function(){
  const resumeCard=document.getElementById('abResumeCard');
  if(!resumeCard)return;
  resumeCard.style.cursor='pointer';
  resumeCard.addEventListener('click',()=>{
    const link=document.createElement('a');
    link.href='assets/Resume.pdf';
    link.download='Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
})();

/* ══ DISCLOSURES — MAGAZINE COVER ══ */
(function(){
  const sec=document.getElementById('pFindings');
  if(!sec)return;
  const L1=document.getElementById('dsL1');
  const L2=document.getElementById('dsL2');
  const attrId=document.getElementById('dsAttrId');
  const attrTg=document.getElementById('dsAttrTg');
  const attrSev=document.getElementById('dsAttrSev');
  const pager=document.getElementById('dsPager');
  const hits=document.getElementById('dsHits');
  if(!L1||!hits)return;

  const SEVN={crit:"Critical",high:"High",med:"Medium"};
  const ABBR={crit:"Crit",high:"High",med:"Med"};

  const HEADLINES=[
    {l1:"Five million records,",l2:"<em>one BENCHMARK away.</em>",id:"TN-01",tg:"TNSTC · State Transport",sev:"crit"},
    {l1:"No login. No token.",l2:"<em>Just your phone number.</em>",id:"SK-01",tg:"SKCET DigiICampus · EdTech",sev:"crit"},
    {l1:"Student searches for admin.",l2:"<em>Admin found. Chain complete.</em>",id:"SK-02",tg:"SKCET DigiICampus · EdTech",sev:"crit"},
    {l1:"Four hundred secret levers,",l2:"<em>one hardcoded key.</em>",id:"ZM-01",tg:"Zomato · Enterprise Portal",sev:"high"},
    {l1:"Webshell uploaded.",l2:"<em>Stored. Accessible. Waiting.</em>",id:"ID-01",tg:"InDrive · Supernovas LMS",sev:"high"},
    {l1:"CORS: credentials=true.",l2:"<em>Origin: attacker.cloudways.com</em>",id:"CW-01",tg:"Cloudways · API Gateway",sev:"high"},
  ];

  const HITS=[
    {id:"TN-01",t:"Blind SQLi: 5M records, FILE+SUPER privileges",sev:"crit"},
    {id:"SK-01",t:"Unauth ATO via phone OTP — no rate limit, CVSS 9.6",sev:"crit"},
    {id:"SK-02",t:"Admin IDOR + OTP reset = full platform takeover",sev:"crit"},
    {id:"ZM-01",t:"Hardcoded OAuth credentials in enterprise JS bundle",sev:"high"},
    {id:"ID-01",t:"PHP webshell stored via TutorLMS file upload",sev:"high"},
    {id:"CW-01",t:"Wildcard CORS + credentials on production API",sev:"high"},
    {id:"SK-04",t:"IDOR: password change accepts any student ID",sev:"high"},
  ];

  /* render hits */
  hits.innerHTML=HITS.map(h=>`
    <a class="ds-hit" href="research.html">
      <span class="ds-hit-id">${h.id}</span>
      <span class="ds-hit-t">${h.t}</span>
      <span class="ds-hit-sev ${h.sev}">${ABBR[h.sev]}</span>
    </a>`).join('');

  /* render pager dots */
  pager.innerHTML=HEADLINES.map((_,i)=>`<button class="ds-pager-dot${i===0?' on':''}" data-i="${i}" aria-label="Headline ${i+1}"></button>`).join('');

  /* scramble animation */
  const glyphs="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*?<>";
  function scrambleSet(el,html,dur,delay=0){
    const txt=html.replace(/<[^>]+>/g,'');
    const tags=html.match(/<[^>]+>/g)||[];
    const useTags=html.includes('<em>');
    return new Promise(res=>{
      setTimeout(()=>{
        const s=performance.now();
        (function tick(now){
          const p=Math.min((now-s)/dur,1);
          const rev=Math.floor(p*txt.length);
          let scrambled=txt.split("").map((c,i)=>{
            if(i<rev)return c;
            if(c===" "||c===","||c==="."||c===":")return c;
            return glyphs[Math.floor(Math.random()*glyphs.length)];
          }).join("");
          if(useTags){
            el.innerHTML=`<em>${scrambled}</em>`;
          }else{
            el.textContent=scrambled;
          }
          if(p<1)requestAnimationFrame(tick);
          else{ el.innerHTML=html; res(); }
        })(s);
      },delay);
    });
  }

  const stamp=document.getElementById('dsStamp');
  const dustCv=document.getElementById('dsDust');

  function fireStamp(){
    if(!stamp)return;
    stamp.classList.remove('stamped');
    void stamp.offsetWidth;
    setTimeout(()=>{
      stamp.classList.add('stamped');
      if(dustCv)burstDust(dustCv);
    },680);
  }

  let idx=0,timer=null;
  function setHeadline(i,animate=true){
    idx=i;
    const h=HEADLINES[i];
    pager.querySelectorAll('.ds-pager-dot').forEach((d,j)=>d.classList.toggle('on',j===i));
    if(animate){
      L1.style.opacity='0';L2.style.opacity='0';
      setTimeout(()=>{
        L1.style.opacity='1';L2.style.opacity='1';
        scrambleSet(L1,h.l1,700,0);
        scrambleSet(L2,h.l2,850,150);
      },240);
      fireStamp();
    }else{
      L1.innerHTML=h.l1;L2.innerHTML=h.l2;
    }
    attrId.textContent=h.id;
    attrTg.textContent=h.tg;
    attrSev.textContent=SEVN[h.sev];
    attrSev.className='ds-attr-sev '+h.sev;
  }

  function startCycle(){
    stopCycle();
    timer=setInterval(()=>setHeadline((idx+1)%HEADLINES.length),5200);
  }
  function stopCycle(){if(timer){clearInterval(timer);timer=null;}}

  pager.addEventListener('click',e=>{
    const b=e.target.closest('.ds-pager-dot');if(!b)return;
    setHeadline(+b.dataset.i);startCycle();
  });

  /* start cycling once the section enters view */
  function burstDust(cv){
    const W=200,H=200;
    cv.width=W;cv.height=H;
    const ctx2=cv.getContext('2d');
    const N=38;
    const particles=Array.from({length:N},()=>({
      x:W/2,y:H/2,
      vx:(Math.random()-0.5)*7.5,
      vy:(Math.random()-0.5)*7.5-(Math.random()*2),
      life:1,
      r:Math.random()*2.2+0.6,
      c:`rgba(255,${80+Math.floor(Math.random()*60)},${60+Math.floor(Math.random()*40)},`
    }));
    let af;
    function tick(){
      ctx2.clearRect(0,0,W,H);
      let alive=false;
      particles.forEach(p=>{
        p.x+=p.vx;p.y+=p.vy;
        p.vy+=0.12;/* gravity */
        p.vx*=0.97;p.life-=0.028;
        if(p.life>0){
          alive=true;
          ctx2.beginPath();
          ctx2.arc(p.x,p.y,p.r,0,Math.PI*2);
          ctx2.fillStyle=p.c+p.life+')';
          ctx2.fill();
        }
      });
      if(alive)af=requestAnimationFrame(tick);
      else{ctx2.clearRect(0,0,W,H);}
    }
    af=requestAnimationFrame(tick);
  }

  const io=new IntersectionObserver(es=>{
    es.forEach(e=>{
      if(e.isIntersecting && e.intersectionRatio>0.3){
        /* initial decrypt on first reveal */
        if(!sec.dataset.seen){
          sec.dataset.seen='1';
          const h=HEADLINES[0];
          L1.textContent='';L2.textContent='';
          scrambleSet(L1,h.l1,700,80);
          scrambleSet(L2,h.l2,850,260);
        }
        startCycle();
      }else stopCycle();
    });
  },{threshold:[0,0.3]});
  io.observe(sec);
})();

/* ══ SIDE NAV DOTS ══ */
(function(){
  const dots=[...document.querySelectorAll('.sn-dot')];
  if(!dots.length)return;
  const sc=document.getElementById('sc');
  dots.forEach(d=>{
    d.addEventListener('click',()=>{
      if(window._goTo)window._goTo(+d.dataset.n);
    });
  });
  function sync(){
    const cur=Math.round(sc.scrollTop/window.innerHeight);
    dots.forEach((d,i)=>d.classList.toggle('on',i===cur));
  }
  sc.addEventListener('scroll',sync,{passive:true});
  sync();
})();


/* ══ PAGE GUIDE BUTTONS ══ */
(function(){
  document.querySelectorAll('.pg-btn').forEach(btn=>{
    const panel=btn.nextElementSibling;
    btn.addEventListener('click',e=>{
      e.stopPropagation();
      const open=panel.classList.contains('open');
      // close all
      document.querySelectorAll('.pg-panel.open').forEach(p=>p.classList.remove('open'));
      document.querySelectorAll('.pg-btn.active').forEach(b=>b.classList.remove('active'));
      if(!open){panel.classList.add('open');btn.classList.add('active');}
    });
  });
  document.addEventListener('click',()=>{
    document.querySelectorAll('.pg-panel.open').forEach(p=>p.classList.remove('open'));
    document.querySelectorAll('.pg-btn.active').forEach(b=>b.classList.remove('active'));
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      document.querySelectorAll('.pg-panel.open').forEach(p=>p.classList.remove('open'));
      document.querySelectorAll('.pg-btn.active').forEach(b=>b.classList.remove('active'));
    }
  });
})();
