// Função serverless da Vercel: encaminha os leads ao Make no servidor.
// Opcional: configure MAKE_WEBHOOK_URL nas variáveis de ambiente da Vercel.
const DEFAULT_MAKE_WEBHOOK_URL = 'https://hook.us1.make.celonis.com/w1po5p25thcvr4dg49pmepsqfc0iku9o';

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Método não permitido.' });
  }

  let data = req.body;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch {
      return res.status(400).json({ ok: false, error: 'JSON inválido.' });
    }
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return res.status(400).json({ ok: false, error: 'Dados inválidos.' });
  }

  const fields = [
    'nome', 'empresa', 'cargo', 'faturamento', 'regime', 'segmento',
    'telefone', 'email', 'exporta', 'origem', 'url_pagina', 'referrer',
    'data_envio', 'utm_source', 'utm_medium', 'utm_campaign',
    'utm_content', 'utm_term', 'gclid', 'fbclid'
  ];
  const lead = Object.fromEntries(fields.map(field => [field, String(data[field] ?? '').trim().slice(0, 2048)]));

  if (!lead.nome || !lead.empresa || !lead.telefone || !/^\S+@\S+\.\S+$/.test(lead.email)) {
    return res.status(400).json({ ok: false, error: 'Campos obrigatórios inválidos.' });
  }

  try {
    const response = await fetch(process.env.MAKE_WEBHOOK_URL || DEFAULT_MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(12000)
    });

    if (!response.ok) {
      console.error('O Make não confirmou o lead. HTTP:', response.status);
      return res.status(502).json({ ok: false, error: 'Não foi possível confirmar o envio.' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Erro no encaminhamento ao Make:', error);
    return res.status(502).json({ ok: false, error: 'Serviço temporariamente indisponível.' });
  }
};
