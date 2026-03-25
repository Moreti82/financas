import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PLAN_MONTHS: Record<string, { plan: string; months: number }> = {
  pro:               { plan: 'pro',        months: 1  },
  pro_yearly:        { plan: 'pro',        months: 12 },
  enterprise:        { plan: 'enterprise', months: 1  },
  enterprise_yearly: { plan: 'enterprise', months: 12 },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const mpAccessToken = Deno.env.get('MP_ACCESS_TOKEN')!;
    const body = await req.json();

    console.log('MP Webhook received:', JSON.stringify(body));

    // MP envia type=payment para notificações de pagamento
    if (body.type !== 'payment') {
      return new Response('ok', { headers: corsHeaders });
    }

    const paymentId = body.data?.id;
    if (!paymentId) return new Response('no payment id', { headers: corsHeaders });

    // Buscar detalhes do pagamento no MP
    const payRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${mpAccessToken}` },
    });

    if (!payRes.ok) throw new Error('Falha ao buscar pagamento no MP');

    const payment = await payRes.json();
    console.log('Payment status:', payment.status, 'external_ref:', payment.external_reference);

    // Só processa pagamentos aprovados
    if (payment.status !== 'approved') {
      return new Response('payment not approved', { headers: corsHeaders });
    }

    // external_reference = "userId|planId"
    const [userId, planId] = (payment.external_reference || '').split('|');
    if (!userId || !planId) throw new Error('external_reference inválido');

    const planData = PLAN_MONTHS[planId];
    if (!planData) throw new Error(`Plano desconhecido: ${planId}`);

    // Calcular data de expiração
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + planData.months);

    // Atualizar plano do usuário no banco
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        plan: planData.plan,
        status: 'active',
        plan_expires_at: expiresAt.toISOString(),
        cancelled_at: null,
        last_payment_id: String(paymentId),
        last_payment_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Erro ao atualizar plano:', updateError);
      throw updateError;
    }

    console.log(`✅ Plano ${planData.plan} ativado para ${userId} até ${expiresAt.toISOString()}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    console.error('Webhook error:', err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
