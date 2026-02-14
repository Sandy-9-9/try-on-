import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Please sign in to use virtual try-on' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: authError } = await supabaseClient.auth.getClaims(token);
    if (authError || !claimsData?.claims) {
      console.log('Auth error:', authError?.message || 'No claims found');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid or expired session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log('Authenticated user:', userId);

    const { clothImage, modelImage } = await req.json();
    
    if (!clothImage || !modelImage) {
      return new Response(
        JSON.stringify({ error: 'Both cloth and model images are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Use the next-gen image model with a very specific virtual try-on prompt
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `VIRTUAL TRY-ON TASK: You must generate a NEW image showing the person from the SECOND image wearing the clothing item from the FIRST image.

CRITICAL INSTRUCTIONS:
1. The FIRST image contains a CLOTHING ITEM (shirt, dress, jacket, etc.) - extract this garment
2. The SECOND image contains a PERSON/MODEL - keep their face, body pose, skin tone, and background
3. Generate a NEW composite image where the PERSON is wearing the CLOTHING ITEM
4. The clothing must be realistically fitted to the person's body shape and pose
5. Preserve the person's face, hair, arms, and legs exactly as they appear
6. Match lighting and shadows between the garment and person
7. The result should look like a professional fashion photo of this person wearing this exact outfit

DO NOT just return one of the input images. You MUST create a merged/composite result showing the person wearing the garment.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: clothImage
                }
              },
              {
                type: 'image_url',
                image_url: {
                  url: modelImage
                }
              }
            ]
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('AI Gateway response received, checking for images...');

    // Extract the generated image from the response
    const resultImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textResponse = data.choices?.[0]?.message?.content;

    console.log('Has result image:', !!resultImage);
    console.log('Text response:', textResponse);

    if (!resultImage) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Could not generate try-on result',
          message: textResponse || 'The AI could not process these images. Please try with clearer photos - use a front-facing person photo and a clear clothing item image.'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        resultImage,
        message: textResponse 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in virtual-try-on function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
