import { Document, Packer, Table, TableRow, TableCell, Paragraph, TextRun, BorderStyle, AlignmentType, VerticalAlign, convertInchesToTwip } from 'docx';
import type { QuestionnaireResult, ADHDMetrics, Patient } from '@/types';

/**
 * Export questionnaire results as a Word document (.docx)
 */
export async function exportResultsToWord(
  patient: Patient,
  results: QuestionnaireResult[],
): Promise<Blob> {
  const sections: Paragraph[] = [];

  // Add header
  sections.push(
    new Paragraph({
      text: 'NEUROPSYCHOLOGICAL ASSESSMENT REPORT',
      bold: true,
      size: 24,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
  );

  // Add patient information
  sections.push(
    new Paragraph({
      text: 'PATIENT INFORMATION',
      bold: true,
      size: 16,
      spacing: { after: 100 },
      border: {
        bottom: {
          color: '000000',
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
    }),
  );

  sections.push(
    new Paragraph({
      text: `Name: ${patient.name} ${patient.surname}`,
      spacing: { after: 50 },
    }),
  );

  sections.push(
    new Paragraph({
      text: `Date of Birth: ${patient.dateOfBirth || 'N/A'}`,
      spacing: { after: 50 },
    }),
  );

  sections.push(
    new Paragraph({
      text: `Sex: ${patient.sex || 'N/A'}`,
      spacing: { after: 50 },
    }),
  );

  sections.push(
    new Paragraph({
      text: `Years of Education: ${patient.yearsOfEducation || 'N/A'}`,
      spacing: { after: 300 },
    }),
  );

  // Add results table for each questionnaire
  for (const result of results) {
    sections.push(
      new Paragraph({
        text: 'ASSESSMENT RESULTS',
        bold: true,
        size: 16,
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: '000000',
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6,
          },
        },
      }),
    );

    // Create results table
    const resultsTable = createResultsTable(result);
    sections.push(resultsTable);

    // Add spacing between questionnaires
    sections.push(
      new Paragraph({
        text: '',
        spacing: { after: 200 },
      }),
    );
  }

  // Create document
  const doc = new Document({
    sections: [
      {
        children: sections,
        properties: {},
      },
    ],
  });

  // Convert to blob
  const blob = await Packer.toBlob(doc);
  return blob;
}

/**
 * Create a formatted results table matching the specified template
 * Template: TEST | PG | PC | CUT-OFF | STAT | ESITO
 */
function createResultsTable(result: QuestionnaireResult): Paragraph {
  // Create table rows
  const rows: TableRow[] = [];

  // Header row
  rows.push(
    new TableRow({
      cells: [
        new TableCell({
          children: [new Paragraph({ text: 'TEST', bold: true })],
          shading: { fill: 'D3D3D3' },
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: 'PG', bold: true })],
          shading: { fill: 'D3D3D3' },
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: 'PC', bold: true })],
          shading: { fill: 'D3D3D3' },
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: 'CUT-OFF', bold: true })],
          shading: { fill: 'D3D3D3' },
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: 'STAT', bold: true })],
          shading: { fill: 'D3D3D3' },
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ text: 'ESITO', bold: true })],
          shading: { fill: 'D3D3D3' },
          verticalAlign: VerticalAlign.CENTER,
        }),
      ],
    }),
  );

  // Data rows
  const metrics = result.calculatedMetrics as ADHDMetrics;
  const metricsData = [
    {
      name: 'Disattenzione - Punteggio',
      pg: metrics.disattenzioniPunteggio,
      pc: calculatePercentile(metrics.disattenzioniPunteggio, 40),
    },
    {
      name: 'Disattenzione - N° Sintomi',
      pg: metrics.disattenzioniSintomi,
      pc: (metrics.disattenzioniSintomi / 8) * 100,
    },
    {
      name: 'Iperattività - Punteggio',
      pg: metrics.iperattivitaPunteggio,
      pc: calculatePercentile(metrics.iperattivitaPunteggio, 32),
    },
    {
      name: 'Iperattività - N° Sintomi',
      pg: metrics.iperattivitaSintomi,
      pc: (metrics.iperattivitaSintomi / 5) * 100,
    },
    {
      name: 'Impulsività - Punteggio',
      pg: metrics.impulsivitaPunteggio,
      pc: calculatePercentile(metrics.impulsivitaPunteggio, 12),
    },
    {
      name: 'Impulsività - N° Sintomi',
      pg: metrics.impulsivitaSintomi,
      pc: (metrics.impulsivitaSintomi / 3) * 100,
    },
    {
      name: 'SCT - Punteggio',
      pg: metrics.sctPunteggio,
      pc: calculatePercentile(metrics.sctPunteggio, 20),
    },
    {
      name: 'Totale ADHD - Punteggio',
      pg: metrics.totaleAdhPunteggio,
      pc: calculatePercentile(metrics.totaleAdhPunteggio, 84),
    },
    {
      name: 'Totale ADHD - N° Sintomi',
      pg: metrics.totaleAdhSintomi,
      pc: (metrics.totaleAdhSintomi / 16) * 100,
    },
  ];

  for (const metric of metricsData) {
    const percentile = Math.round(metric.pc);
    const cutoff = metric.pg >= 6 ? '≥93°' : '–';
    const significance = percentile >= 90 ? '*' : '–';
    const outcome = percentile >= 90 ? 'Clinico' : 'Nella norma';

    rows.push(
      new TableRow({
        cells: [
          new TableCell({
            children: [new Paragraph({ text: metric.name, italics: true })],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph({ text: metric.pg.toString(), alignment: AlignmentType.CENTER })],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph({ text: `${percentile}°`, alignment: AlignmentType.CENTER })],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph({ text: cutoff, alignment: AlignmentType.CENTER })],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph({ text: significance, alignment: AlignmentType.CENTER })],
            verticalAlign: VerticalAlign.CENTER,
          }),
          new TableCell({
            children: [new Paragraph({ text: outcome, alignment: AlignmentType.CENTER })],
            verticalAlign: VerticalAlign.CENTER,
          }),
        ],
      }),
    );
  }

  return new Paragraph({
    children: [
      new Table({
        rows,
        width: { size: 100, type: 'pct' },
      }),
    ],
  });
}

