/**
 * DOCX Export Utility
 * 
 * এই file টা আলাদা রাখবেন: utils/exportDocx.ts
 * 
 * Installation required:
 * npm install docx
 */

import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  AlignmentType,
  VerticalAlign
} from 'docx';

type ApiLink = {
  link_id: number;
  link_type: 'all_self' | 'single_other';
  report_by: string | null;
  is_submitted: boolean;
  results: Record<string, Record<string, any>> | null;
};

type PatientInfo = {
  name: string;
  surname: string;
  education: number | null;
  age: string;
  sex: string;
  handedness: string;
};

type AssignmentData = {
  assignment_id: number;
  created_at: string;
  links: ApiLink[];
};

/**
 * Group results by prefix (e.g., "Disattenzione punteggio" -> group: "Disattenzione")
 */
function groupResultRows(resultDict: Record<string, any>) {
  const groups: Record<string, { label: string; value: any }[]> = {};

  for (const [k, v] of Object.entries(resultDict || {})) {
    const parts = k.split(' ');
    if (parts.length >= 2) {
      const group = parts.slice(0, -1).join(' ').trim();
      const label = parts.slice(-1)[0].trim();
      if (!groups[group]) groups[group] = [];
      groups[group].push({ label, value: v });
    } else {
      if (!groups['Altro']) groups['Altro'] = [];
      groups['Altro'].push({ label: k, value: v });
    }
  }

  const priority = (x: string) =>
    x.toLowerCase().includes('punteggio') ? 0 : x.includes('n°') ? 1 : 2;

  return Object.entries(groups).map(([group, items]) => ({
    group,
    items: items.sort((a, b) => priority(a.label) - priority(b.label)),
  }));
}

/**
 * Create patient info header table
 */
