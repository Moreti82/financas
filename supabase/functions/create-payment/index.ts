import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PLAN_PRICES: Record<string, { title: string; amount: number; months: number }> = {
  pro: { title: 'FinançasPro - Plano Pro', amount: 9.90, months: 1 },
  pro_yearly: { title: 'FinançasPro - Plano Pro Anual', amount: 99.00, months: 12 },
  enterprise: { title: 'FinançasPro - Plano Enterprise', amount: 29.90, months: 1 },
  enterprise_yearly: { title: 'FinançasPro - Plano Enterprise Anual', amount: 299.00, months: 12 },
};

Deno.serve(async (req) => {
  // CORS check
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get Auth Token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Não autorizado (sem token)');

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) throw new Error('Usuário não encontrado ou sessão expirada');

    // Get JSON body
    const body = await req.json().catch(() => ({}));
    const { planId } = body;
    
    if (!planId) throw new Error('planId não informado');
    
    const plan = PLAN_PRICES[planId];
    if (!plan) throw new Error('Plano inválido: ' + planId);

    const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN');
    if (!mpAccessToken) throw new Error('Mercado Pago não configurado (MP_ACCESS_TOKEN faltando)');

    const appUrl = Deno.env.get('APP_URL') || 'https://financas.vercel.app';

    // Create MP Preference
    const mpBody = {
      items: [{
        id: planId,
        title: plan.title,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: plan.amount,
      }],
      payer: {
        email: user.email,
      },
      external_reference: `${user.id}|${planId}`,
      back_urls: {
        success: `${appUrl}/payment-success`,
        failure: `${appUrl}/payment-failure`,
        pending: `${appUrl}/payment-pending`,
      },
      auto_return: 'approved',
      notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mp-webhook`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
        months: plan.months,
      },
    };

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mpBody),
    });

    if (!mpRes.ok) {
      const errText = await mpRes.text();
      throw new Error(`Mercado Pago: ${errText}`);
    }

    const mpData = await mpRes.json();

    return new Response(JSON.stringify({
      checkoutUrl: mpData.init_point,
      preferenceId: mpData.id,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('Error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 200, // Retorna 200 para o Supabase Client ler o corpo do erro
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

