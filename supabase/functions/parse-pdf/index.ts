import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to extract text from PDF using pdf-parse approach
async function extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
  // Convert to Uint8Array for processing
  const uint8Array = new Uint8Array(arrayBuffer);
  
  // Try to find text streams in PDF
  let text = "";
  const decoder = new TextDecoder("utf-8", { fatal: false });
  const rawText = decoder.decode(uint8Array);
  
  // Extract text between stream markers (simplified PDF text extraction)
  const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
  let match;
  
  while ((match = streamRegex.exec(rawText)) !== null) {
    const streamContent = match[1];
    // Filter printable characters
    const printable = streamContent.replace(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g, " ");
    if (printable.trim().length > 10) {
      text += printable + "\n";
    }
  }
  
  // Also try to extract text objects (Tj, TJ operators)
  const textObjRegex = /\(([^)]+)\)\s*Tj/g;
  while ((match = textObjRegex.exec(rawText)) !== null) {
    text += match[1] + " ";
  }
  
  // If no text found via streams, try raw extraction
  if (text.trim().length < 50) {
    // Extract anything that looks like text
    const lines = rawText.split(/[\r\n]+/);
    for (const line of lines) {
      const cleaned = line.replace(/[^\x20-\x7E\xA0-\xFF]/g, "").trim();
      if (cleaned.length > 5 && !/^[%\/\[\]<>{}]+$/.test(cleaned)) {
        text += cleaned + "\n";
      }
    }
  }
  
  return text;
}

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

    // Extract text based on file type
    let fileContent: string;
    
    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      // For PDFs, use our extraction method
      const arrayBuffer = await file.arrayBuffer();
      fileContent = await extractTextFromPdf(arrayBuffer);
      console.log(`Texto extraído do PDF (${fileContent.length} chars)`);
    } else {
      // For text files (CSV, TXT)
      fileContent = await file.text();
    }
    
    // Log a sample of the content for debugging
    console.log("Amostra do conteúdo:", fileContent.substring(0, 500));

    if (fileContent.trim().length < 20) {
      console.log("Conteúdo insuficiente extraído do ficheiro");
      return new Response(
        JSON.stringify({ 
          error: "Não foi possível extrair texto do ficheiro. O PDF pode estar protegido ou ser uma imagem.",
          transactions: [],
          message: "O ficheiro não contém texto legível. Tenta um extrato em formato diferente."
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY não configurada");
      return new Response(
        JSON.stringify({ error: "Configuração do servidor incompleta" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use AI to extract transactions with a MUCH stricter prompt
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
            content: `Tu és um extrator de dados de extratos bancários portugueses. A tua tarefa é extrair APENAS transações que existem REALMENTE no texto fornecido.

REGRAS CRÍTICAS:
1. NUNCA inventes transações - extrai APENAS o que está escrito no documento
2. Se não conseguires identificar transações claras, responde com []
3. Cada transação DEVE ter: descrição real do texto, valor numérico, data
4. NÃO assumes nomes de lojas - usa EXATAMENTE o texto que aparece no extrato
5. Se um campo estiver ilegível ou ausente, ignora essa transação
6. Valores devem ser números positivos (despesas)
7. Datas no formato YYYY-MM-DD

Categorias permitidas (escolhe a mais apropriada):
- "Alimentação": supermercados (Continente, Pingo Doce, Lidl, Aldi), restaurantes, cafés
- "Subscrições": serviços mensais recorrentes, telecomunicações, streaming
- "Outros": tudo o resto

FORMATO DE RESPOSTA - apenas JSON array, sem markdown:
[{"description": "TEXTO_EXATO_DO_EXTRATO", "amount": 12.34, "date": "2024-01-15", "category": "Outros"}]

Se o texto não contiver transações bancárias claras, responde APENAS: []`
          },
          {
            role: "user",
            content: `Extrai APENAS as transações que consegues ver claramente neste texto de extrato bancário. NÃO inventes nada:\n\n${fileContent.substring(0, 20000)}`
          }
        ],
        temperature: 0, // Zero temperature for deterministic, factual output
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
      
      // Handle empty response
      if (cleanContent === "[]" || cleanContent === "") {
        transactions = [];
      } else {
        transactions = JSON.parse(cleanContent);
      }
      
      // Validate and normalize transactions - be strict
      transactions = transactions
        .filter((t: any) => {
          // Must have all required fields with real values
          if (!t.description || !t.amount || !t.date) return false;
          // Description must have at least 2 chars
          if (String(t.description).trim().length < 2) return false;
          // Amount must be a valid number
          if (isNaN(Number(t.amount)) || Number(t.amount) <= 0) return false;
          // Date must be valid
          if (!/^\d{4}-\d{2}-\d{2}$/.test(t.date)) return false;
          return true;
        })
        .map((t: any, index: number) => ({
          id: `import-${Date.now()}-${index}`,
          description: String(t.description).trim().substring(0, 100),
          amount: Math.abs(Number(t.amount)),
          date: t.date,
          category: ["Alimentação", "Subscrições", "Outros"].includes(t.category) 
            ? t.category 
            : "Outros",
          selected: true,
        }));
        
    } catch (parseError) {
      console.error("Erro ao fazer parse do JSON:", parseError, content);
      transactions = [];
    }

    console.log(`Extraídas ${transactions.length} transações válidas`);

    return new Response(
      JSON.stringify({ 
        transactions,
        fileName: file.name,
        rawTextLength: fileContent.length,
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