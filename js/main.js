
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){ entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  });
},{threshold:.14});

document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

// Envio do formulário via função da Vercel, sem expor o webhook do Make no navegador.
const form = document.getElementById('leadForm');
const success = document.getElementById('successMsg');
const submitButton = form?.querySelector('button[type="submit"]');
const originalButtonText = submitButton?.textContent || 'Solicite um diagnóstico gratuito';
let isSubmitting = false;
// Máscara de telefone brasileiro com DDD: (00) 0000-0000 ou (00) 00000-0000.
const phoneInput = form?.querySelector('input[name="telefone"]');
const formatPhone = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 2) return `(${digits}`;
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  const split = digits.length > 10 ? 5 : 4;
  return `(${ddd}) ${rest.slice(0, split)}${rest.length > split ? '-' + rest.slice(split) : ''}`;
};
phoneInput?.addEventListener('input', () => {
  phoneInput.value = formatPhone(phoneInput.value);
  phoneInput.setCustomValidity('');
});
phoneInput?.addEventListener('blur', () => {
  const digits = phoneInput.value.replace(/\D/g, '');
  phoneInput.setCustomValidity(digits.length === 10 || digits.length === 11 ? '' : 'Informe um telefone com DDD válido (10 ou 11 dígitos).');
});

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (isSubmitting) return;
  const phoneDigits = phoneInput?.value.replace(/\D/g, '') || '';
  phoneInput?.setCustomValidity(phoneDigits.length === 10 || phoneDigits.length === 11 ? '' : 'Informe um telefone com DDD válido (10 ou 11 dígitos).');
  if (!form.reportValidity()) return;

  const data = Object.fromEntries(new FormData(form).entries());
  const params = new URLSearchParams(window.location.search);
  const payload = {
    ...data,
    origem: 'Landing Page Auditor Consultores',
    url_pagina: window.location.href,
    referrer: document.referrer || '',
    data_envio: new Date().toISOString(),
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '',
    utm_term: params.get('utm_term') || '',
    gclid: params.get('gclid') || '',
    fbclid: params.get('fbclid') || ''
  };

  isSubmitting = true;
  submitButton.disabled = true;
  submitButton.textContent = 'Enviando...';
  success.style.display = 'none';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    if (!response.ok) throw new Error('O envio não foi confirmado.');

    // O GTM recebe o evento apenas após confirmação do servidor.
    document.dispatchEvent(new CustomEvent('auditor:lead-success'));
    window.setTimeout(() => window.location.assign('/obrigado/'), 450);
  } catch (error) {
    console.error('Não foi possível enviar o formulário:', error);
    success.textContent = 'Não foi possível enviar sua solicitação. Tente novamente em instantes.';
    success.style.display = 'block';
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
    isSubmitting = false;
  } finally {
    clearTimeout(timeout);
  }
});


(()=>{
 const section=document.querySelector('.proof-strip');
 if(!section||!('IntersectionObserver' in window))return;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 if(reduced.matches)return;
 const watcher=new IntersectionObserver(entries=>{
  if(!entries.some(entry=>entry.isIntersecting))return;
  watcher.disconnect();section.classList.add('proof-play');
  section.querySelectorAll('[data-count]').forEach((el,index)=>{
   const target=Number(el.dataset.count),finalText=el.textContent;
   const duration=1400,delay=index*120;let start;
   function tick(now){
    if(reduced.matches){el.textContent=finalText;return;}
    if(start===undefined)start=now+delay;
    const progress=Math.min(1,Math.max(0,(now-start)/duration));
    const value=target*(1-Math.pow(1-progress,3));
    const formatted=target===1?value.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1}):String(Math.floor(value));
    el.textContent=progress===1?finalText:el.dataset.prefix+formatted+el.dataset.suffix;
    if(progress<1)requestAnimationFrame(tick);
   }
   requestAnimationFrame(tick);
  });
 },{threshold:.25});watcher.observe(section);
})();



