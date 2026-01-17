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

    console.log(`Recebido ficheiro: ${file.name}, tamanho: ${file.size} bytes, tipo: ${file.type}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY não configurada");
      return new Response(
        JSON.stringify({ error: "Configuração do servidor incompleta" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check file size (max 10MB for base64)
    if (file.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "Ficheiro demasiado grande. Máximo 10MB." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert file to base64 for vision model
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );
    
    // Determine MIME type
    let mimeType = file.type;
    if (!mimeType || mimeType === "application/octet-stream") {
      if (file.name.toLowerCase().endsWith(".pdf")) {
        mimeType = "application/pdf";
      } else if (file.name.toLowerCase().endsWith(".csv")) {
        mimeType = "text/csv";
      } else if (file.name.toLowerCase().endsWith(".txt")) {
        mimeType = "text/plain";
      }
    }

    console.log(`Enviando ficheiro para AI com tipo: ${mimeType}`);

    // Use Gemini with vision capability to read the document directly
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analisa este extrato bancário português e extrai as transações/movimentos que vês.

REGRAS:
1. Extrai APENAS transações reais do documento
2. NUNCA inventes transações
3. Se não vires transações claras, responde []
4. Máximo 50 transações (as mais recentes)
5. Valores sempre positivos

Para cada transação:
- description: texto da descrição (máx 60 caracteres)
- amount: valor numérico positivo
- date: data YYYY-MM-DD

Categorias: "Alimentação", "Transporte", "Subscrições", "Saúde", "Lazer", "Compras", "Habitação", "Outros"

Responde APENAS com JSON array compacto, sem markdown:
[{"description":"TEXTO","amount":12.34,"date":"2024-01-15","category":"Outros"}]`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64}`
                }
              }
            ]
          }
        ],
        temperature: 0,
        max_tokens: 8000,
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
        JSON.stringify({ error: "Erro ao processar o documento com AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "[]";
    
    console.log("Resposta da AI (primeiros 500 chars):", content.substring(0, 500));
    console.log("Tamanho total da resposta:", content.length);

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
      
      // Handle empty response
      if (cleanContent === "[]" || cleanContent === "") {
        transactions = [];
      } else {
        // Try to fix truncated JSON by finding the last complete object
        if (!cleanContent.endsWith("]")) {
          console.log("JSON parece truncado, tentando corrigir...");
          // Find the last complete object (ends with })
          const lastCompleteObjIndex = cleanContent.lastIndexOf("},");
          if (lastCompleteObjIndex > 0) {
            cleanContent = cleanContent.substring(0, lastCompleteObjIndex + 1) + "]";
            console.log("JSON corrigido até posição:", lastCompleteObjIndex);
          } else {
            // Try to find just the last }
            const lastBraceIndex = cleanContent.lastIndexOf("}");
            if (lastBraceIndex > 0) {
              cleanContent = cleanContent.substring(0, lastBraceIndex + 1) + "]";
            }
          }
        }
        
        transactions = JSON.parse(cleanContent);
      }
      
      // Validate and normalize transactions
      transactions = transactions
        .filter((t: any) => {
          if (!t.description || !t.amount || !t.date) return false;
          if (String(t.description).trim().length < 2) return false;
          if (isNaN(Number(t.amount)) || Number(t.amount) <= 0) return false;
          return true;
        })
        .map((t: any, index: number) => {
          // Fix date format if needed
          let date = t.date;
          if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            const dateMatch = String(date).match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
            if (dateMatch) {
              date = `${dateMatch[3]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`;
            } else {
              date = new Date().toISOString().split('T')[0];
            }
          }
          
          return {
            id: `import-${Date.now()}-${index}`,
            description: String(t.description).trim().substring(0, 100),
            amount: Math.abs(Number(t.amount)),
            date: date,
            category: ["Alimentação", "Transporte", "Subscrições", "Saúde", "Lazer", "Compras", "Habitação", "Outros"].includes(t.category) 
              ? t.category 
              : "Outros",
            selected: true,
          };
        })
        .slice(0, 50); // Limit to 50 transactions
        
    } catch (parseError) {
      console.error("Erro ao fazer parse do JSON:", parseError, content.substring(0, 200));
      transactions = [];
    }

    console.log(`Extraídas ${transactions.length} transações válidas`);

    return new Response(
      JSON.stringify({ 
        transactions,
        fileName: file.name,
        message: transactions.length > 0 
          ? `Encontradas ${transactions.length} transações no extrato` 
          : "Não foram encontradas transações. O ficheiro pode não conter um extrato bancário válido ou o formato não é suportado."
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
