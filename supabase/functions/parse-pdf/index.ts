import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "Nenhum ficheiro enviado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Recebido ficheiro: ${file.name}, tamanho: ${file.size} bytes`);

    // Read file as text (for basic text-based PDFs or CSV/text extracts)
    const fileContent = await file.text();
    
    // For now, we'll use AI to extract transactions from the text content
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY não configurada");
      return new Response(
        JSON.stringify({ error: "Configuração do servidor incompleta" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use AI to extract transactions from the document
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Tu és um especialista em extrair transações financeiras de extratos bancários portugueses.
Analisa o texto fornecido e extrai TODAS as transações que encontrares.
Para cada transação, identifica:
- description: descrição da transação (loja, serviço, etc.)
- amount: valor em euros (número positivo para despesas)
- date: data no formato YYYY-MM-DD
- category: uma de "Alimentação", "Subscrições", "Outros"

Categoriza assim:
- Alimentação: supermercados, restaurantes, cafés, padarias
- Subscrições: Netflix, Spotify, serviços mensais, telecomunicações
- Outros: tudo o resto

Responde APENAS com um array JSON de transações, sem texto adicional.
Se não encontrares transações válidas, responde com [].`
          },
          {
            role: "user",
            content: `Extrai as transações deste extrato bancário:\n\n${fileContent.substring(0, 15000)}`
          }
        ],
        temperature: 0.1,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Erro na AI:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de pedidos excedido. Tenta novamente mais tarde." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adiciona créditos à tua conta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "Erro ao processar o documento" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "[]";
    
    console.log("Resposta da AI:", content);

    // Parse the AI response
    let transactions = [];
    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();
      
      transactions = JSON.parse(cleanContent);
      
      // Validate and normalize transactions
      transactions = transactions
        .filter((t: any) => t.description && t.amount !== undefined && t.date)
        .map((t: any, index: number) => ({
          id: `import-${Date.now()}-${index}`,
          description: String(t.description).substring(0, 100),
          amount: Math.abs(Number(t.amount) || 0),
          date: t.date,
          category: ["Alimentação", "Subscrições", "Outros"].includes(t.category) 
            ? t.category 
            : "Outros",
          selected: true, // Pre-select all by default
        }));
        
    } catch (parseError) {
      console.error("Erro ao fazer parse do JSON:", parseError, content);
      transactions = [];
    }

    console.log(`Extraídas ${transactions.length} transações`);

    return new Response(
      JSON.stringify({ 
        transactions,
        fileName: file.name,
        message: transactions.length > 0 
          ? `Encontradas ${transactions.length} transações` 
          : "Não foram encontradas transações. Verifica se o ficheiro contém um extrato bancário válido."
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("Erro no processamento:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