/**
 * Calculate percentile based on raw score
 */
function calculatePercentile(rawScore: number, maxScore: number): number {
  return (rawScore / maxScore) * 100;
}

/**
 * Export results as a formatted PDF (requires additional library)
 * This is a placeholder for future implementation
 */
export async function exportResultsToPDF(
  patient: Patient,
  results: QuestionnaireResult[],
): Promise<Blob> {
  // TODO: Implement PDF export using a library like pdfkit or puppeteer
  throw new Error('PDF export not yet implemented');
}

/**
 * Export results as CSV for data analysis
 */
export function exportResultsToCSV(
  patient: Patient,
  results: QuestionnaireResult[],
): string {
  const rows: string[] = [];

  // Header
  rows.push('Patient,Questionnaire,Metric,Raw_Score,Percentile,Status');

  // Data rows
  for (const result of results) {
    const metrics = result.calculatedMetrics as ADHDMetrics;
    const metricsData = [
      { name: 'Disattenzione Sintomi', value: metrics.disattenzioniSintomi },
      { name: 'Disattenzione Punteggio', value: metrics.disattenzioniPunteggio },
      { name: 'Iperattività Punteggio', value: metrics.iperattivitaPunteggio },
      { name: 'Iperattività Sintomi', value: metrics.iperattivitaSintomi },
      { name: 'Impulsività Punteggio', value: metrics.impulsivitaPunteggio },
      { name: 'Impulsività Sintomi', value: metrics.impulsivitaSintomi },
      { name: 'Totale ADHD Punteggio', value: metrics.totaleAdhPunteggio },
      { name: 'Totale ADHD Sintomi', value: metrics.totaleAdhSintomi },
    ];

    for (const metric of metricsData) {
      rows.push(
        `"${patient.name} ${patient.surname}","${result.questionnaireId}","${metric.name}","${metric.value}","${result.percentileRank || 'N/A'}","${result.cutOffStatus}"`,
      );
    }
  }

  return rows.join('\n');
}

/**
 * Download file with automatic filename generation
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