function createPatientInfoTable(patientInfo: PatientInfo, reportDate: string): Table {
  const border = { style: BorderStyle.SINGLE, size: 6, color: '333333' };
  const borders = { top: border, bottom: border, left: border, right: border };

  const headerShading = { fill: '1a1a1a', type: ShadingType.CLEAR };
  const cellPadding = { top: 100, bottom: 100, left: 150, right: 150 };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: border, bottom: border, left: border, right: border },
    rows: [
      // First row with 4 cells
      new TableRow({
        children: [
          new TableCell({
            borders,
            shading: headerShading,
            margins: cellPadding,
            width: { size: 25, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Scolarità: ', color: 'FFFFFF', bold: true }),
                  new TextRun({ text: String(patientInfo.education ?? '—'), color: 'fbbf24', bold: true }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders,
            shading: headerShading,
            margins: cellPadding,
            width: { size: 25, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Età: ', color: 'FFFFFF', bold: true }),
                  new TextRun({ text: patientInfo.age, color: 'fbbf24', bold: true }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders,
            shading: headerShading,
            margins: cellPadding,
            width: { size: 25, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Sesso: ', color: 'FFFFFF', bold: true }),
                  new TextRun({ text: patientInfo.sex, color: 'fbbf24', bold: true }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders,
            shading: headerShading,
            margins: cellPadding,
            width: { size: 25, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: 'Mano dominante: ', color: 'FFFFFF', bold: true }),
                  new TextRun({ text: patientInfo.handedness, color: 'fbbf24', bold: true }),
                ],
              }),
            ],
          }),
        ],
      }),

      // Second row - merged cell for date
      new TableRow({
        children: [
          new TableCell({
            borders,
            shading: headerShading,
            margins: cellPadding,
            columnSpan: 4,
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Valutazione neuropsicologica ambulatoriale del ${reportDate}`,
                    color: 'FFFFFF',
                    bold: true,
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

/**
 * Create results table for one link (one or more questionnaires)
 */
function createResultsTable(
  link: ApiLink,
  questionnaireNames: string[]
): Table {
  const border = { style: BorderStyle.SINGLE, size: 6, color: '444444' };
  const borders = { top: border, bottom: border, left: border, right: border };

  const headerShading = { fill: '0f0f0f', type: ShadingType.CLEAR };
  const questShading = { fill: '0a0a0a', type: ShadingType.CLEAR };
  const groupShading = { fill: '151515', type: ShadingType.CLEAR };
  const cellShading = { fill: '1f1f1f', type: ShadingType.CLEAR };

  const cellPadding = { top: 100, bottom: 100, left: 150, right: 150 };

  const resultsObj = link.results || {};
  const hasResults = Object.keys(resultsObj).length > 0;

  const rows: TableRow[] = [];

  // Header row
  rows.push(
    new TableRow({
      children: [
        new TableCell({
          borders,
          shading: headerShading,
          margins: cellPadding,
          width: { size: 35, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              children: [new TextRun({ text: 'TEST', color: 'FFFFFF', bold: true, size: 20 })],
            }),
          ],
        }),
        new TableCell({
          borders,
          shading: headerShading,
          margins: cellPadding,
          width: { size: 13, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'PG', color: 'FFFFFF', bold: true, size: 20 })],
            }),
          ],
        }),
        new TableCell({
          borders,
          shading: headerShading,
          margins: cellPadding,
          width: { size: 13, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'PC', color: 'FFFFFF', bold: true, size: 20 })],
            }),
          ],
        }),
        new TableCell({
          borders,
          shading: headerShading,
          margins: cellPadding,
          width: { size: 13, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'CUT-OFF', color: 'FFFFFF', bold: true, size: 20 })],
            }),
          ],
        }),
        new TableCell({
          borders,
          shading: headerShading,
          margins: cellPadding,
          width: { size: 13, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'STAT', color: 'FFFFFF', bold: true, size: 20 })],
            }),
          ],
        }),
        new TableCell({
          borders,
          shading: headerShading,
          margins: cellPadding,
          width: { size: 13, type: WidthType.PERCENTAGE },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'ESITO', color: 'FFFFFF', bold: true, size: 20 })],
            }),
          ],
        }),
      ],
    })
  );

  if (!hasResults) {
    // No results row
    rows.push(
      new TableRow({
        children: [
          new TableCell({
            borders,
            shading: cellShading,
            margins: cellPadding,
            columnSpan: 6,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'No results available yet (link may not be submitted)',
                    color: '999999',
                    italics: true,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
    );
  } else {
    // Process each questionnaire
    for (const [formCode, resultDict] of Object.entries(resultsObj)) {
      const grouped = groupResultRows(resultDict || {});

      // Questionnaire header row
      const isOther = link.link_type === 'single_other';
      const reporterName = isOther ? link.report_by || '—' : null;

      const questText = isOther && reporterName ? `${formCode} — ${reporterName}` : formCode;

      rows.push(
        new TableRow({
          children: [
            new TableCell({
              borders,
              shading: questShading,
              margins: cellPadding,
              columnSpan: 6,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: questText, color: 'FFFFFF', bold: true, size: 22 }),
                  ],
                }),
              ],
            }),
          ],
        })
      );

      // Process groups
      for (const { group, items } of grouped) {
        // Group header row
        rows.push(
          new TableRow({
            children: [
              new TableCell({
                borders,
                shading: groupShading,
                margins: cellPadding,
                columnSpan: 6,
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: group, color: 'E5E5E5', bold: true, italics: true, size: 20 }),
                    ],
                  }),
                ],
              }),
            ],
          })
        );

        // Item rows
        for (let idx = 0; idx < items.length; idx++) {
          const item = items[idx];
          const isFirst = idx === 0;

          const cells: TableCell[] = [];

          // TEST column (label)
          cells.push(
            new TableCell({
              borders,
              shading: cellShading,
              margins: { ...cellPadding, left: 400 }, // Indent
              width: { size: 35, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: item.label, color: 'D9D9D9', italics: true, size: 20 }),
                  ],
                }),
              ],
            })
          );

          // PG column (value)
          cells.push(
            new TableCell({
              borders,
              shading: cellShading,
              margins: cellPadding,
              width: { size: 13, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: String(item.value), color: 'FFFFFF', bold: true, size: 22 }),
                  ],
                }),
              ],
            })
          );

          // PC, CUT-OFF, STAT, ESITO - only on first row with rowSpan
          if (isFirst) {
            for (let i = 0; i < 4; i++) {
              cells.push(
                new TableCell({
                  borders,
                  shading: cellShading,
                  margins: cellPadding,
                  width: { size: 13, type: WidthType.PERCENTAGE },
                  rowSpan: items.length,
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: '—', color: '666666', size: 20 })],
                    }),
                  ],
                })
              );
            }
          }

          rows.push(new TableRow({ children: cells }));
        }
      }
    }
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  });
}

/**
 * Main export function
 */
export async function exportAssignmentToDocx(
  patientInfo: PatientInfo,
  assignmentData: AssignmentData
): Promise<void> {
  const reportDate = assignmentData.created_at
    ? new Date(assignmentData.created_at).toLocaleDateString('it-IT')
    : 'xx.xx.xxxx';

  const sections: any[] = [];

  // Patient info header table
  sections.push(createPatientInfoTable(patientInfo, reportDate));
  sections.push(new Paragraph({ text: '' })); // Spacing

  // Process each link
  const links = assignmentData.links || [];
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const questionnaireNames = link.results ? Object.keys(link.results) : [];

    // Link header
    const linkTypeText = link.link_type === 'all_self' ? 'SELF' : 'OTHER';
    const statusText = link.is_submitted ? 'Completed' : 'In Progress';

    const headerText = questionnaireNames.length > 0
      ? `${questionnaireNames.join(' • ')} [${linkTypeText}] [${statusText}]`
      : `Link #${link.link_id} [${linkTypeText}] [${statusText}]`;

    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: headerText,
            bold: true,
            size: 28,
            color: '1a1a1a',
          }),
        ],
        spacing: { before: 300, after: 200 },
      })
    );

    // Results table
    sections.push(createResultsTable(link, questionnaireNames));

    // Spacing between links
    if (i < links.length - 1) {
      sections.push(new Paragraph({ text: '' }));
      sections.push(new Paragraph({ text: '' }));
    }
  }

  // Create document
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Arial', size: 22 },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 }, // US Letter
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, // 1 inch margins
          },
        },
        children: sections,
      },
    ],
  });

  // Generate and download
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Assignment_${assignmentData.assignment_id}_${patientInfo.name}_${patientInfo.surname}.docx`;
  link.click();
  URL.revokeObjectURL(url);
}