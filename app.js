/* Patungan — logika hitung + render. Tanpa dependency, data di localStorage. */
(function(){
"use strict";
var KEY="patungan.v1";
var rupiah=function(n){return "Rp"+Math.round(n).toLocaleString("id-ID");};
var $=function(id){return document.getElementById(id);};

var state={orang:[],items:[],pb1:false,service:false,svcPct:5};

function simpan(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}
function muat(){
  try{
    var d=JSON.parse(localStorage.getItem(KEY));
    if(d&&Array.isArray(d.orang)&&Array.isArray(d.items))state=d;
  }catch(e){}
}
function err(id,msg){var el=$(id);el.textContent=msg;el.hidden=!msg;}

/* ---------- hitung ---------- */
function hitung(){
  var sub={};state.orang.forEach(function(o){sub[o]=0;});
  var subtotal=0;
  state.items.forEach(function(it){
    var ps=it.peserta.filter(function(p){return sub.hasOwnProperty(p);});
    if(!ps.length||it.harga<=0)return;
    subtotal+=it.harga;
    var per=it.harga/ps.length;
    ps.forEach(function(p){sub[p]+=per;});
  });
  var svc=state.service?subtotal*state.svcPct/100:0;
  var pb1=state.pb1?(subtotal+svc)*0.10:0;
  var total=subtotal+svc+pb1;
  var hasil=state.orang.map(function(o){
    var t=subtotal>0?sub[o]/subtotal:0;
    return{nama:o,sub:sub[o],svc:svc*t,pb1:pb1*t,total:sub[o]+svc*t+pb1*t};
  });
  // koreksi pembulatan: selisih dibebankan ke tagihan terbesar
  var dibulatkan=hasil.map(function(h){return Math.round(h.total);});
  var selisih=Math.round(total)-dibulatkan.reduce(function(a,b){return a+b;},0);
  if(hasil.length){
    var idx=0;hasil.forEach(function(h,i){if(h.total>hasil[idx].total)idx=i;});
    dibulatkan[idx]+=selisih;
  }
  hasil.forEach(function(h,i){h.bayar=dibulatkan[i];});
  return{subtotal:subtotal,svc:svc,pb1:pb1,total:total,hasil:hasil};
}

/* ---------- render ---------- */
function renderOrang(){
  var ul=$("daftar-orang");ul.innerHTML="";
  state.orang.forEach(function(o){
    var li=document.createElement("li");li.className="chip";
    var sp=document.createElement("span");sp.textContent=o;
    var x=document.createElement("button");x.type="button";x.className="chip-x";
    x.textContent="×";x.setAttribute("aria-label","Hapus "+o);
    x.onclick=function(){hapusOrang(o);};
    li.appendChild(sp);li.appendChild(x);ul.appendChild(li);
  });
  $("hint-orang").hidden=state.orang.length>0;
  renderPick();
}
function renderPick(){
  var box=$("pick-peserta");box.innerHTML="";
  if(!state.orang.length){
    box.innerHTML='<li class="hint" style="list-style:none">Tambahkan orang dulu di langkah 1.</li>';return;
  }
  state.orang.forEach(function(o){
    var li=document.createElement("li");
    var b=document.createElement("button");b.type="button";b.className="chip";
    b.textContent=o;b.setAttribute("aria-pressed",pickSet.has(o)?"true":"false");
    b.onclick=function(){pickSet.has(o)?pickSet.delete(o):pickSet.add(o);renderPick();};
    li.appendChild(b);box.appendChild(li);
  });
}
var pickSet=new Set();
function renderItem(){
  var ul=$("daftar-item");ul.innerHTML="";
  state.items.forEach(function(it,idx){
    var li=document.createElement("li");li.className="item";
    var wrap=document.createElement("div");
    var nm=document.createElement("span");nm.className="nm";nm.textContent=it.nama;
    var sp=document.createElement("span");sp.className="siapa";
    sp.textContent=it.peserta.length===state.orang.length?"semua ikut":"ikut: "+it.peserta.join(", ");
    wrap.appendChild(nm);wrap.appendChild(sp);
    var hrg=document.createElement("span");hrg.className="hrg";hrg.textContent=rupiah(it.harga);
    var del=document.createElement("button");del.type="button";del.className="del";
    del.textContent="🗑";del.setAttribute("aria-label","Hapus "+it.nama);
    del.onclick=function(){state.items.splice(idx,1);simpan();render();};
    li.appendChild(wrap);li.appendChild(hrg);li.appendChild(del);ul.appendChild(li);
  });
  $("hint-item").hidden=state.items.length>0;
}
function renderHasil(){
  var box=$("hasil");box.innerHTML="";
  var h=hitung();
  if(!state.orang.length||!state.items.length||h.total<=0){
    box.innerHTML='<p class="struk-empty">Belum ada hitungan.<br>Tambahkan orang &amp; menu dulu, ya.</p>';
    $("btn-wa").disabled=true;return;
  }
  $("btn-wa").disabled=false;
  h.hasil.forEach(function(p){
    var d=document.createElement("div");d.className="baris";
    var n=document.createElement("span");n.className="n";n.textContent=p.nama;
    var v=document.createElement("span");v.textContent=rupiah(p.bayar);
    d.appendChild(n);d.appendChild(v);box.appendChild(d);
  });
  var t=document.createElement("div");t.className="baris total";
  t.innerHTML='<span>TOTAL</span><span>'+rupiah(h.total)+"</span>";
  box.appendChild(t);
  var det=document.createElement("div");det.style.marginTop=".4rem";
  var rows=[["Subtotal",h.subtotal]];
  if(state.service)rows.push(["Service "+state.svcPct+"%",h.svc]);
  if(state.pb1)rows.push(["PB1 10%",h.pb1]);
  rows.forEach(function(r){
    var d=document.createElement("div");d.className="baris";
    d.innerHTML='<span class="ket">'+r[0]+"</span><span class=\"ket\">"+rupiah(r[1])+"</span>";
    det.appendChild(d);
  });
  box.appendChild(det);
}
function render(){
  renderOrang();renderItem();renderHasil();
  $("tgl-pb1").checked=state.pb1;
  $("tgl-service").checked=state.service;
  $("input-service").value=state.svcPct;
  $("svc-field").hidden=!state.service;
}

/* ---------- aksi ---------- */
function tambahOrang(){
  var v=$("input-nama").value.trim();
  if(!v)return err("err-orang","Isi dulu namanya.");
  if(state.orang.some(function(o){return o.toLowerCase()===v.toLowerCase();}))
    return err("err-orang","Nama “"+v+"” sudah ada. Pakai nama lain biar nggak ketuker.");
  err("err-orang","");
  state.orang.push(v);pickSet=new Set(state.orang);
  $("input-nama").value="";simpan();render();$("input-nama").focus();
}
function hapusOrang(o){
  state.orang=state.orang.filter(function(x){return x!==o;});
  state.items.forEach(function(it){
    it.peserta=it.peserta.filter(function(p){return p!==o;});
    if(!it.peserta.length)it.peserta=state.orang.slice();
  });
  pickSet=new Set(state.orang);simpan();render();
}
function tambahItem(){
  var nama=$("input-item").value.trim();
  var harga=parseInt($("input-harga").value.replace(/\D/g,""),10);
  if(!nama)return err("err-item","Isi dulu nama menunya.");
  if(!harga||harga<=0)return err("err-item","Harganya belum bener. Contoh: 35000.");
  if(!pickSet.size)return err("err-item","Pilih minimal 1 orang yang ikut menu ini.");
  err("err-item","");
  state.items.push({nama:nama,harga:harga,peserta:Array.from(pickSet)});
  $("input-item").value="";$("input-harga").value="";
  pickSet=new Set(state.orang);simpan();render();$("input-item").focus();
}
function teksWA(){
  var h=hitung();
  var tgl=new Date().toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"});
  var L=["*PATUNGAN — "+tgl+"*","------------------------------"];
  h.hasil.forEach(function(p){L.push(p.nama+": "+rupiah(p.bayar));});
  L.push("------------------------------","Subtotal: "+rupiah(h.subtotal));
  if(state.service)L.push("Service "+state.svcPct+"%: "+rupiah(h.svc));
  if(state.pb1)L.push("PB1 10%: "+rupiah(h.pb1));
  L.push("*TOTAL: "+rupiah(h.total)+"*","","_dihitung pakai Patungan, tanpa drama_");
  return L.join("\n");
}

/* ---------- wire ---------- */
$("form-orang").addEventListener("submit",function(e){e.preventDefault();tambahOrang();});
$("form-item").addEventListener("submit",function(e){e.preventDefault();tambahItem();});
$("tgl-pb1").addEventListener("change",function(e){state.pb1=e.target.checked;simpan();renderHasil();});
$("tgl-service").addEventListener("change",function(e){state.service=e.target.checked;simpan();render();});
$("input-service").addEventListener("change",function(e){
  var v=parseFloat(e.target.value);if(isNaN(v)||v<0)v=0;if(v>20)v=20;
  state.svcPct=v;simpan();renderHasil();
});
$("btn-contoh").addEventListener("click",function(){
  state={orang:["Andi","Bima","Caca"],items:[
    {nama:"Nasi goreng spesial",harga:35000,peserta:["Andi","Bima","Caca"]},
    {nama:"Ayam geprek",harga:22000,peserta:["Andi","Caca"]},
    {nama:"Es teh manis (3)",harga:15000,peserta:["Andi","Bima","Caca"]},
    {nama:"Kopi susu",harga:18000,peserta:["Bima"]}
  ],pb1:true,service:true,svcPct:5};
  pickSet=new Set(state.orang);simpan();render();
});
$("btn-reset").addEventListener("click",function(){
  if(!state.orang.length&&!state.items.length)return;
  if(!confirm("Hapus semua data dan mulai dari awal?"))return;
  state={orang:[],items:[],pb1:false,service:false,svcPct:5};
  pickSet=new Set();simpan();render();
});
$("btn-wa").addEventListener("click",function(){
  var t=teksWA(),ok=$("copy-ok");
  function done(){ok.hidden=false;setTimeout(function(){ok.hidden=true;},3500);}
  if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(t).then(done,function(){fallback();});
  }else fallback();
  function fallback(){
    var ta=document.createElement("textarea");ta.value=t;document.body.appendChild(ta);
    ta.select();try{document.execCommand("copy");done();}catch(e){}
    document.body.removeChild(ta);
  }
});

/* ---------- init ---------- */
muat();pickSet=new Set(state.orang);
$("struk-tanggal").textContent="struk patungan · "+
  new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
render();
})();
