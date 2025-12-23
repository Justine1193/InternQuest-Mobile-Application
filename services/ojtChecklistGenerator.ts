import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export interface OJTChecklistData {
  studentName: string;
  studentId?: string;
  course?: string;
  companyName: string;
  departmentAssigned?: string;
  startDate?: string;
  endDate?: string;
  completedDate: string;
  coordinatorName: string;
  coordinatorSignatureUrl?: string;
  adviserName: string;
  adviserSignatureUrl?: string;
  requirements: Array<{
    title: string;
    status: 'approved' | 'rejected' | 'pending';
  }>;
  schoolLogoUrl?: string;
  companyLogoUrl?: string;
}

export class OJTChecklistGenerator {
  static async generateOJTChecklistPDF(checklistData: OJTChecklistData): Promise<string> {
    const htmlContent = this.generateHTMLContent(checklistData);

    try {
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      return uri;
    } catch (error) {
      console.error('Error generating OJT Checklist PDF:', error);
      throw new Error('Failed to generate OJT Checklist PDF');
    }
  }

  static async sharePDF(pdfUri: string, filename: string): Promise<void> {
    if (Platform.OS === 'web') {
      const link = document.createElement('a');
      link.href = pdfUri;
      link.download = filename;
      link.click();
    } else {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share OJT Checklist',
          UTI: 'com.adobe.pdf',
        });
      }
    }
  }

  private static generateHTMLContent(data: OJTChecklistData): string {
    const coordinatorSignatureHtml = data.coordinatorSignatureUrl
      ? `<img src="${data.coordinatorSignatureUrl}" alt="Coordinator Signature" style="max-width: 120px; max-height: 60px; margin-top: 8px;" />`
      : `<div style="margin-top: 30px; border-top: 1px solid #000; width: 150px;"></div>`;

    const adviserSignatureHtml = data.adviserSignatureUrl
      ? `<img src="${data.adviserSignatureUrl}" alt="Adviser Signature" style="max-width: 120px; max-height: 60px; margin-top: 8px;" />`
      : `<div style="margin-top: 30px; border-top: 1px solid #000; width: 150px;"></div>`;

    const requirementRows = data.requirements
      .map(
        (req, idx) => `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td>${req.title}</td>
          <td style="text-align: center;">
            ${
              req.status === 'approved'
                ? '<span style="color: #4CAF50; font-weight: bold;">✓</span>'
                : req.status === 'rejected'
                  ? '<span style="color: #F44336; font-weight: bold;">✗</span>'
                  : '<span style="color: #FF9800;">Pending</span>'
            }
          </td>
        </tr>`
      )
      .join('');

    const headerLogos = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <div style="width: 80px; height: 80px; border: 1px solid #ddd; border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden;">
          ${
            data.schoolLogoUrl
              ? `<img src="${data.schoolLogoUrl}" alt="School Logo" style="width: 100%; height: 100%; object-fit: contain;" />`
              : '<div style="font-size: 12px; color: #999;">SCHOOL</div>'
          }
        </div>
        <div style="text-align: center;">
          <h2 style="margin: 0; font-size: 18px;">NEW ERA UNIVERSITY</h2>
          <p style="margin: 4px 0; font-size: 12px;">College of Computer Studies</p>
          <p style="margin: 4px 0; font-size: 12px;">Department of Information Technology</p>
          <h1 style="margin: 8px 0; font-size: 16px; text-transform: uppercase;">OJT Completion Checklist</h1>
        </div>
        <div style="width: 80px; height: 80px; border: 1px solid #ddd; border-radius: 50%; display: flex; align-items: center; justify-content: center; overflow: hidden;">
          ${
            data.companyLogoUrl
              ? `<img src="${data.companyLogoUrl}" alt="Company Logo" style="width: 100%; height: 100%; object-fit: contain;" />`
              : '<div style="font-size: 12px; color: #999;">COMPANY</div>'
          }
        </div>
      </div>
    `;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>OJT Completion Checklist</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 32px;
              background-color: #f6f6f6;
              color: #333;
            }
            .checklist {
              background: #fff;
              max-width: 900px;
              margin: 0 auto;
              padding: 32px 40px;
              border: 1px solid #dcdcdc;
            }
            .header {
              text-align: center;
              margin-bottom: 24px;
            }
            .info-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 12px;
            }
            .info-table td {
              border: 1px solid #000;
              padding: 10px;
            }
            .info-label {
              font-weight: bold;
              width: 25%;
              background-color: #f0f0f0;
            }
            .requirements-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 12px;
            }
            .requirements-table th,
            .requirements-table td {
              border: 1px solid #000;
              padding: 10px;
              text-align: left;
            }
            .requirements-table th {
              background-color: #f0f0f0;
              font-weight: bold;
              text-align: center;
            }
            .signatures {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
              text-align: center;
              font-size: 12px;
            }
            .signature-block {
              width: 45%;
            }
            .signature-line {
              margin-top: 50px;
              padding-top: 8px;
              border-top: 1px solid #000;
              min-height: 60px;
              display: flex;
              align-items: flex-end;
              justify-content: center;
            }
            .signature-title {
              margin-top: 8px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .submitted-date {
              margin-top: 20px;
              text-align: right;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="checklist">
            ${headerLogos}

            <table class="info-table">
              <tr>
                <td class="info-label">Student Name:</td>
                <td>${data.studentName}</td>
                <td class="info-label">Student ID:</td>
                <td>${data.studentId || 'N/A'}</td>
              </tr>
              <tr>
                <td class="info-label">Course:</td>
                <td>${data.course || 'N/A'}</td>
                <td class="info-label">Company:</td>
                <td>${data.companyName}</td>
              </tr>
              <tr>
                <td class="info-label">Department Assigned:</td>
                <td>${data.departmentAssigned || 'N/A'}</td>
                <td class="info-label">OJT Period:</td>
                <td>${data.startDate || 'N/A'} to ${data.endDate || 'N/A'}</td>
              </tr>
            </table>

            <h3 style="text-align: center; margin: 24px 0 12px;">Requirements Status</h3>
            <table class="requirements-table">
              <thead>
                <tr>
                  <th style="width: 8%;">No.</th>
                  <th style="width: 70%;">Requirement</th>
                  <th style="width: 22%;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${requirementRows}
              </tbody>
            </table>

            <p style="text-align: center; margin-top: 16px; font-size: 12px;">
              <strong>Date Completed:</strong> ${data.completedDate}
            </p>

            <div class="signatures">
              <div class="signature-block">
                <div style="font-size: 11px; font-weight: bold;">VERIFIED BY COORDINATOR</div>
                <div class="signature-line">
                  ${coordinatorSignatureHtml}
                </div>
                <div class="signature-title">${data.coordinatorName}</div>
                <div style="font-size: 10px; color: #666;">OJT Coordinator</div>
              </div>
              <div class="signature-block">
                <div style="font-size: 11px; font-weight: bold;">APPROVED BY ADVISER</div>
                <div class="signature-line">
                  ${adviserSignatureHtml}
                </div>
                <div class="signature-title">${data.adviserName}</div>
                <div style="font-size: 10px; color: #666;">OJT Adviser</div>
              </div>
            </div>

            <div class="submitted-date">
              Generated on: ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export default OJTChecklistGenerator;
