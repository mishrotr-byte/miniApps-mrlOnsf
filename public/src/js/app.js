Telegram.WebApp.ready(); Telegram.WebApp.expand();

const TAVILY_KEY = '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';
const HF_TOKEN = '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';

// Кубики 3D за мышкой
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = innerWidth; canvas.height = innerHeight;
let mx = innerWidth/2, my = innerHeight/2;
document.onmousemove = e => { mx = e.clientX; my = e.clientY; };
document.ontouchmove = e => { mx = e.touches[0].clientX; my = e.touches[0].clientY; };
const cubes = [];
for(let i=0;i<200;i++) {
  cubes.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,size:8+Math.random()*20,speed:0.3+Math.random()*0.7});
}
function drawCubes(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  cubes.forEach(c=>{
    const dx = mx - c.x, dy = my - c.y;
    c.x += dx * 0.02; c.y += dy * 0.02;
    ctx.fillStyle = 'rgba(255,107,53,0.7)';
    ctx.fillRect(c.x,c.y,c.size,c.size);
  });
  requestAnimationFrame(drawCubes);
}
drawCubes();

// Прогресс загрузки
let progress = 0;
const progInt = setInterval(() => {
  progress += 10;
  document.querySelector('.progress').textContent = `Готовность: ${progress}%`;
  if(progress >= 100) clearInterval(progInt);
}, 80);

// Основные функции
function show(html){document.getElementById('result').innerHTML=html;document.getElementById('result').style.display='block';}
function toggleMenu(){document.getElementById('menu').style.display=document.getElementById('menu').style.display==='block'?'none':'block';}
function sendQuery(){googleSearch();}

async function generateImage(){
  const p = document.getElementById('query').value || 'кот в космосе';
  show('<p class="loading">Генерирую...</p>');
  try{
    const r = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',{method:'POST',headers:{'Authorization':`Bearer ${HF_TOKEN}`},body:JSON.stringify({inputs:p})});
    const b = await r.blob();
    const u = URL.createObjectURL(b);
    show(`<img src="${u}" style="max-width:100%;border-radius:16px;">`);
  }catch{show('<p>Ошибка генерации</p>');}
}

async function generateRecipe(){
  const q = document.getElementById('query').value || 'ужин';
  show('<p class="loading">Готовлю рецепт...</p>');
  const r = await fetch('https://api-inference.huggingface.co/models/Qwen/Qwen2.5-32B-Instruct',{method:'POST',headers:{'Authorization':`Bearer ${HF_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({inputs:`Рецепт ${q} с калориями, живой язык.`})});
  const d = await r.json();
  show(d[0]?.generated_text||'Готово!');
}

async function googleSearch(){
  const q = document.getElementById('query').value || 'что-то';
  show('<p class="loading">Ищу в Google...</p>');
  const r = await fetch('https://api.tavily.com/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({api_key:TAVILY_KEY,query:q,include_answer:true})});
  const d = await r.json();
  show(d.answer||'Не нашёл');
}

async function solveMath(){
  const q = document.getElementById('query').value || '2+2';
  show('<p class="loading">Решаю...</p>');
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjs/12.4.1/math.min.js';
  s.onload = () => { try{show(`Ответ: ${math.evaluate(q)}`)}catch{show('Не решил')} };
  document.head.appendChild(s);
}

async function makePresentation(){
  const q = document.getElementById('query').value || 'тема';
  show('<p class="loading">Создаю PPTX...</p>');
  const pptx = new PptxGenJS();
  let slide = pptx.addSlide();
  slide.addText(q, {x:1,y:1,fontSize:36,color:"ff6b35",bold:true});
  slide.addText("by mitrsht", {x:1,y:4,fontSize:18,color:"ffffff"});
  pptx.writeFile({fileName:`${q}.pptx`});
  setTimeout(()=>show('Скачивается!'),2000);
}

function voiceInput(){
  const r = new (window.SpeechRecognition||window.webkitSpeechRecognition)();
  r.lang = 'ru-RU';
  r.onresult = e => document.getElementById('query').value = e.results[0][0].transcript;
  r.start();
}

function randomFact(){
  const f = ['Земля вращается 1670 км/ч','Осьминоги имеют 3 сердца','Вселенная расширяется'];
  show(f[Math.floor(Math.random()*f.length)]);
}

function switchAccount(){alert('Смена аккаунта — скоро будет!');}
function handleFile(f){if(f[0])show('Файл загружен — анализ скоро!');}

// Логотип
document.querySelector('.logo').style.backgroundImage = "url('https://i.imgur.com/6z2Z3eE.png')";
