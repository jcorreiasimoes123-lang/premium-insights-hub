import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: "Não autorizado. Por favor, inicia sessão." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Sessão inválida. Por favor, inicia sessão novamente." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;
    console.log(`Authenticated user: ${userId}`);

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "Nenhum ficheiro enviado" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file name
    const fileName = file.name;
    if (!fileName || fileName.length > 255) {
      return new Response(
        JSON.stringify({ error: "Nome de ficheiro inválido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file extension
    const allowedExtensions = ['.pdf', '.csv', '.txt'];
    const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) {
      return new Response(
        JSON.stringify({ error: "Tipo de ficheiro não suportado. Use PDF, CSV ou TXT." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Recebido ficheiro: ${fileName}, tamanho: ${file.size} bytes, tipo: ${file.type}`);

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
      if (fileExtension === ".pdf") {
        mimeType = "application/pdf";
      } else if (fileExtension === ".csv") {
        mimeType = "text/csv";
      } else if (fileExtension === ".txt") {
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
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: `És um extrator de transações bancárias portuguesas. 
REGRA ABSOLUTA: Extrai APENAS dados que EXISTEM LITERALMENTE no documento.
NUNCA inventes, estimes ou adivinhas valores ou descrições.
DISTINGUE entre DESPESAS (débitos/saídas) e RECEITAS (créditos/entradas).
Se não vires dados claros, responde com array vazio [].`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analisa este extrato bancário e extrai APENAS as transações que vês CLARAMENTE escritas.

REGRAS CRÍTICAS:
1. Extrai APENAS transações que EXISTEM no documento - NUNCA inventes
2. Cada transação DEVE ter descrição, valor e data VISÍVEIS no documento
3. Se o documento estiver ilegível, mal formatado ou vazio: responde []
4. Se não tiveres 100% certeza sobre um valor: NÃO incluas essa transação
5. Valores devem ser os EXATOS do documento (não arredondes nem estimes)
6. Máximo 50 transações

DISTINGUIR TIPO DE TRANSAÇÃO:
- type: "expense" para DÉBITOS/SAÍDAS (compras, pagamentos, transferências enviadas, levantamentos)
- type: "income" para CRÉDITOS/ENTRADAS (salário, transferências recebidas, depósitos, reembolsos)

Indicadores de DESPESA (expense):
- Valores com sinal negativo (-)
- Palavras: "Compra", "Pagamento", "Débito", "Levantamento", "TPA", "MB WAY enviado"
- Supermercados, lojas, restaurantes, serviços

Indicadores de RECEITA (income):
- Valores com sinal positivo (+)
- Palavras: "Transferência recebida", "Crédito", "Ordenado", "Salário", "Depósito", "Reembolso"
- Transferências de outras contas para esta

Para cada transação REAL que encontres:
- description: texto EXATO da descrição (máx 60 caracteres)
- amount: valor EXATO numérico positivo (sempre positivo, o type indica se é saída ou entrada)
- date: data no formato YYYY-MM-DD
- type: "expense" ou "income"
- category: categoria apropriada

Categorias para DESPESAS: "Alimentação", "Transporte", "Subscrições", "Saúde", "Lazer", "Compras", "Habitação", "Outros"
Categorias para RECEITAS: "Salário", "Freelance", "Investimentos", "Reembolso", "Transferência", "Outros"

Responde APENAS com JSON array válido, sem markdown nem explicações:
[{"description":"TEXTO EXATO","amount":12.34,"date":"2024-01-15","type":"expense","category":"Outros"}]

Se não encontrares transações claras, responde apenas: []`
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
      
      const expenseCategories = ["Alimentação", "Transporte", "Subscrições", "Saúde", "Lazer", "Compras", "Habitação", "Outros"];
      const incomeCategories = ["Salário", "Freelance", "Investimentos", "Reembolso", "Transferência", "Outros"];
      
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
          
          // Determine transaction type (default to expense if not specified)
          const type = t.type === "income" ? "income" : "expense";
          
          // Validate category based on type
          let category = t.category;
          if (type === "expense") {
            category = expenseCategories.includes(category) ? category : "Outros";
          } else {
            category = incomeCategories.includes(category) ? category : "Outros";
          }
          
          return {
            id: `import-${Date.now()}-${index}`,
            description: String(t.description).trim().substring(0, 100),
            amount: Math.abs(Number(t.amount)),
            date: date,
            type: type,
            category: category,
            selected: true,
          };
        })
        .slice(0, 50); // Limit to 50 transactions
        
    } catch (parseError) {
      console.error("Erro ao fazer parse do JSON:", parseError, content.substring(0, 200));
      transactions = [];
    }

    const expenseCount = transactions.filter((t: any) => t.type === "expense").length;
    const incomeCount = transactions.filter((t: any) => t.type === "income").length;
    
    console.log(`User ${userId} - Extraídas ${transactions.length} transações válidas (${expenseCount} despesas, ${incomeCount} receitas)`);

    return new Response(
      JSON.stringify({ 
        transactions,
        fileName: file.name,
        expenseCount,
        incomeCount,
        message: transactions.length > 0 
          ? `Encontradas ${transactions.length} transações: ${expenseCount} despesa(s) e ${incomeCount} receita(s)` 
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
