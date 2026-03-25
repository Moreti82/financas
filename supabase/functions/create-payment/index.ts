import { createClient } from 'npm:@supabase/supabase-js@2';

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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('=== create-payment invoked ===');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    if (!authHeader) throw new Error('Não autorizado');

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    console.log('User found:', !!user, 'Auth error:', authError?.message);
    if (authError || !user) throw new Error('Usuário não encontrado');

    const { planId } = await req.json();
    console.log('Plan ID:', planId);
    const plan = PLAN_PRICES[planId];
    if (!plan) throw new Error('Plano inválido: ' + planId);

    const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN');
    console.log('MP Token present:', !!mpAccessToken);
    if (!mpAccessToken) throw new Error('Mercado Pago não configurado');

    const appUrl = Deno.env.get('APP_URL') || 'https://financas.vercel.app';

    // Criar preferência no Mercado Pago
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
      const err = await mpRes.text();
      throw new Error(`Mercado Pago: ${err}`);
    }

    const mpData = await mpRes.json();

    return new Response(JSON.stringify({
      checkoutUrl: mpData.init_point,
      preferenceId: mpData.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('create-payment error:', err.message);
    // Sempre retorna 200 para o Supabase SDK conseguir ler o corpo do erro
    return new Response(JSON.stringify({ error: err.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
