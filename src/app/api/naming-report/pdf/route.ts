import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { NamingReportPDF } from '@/lib/pdf/naming-report-pdf';
import type { NamingReport } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reportId } = body as { reportId: string };

    if (!reportId) {
      return NextResponse.json({ error: 'reportId is required' }, { status: 400 });
    }

    // Fetch the naming report
    const { data: reportRow, error: fetchError } = await supabase
      .from('naming_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (fetchError || !reportRow) {
      return NextResponse.json(
        { error: fetchError?.message ?? 'Report not found' },
        { status: 404 }
      );
    }

    const reportData = reportRow.report_data as NamingReport;

    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(
      React.createElement(NamingReportPDF, {
        report: reportData,
        generatedDate: new Date(reportRow.created_at).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      }) as any // eslint-disable-line @typescript-eslint/no-explicit-any
    );
    const pdfBytes = new Uint8Array(pdfBuffer);

    // Upload to Supabase Storage
    const fileName = `naming-report-${reportId}.pdf`;
    const filePath = `naming-reports/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('reports')
      .upload(filePath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      // If upload fails, still return the PDF directly
      console.error('Storage upload failed:', uploadError.message);
    } else {
      // Get public URL and update the record
      const { data: urlData } = supabase.storage
        .from('reports')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        await supabase
          .from('naming_reports')
          .update({ pdf_url: urlData.publicUrl })
          .eq('id', reportId);
      }
    }

    // Return PDF as downloadable response
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(reportData.name)}_작명보고서.pdf"`,
      },
    });
  } catch (err) {
    console.error('PDF generation error:', err);
    return NextResponse.json(
      { error: 'PDF generation failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get('id');

    if (!reportId) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Fetch the naming report
    const { data: reportRow, error: fetchError } = await supabase
      .from('naming_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (fetchError || !reportRow) {
      return NextResponse.json(
        { error: fetchError?.message ?? 'Report not found' },
        { status: 404 }
      );
    }

    // If pdf_url exists, redirect to it
    if (reportRow.pdf_url) {
      return NextResponse.redirect(reportRow.pdf_url);
    }

    // Otherwise generate on-the-fly
    const reportData = reportRow.report_data as NamingReport;

    const pdfBuffer2 = await renderToBuffer(
      React.createElement(NamingReportPDF, {
        report: reportData,
        generatedDate: new Date(reportRow.created_at).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      }) as any // eslint-disable-line @typescript-eslint/no-explicit-any
    );
    const pdfBytes2 = new Uint8Array(pdfBuffer2);

    return new NextResponse(pdfBytes2, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(reportData.name)}_작명보고서.pdf"`,
      },
    });
  } catch (err) {
    console.error('PDF generation error:', err);
    return NextResponse.json(
      { error: 'PDF generation failed' },
      { status: 500 }
    );
  }
}
