import {
    Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun, PageOrientation
} from 'docx';
import type { Report } from '../types';

export const generateDocx = async (report: Report) => {
    const sections = report.sections.map(section => {
        // Section Header row
        const sectionHeader = new Paragraph({
            text: section.sectionTitle || 'Untitled Section',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
        });

        const referencePara = new Paragraph({
            children: [
                new TextRun({ text: 'Référence: ', bold: true }),
                new TextRun(section.referenceText || 'N/A')
            ],
            spacing: { after: 200 }
        });

        const notesPara = new Paragraph({
            children: [
                new TextRun({ text: 'Remarque: ', bold: true }),
                new TextRun(section.notes || 'N/A')
            ],
            spacing: { after: 200 }
        });

        const base64ToBuffer = (dataUrl: string) => {
            const base64 = dataUrl.split(',')[1];
            const binaryString = window.atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        };

        const mainImagePara = section.mainImage?.url ? new Paragraph({
            children: [
                new ImageRun({
                    data: base64ToBuffer(section.mainImage.url),
                    type: section.mainImage.url.startsWith('data:image/png') ? 'png' : 'jpg',
                    transformation: {
                        width: 400,
                        height: 300,
                    },
                })
            ],
            spacing: { after: 400 },
            alignment: 'center'
        }) : new Paragraph({ text: '' });

        // Create a table for items
        const tableRows = section.items.map(item => {
            const thumbnailCellChildren = [];
            if (item.smallImage) {
                thumbnailCellChildren.push(new Paragraph({
                    children: [
                        new ImageRun({
                            data: base64ToBuffer(item.smallImage),
                            type: item.smallImage.startsWith('data:image/png') ? 'png' : 'jpg',
                            transformation: {
                                width: 100,
                                height: 100,
                            },
                        })
                    ]
                }));
            } else {
                thumbnailCellChildren.push(new Paragraph('[No Image]'));
            }

            return new TableRow({
                children: [
                    new TableCell({
                        width: { size: 30, type: WidthType.PERCENTAGE },
                        margins: { top: 100, bottom: 100, left: 100, right: 100 },
                        children: thumbnailCellChildren
                    }),
                    new TableCell({
                        width: { size: 70, type: WidthType.PERCENTAGE },
                        margins: { top: 100, bottom: 100, left: 100, right: 100 },
                        children: [
                            new Paragraph({ children: [new TextRun({ text: item.productName || 'Unnamed item', bold: true })] }),
                            new Paragraph(`Statut: ${item.status === 'Custom' ? item.customStatus : item.status}`),
                            new Paragraph(`IDCAM: ${item.idcam} | UPC: ${item.upc}`),
                            new Paragraph(`Remarques: ${item.notes}`)
                        ]
                    })
                ]
            });
        });

        const itemsTable = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
                top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
                insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
            },
            rows: tableRows
        });

        return [sectionHeader, mainImagePara, referencePara, notesPara, itemsTable, new Paragraph({ text: '', spacing: { after: 600 } })];
    }).flat();

    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    size: {
                        orientation: PageOrientation.PORTRAIT,
                    },
                },
            },
            children: [
                new Paragraph({
                    text: report.reportTitle || 'Rapport de Rupture',
                    heading: HeadingLevel.HEADING_1,
                    spacing: { after: 400 }
                }),
                new Paragraph({
                    text: `Généré le: ${new Date(report.createdAt).toLocaleDateString()}`,
                    spacing: { after: 600 }
                }),
                ...sections
            ]
        }]
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.reportTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.docx`;
    a.click();
    window.URL.revokeObjectURL(url);
};
