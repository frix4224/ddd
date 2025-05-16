
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import * as PDFDocument from 'https://esm.sh/pdfkit@0.13.0';
import { Buffer } from 'https://deno.land/std@0.177.0/node/buffer.ts';

interface AssessmentResult {
  theme: string;
  score: number;
  status: 'normal' | 'mild' | 'moderate' | 'severe';
}

interface Theme {
  id: string;
  title: { en: string; nl: string };
  description: { en: string; nl: string };
  icon: string;
  color: string;
  tips: { en: string[]; nl: string[] };
}

serve(async (req) => {
  try {
    // Create a Supabase client with the Auth context of the logged in user
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the request body
    const { assessmentId, language = 'en', userName } = await req.json();
    if (!assessmentId) {
      return new Response(JSON.stringify({ error: 'Missing assessmentId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create a Supabase client with the Auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authorization } } }
    );

    // Get the user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the assessment
    const { data: assessment, error: assessmentError } = await supabaseClient
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .eq('user_id', user.id)
      .single();

    if (assessmentError || !assessment) {
      return new Response(JSON.stringify({ error: 'Assessment not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the results
    const { data: results, error: resultsError } = await supabaseClient
      .from('results')
      .select('*')
      .eq('assessment_id', assessmentId);

    if (resultsError) {
      return new Response(JSON.stringify({ error: 'Error fetching results' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the themes
    const { data: themes, error: themesError } = await supabaseClient
      .from('themes')
      .select('*');

    if (themesError) {
      return new Response(JSON.stringify({ error: 'Error fetching themes' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create a PDF document
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Uint8Array[] = [];

    doc.on('data', (chunk) => {
      chunks.push(chunk);
    });

    // Create a promise that resolves when the PDF is done being generated
    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
    });

    // Add content to the PDF
    const title = language === 'en' ? 'Child Development Assessment Report' : 'Rapport Kinderontwikkelingsbeoordeling';
    const date = new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Add header
    doc.fontSize(24).text(title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`${language === 'en' ? 'Generated for' : 'Gegenereerd voor'}: ${userName}`, { align: 'center' });
    doc.fontSize(12).text(`${language === 'en' ? 'Date' : 'Datum'}: ${date}`, { align: 'center' });
    doc.moveDown(2);

    // Add summary
    doc.fontSize(16).text(language === 'en' ? 'Assessment Summary' : 'Beoordelingssamenvatting');
    doc.moveDown();

    // Add results for each theme
    for (const result of results) {
      const theme = themes.find((t) => t.id === result.theme_id);
      if (!theme) continue;

      // Get status label
      let statusLabel = '';
      switch (result.status) {
        case 'normal':
          statusLabel = language === 'en' ? 'Normal' : 'Normaal';
          break;
        case 'mild':
          statusLabel = language === 'en' ? 'Mild Concern' : 'Lichte Zorg';
          break;
        case 'moderate':
          statusLabel = language === 'en' ? 'Moderate Concern' : 'Matige Zorg';
          break;
        case 'severe':
          statusLabel = language === 'en' ? 'Significant Concern' : 'Aanzienlijke Zorg';
          break;
      }

      // Add theme title and score
      doc.fontSize(14).text(theme.title[language]);
      doc.fontSize(12).text(`${language === 'en' ? 'Score' : 'Score'}: ${result.score}% - ${statusLabel}`);
      doc.moveDown(0.5);

      // Add theme description
      doc.fontSize(12).text(theme.description[language]);
      doc.moveDown();

      // Add tips
      doc.fontSize(12).text(language === 'en' ? 'Tips:' : 'Tips:');
      theme.tips[language].forEach((tip, index) => {
        doc.fontSize(12).text(`${index + 1}. ${tip}`);
      });
      doc.moveDown(2);
    }

    // Add disclaimer
    doc.moveDown();
    doc.fontSize(10).text(
      language === 'en'
        ? 'Disclaimer: This assessment is not a diagnostic tool. If you have concerns about your child\'s development, please consult a healthcare professional.'
        : 'Disclaimer: Deze beoordeling is geen diagnostisch hulpmiddel. Als u zorgen heeft over de ontwikkeling van uw kind, raadpleeg dan een zorgprofessional.',
      { align: 'center', color: 'gray' }
    );

    // Finalize the PDF
    doc.end();
    const pdfBuffer = await pdfPromise;

    // Upload the PDF to Supabase Storage
    const timestamp = Date.now();
    const fileName = `${user.id}/${assessmentId}_${timestamp}.pdf`;
    
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('reports')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      return new Response(JSON.stringify({ error: 'Error uploading PDF' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get a signed URL for the PDF
    const { data: urlData } = await supabaseClient
      .storage
      .from('reports')
      .createSignedUrl(fileName, 60 * 60); // 1 hour expiry

    return new Response(
      JSON.stringify({
        success: true,
        url: urlData?.signedUrl,
        path: fileName,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