(()=>{
 const cards=document.querySelectorAll('.cases-grid .case-card');
 if(!cards.length||!('IntersectionObserver' in window))return;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 if(reduced.matches)return;
 const observer=new IntersectionObserver(entries=>{
  entries.filter(entry=>entry.isIntersecting).forEach((entry,index)=>{
   const card=entry.target;observer.unobserve(card);
   const delay=index*120;card.style.animationDelay=delay+'ms';card.classList.add('case-enter');
   const el=card.querySelector('[data-case-count]');if(!el)return;
   const target=Number(el.dataset.caseCount),decimals=Number(el.dataset.caseDecimals),finalText=el.textContent;let start;
   function tick(now){
    if(reduced.matches){el.textContent=finalText;return;}
    if(start===undefined)start=now+delay;
    const progress=Math.min(1,Math.max(0,(now-start)/1400));
    const value=target*(1-Math.pow(1-progress,3));
    el.textContent=progress===1?finalText:(decimals?value:Math.floor(value)).toLocaleString('pt-BR',{minimumFractionDigits:decimals,maximumFractionDigits:decimals});
    if(progress<1)requestAnimationFrame(tick);
   }
   requestAnimationFrame(tick);
  });
 },{threshold:.25});cards.forEach(card=>observer.observe(card));
})();


(()=>{const section=document.querySelector('#cases');if(!section||!('IntersectionObserver' in window))return;const reduce=matchMedia('(prefers-reduced-motion: reduce)');if(reduce.matches)return;const observer=new IntersectionObserver(entries=>{if(!entries.some(e=>e.isIntersecting))return;observer.disconnect();section.classList.add('play-results');const start=performance.now(),numbers=[...section.querySelectorAll('[data-result]')];function tick(now){const p=reduce.matches?1:Math.min(1,(now-start)/1500);numbers.forEach(el=>{el.textContent=Math.round(Number(el.dataset.result)*(1-Math.pow(1-p,3))).toLocaleString('pt-BR')});if(p<1)requestAnimationFrame(tick)}requestAnimationFrame(tick)},{threshold:.2});observer.observe(section)})();

(()=>{const reduce=matchMedia('(prefers-reduced-motion: reduce)');if(reduce.matches||!('IntersectionObserver' in window))return;const progress=document.createElement('div');progress.id='reading-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);let queued=false;const update=()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform='scaleX('+(max?Math.min(1,scrollY/max):0)+')';queued=false};addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update)}},{passive:true});update();const active=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('motion-on',e.isIntersecting&&!reduce.matches)),{threshold:.12});document.querySelectorAll('#cases,.people-visual,.risk-visual').forEach(el=>active.observe(el));const entrance=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;entrance.unobserve(e.target);if(reduce.matches||!e.target.animate)return;const siblings=[...e.target.parentElement.children];const delay=Math.min(siblings.indexOf(e.target)%4,3)*95;e.target.animate([{opacity:0,transform:'translateY(26px)'},{opacity:1,transform:'translateY(0)'}],{duration:850,delay,easing:'cubic-bezier(.2,.7,.2,1)',fill:'backwards'})}),{threshold:.1});document.querySelectorAll('.hero-copy,.people-visual,.reason-head,.reason-card,.aud-card,.mini-card,.step,.sector-list>div,.result-copy,.result-panel,.contact-copy,.lead-form,.urgency-inner').forEach(el=>entrance.observe(el));reduce.addEventListener('change',()=>{if(reduce.matches){document.querySelectorAll('.motion-on').forEach(el=>el.classList.remove('motion-on'));document.getAnimations().forEach(a=>a.cancel())}})})();

// Keyboard-accessible tablet/mobile navigation.
(() => {
  const button = document.querySelector('.nav-toggle');
  const menu = document.getElementById('nav-links');
  if (!button || !menu) return;
  const close = () => {
    menu.dataset.open = 'false';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Abrir menu');
  };
  button.addEventListener('click', () => {
    const open = menu.dataset.open !== 'true';
    menu.dataset.open = String(open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      const wasOpen = menu.dataset.open === 'true';
      close();
      if (wasOpen) button.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!button.contains(event.target) && !menu.contains(event.target)) close();
  });
})();

// Future CRM integration should dispatch this event only after a confirmed
// successful server response. An attempted/blocked submit is NOT a conversion.
document.addEventListener('auditor:lead-success', () => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'lead_form_success',
    form_id: 'leadForm'
  });
});
