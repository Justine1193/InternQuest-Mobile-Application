import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export interface WeeklyReportEntry {
  date: string;
  timeIn: string;
  timeOut: string;
  hours: number;
  taskCompleted: string;
  remarks?: string;
}

export interface WeeklyReportData {
  traineeName: string;
  departmentAssigned: string;
  companyName: string;
  monthCovered: string;
  entries: WeeklyReportEntry[];
  preparedByName?: string;
  preparedByTitle?: string;
  notedByName?: string;
  notedByTitle?: string;
  receivedByName?: string;
  receivedByTitle?: string;
  leftLogoUrl?: string;
  rightLogoUrl?: string;
  submittedDate?: string;
}

export class PDFGenerator {
  static async generateWeeklyReportPDF(reportData: WeeklyReportData): Promise<string> {
    const htmlContent = this.generateHTMLContent(reportData);

    try {
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      return uri;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }

  static async sharePDF(pdfUri: string, filename: string): Promise<void> {
    if (Platform.OS === 'web') {
      // For web, create a download link
      const link = document.createElement('a');
      link.href = pdfUri;
      link.download = filename;
      link.click();
    } else {
      // For mobile, use sharing
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(pdfUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Weekly Report',
          UTI: 'com.adobe.pdf',
        });
      }
    }
  }

  private static generateHTMLContent(reportData: WeeklyReportData): string {
    const currentDate = reportData.submittedDate
      ? reportData.submittedDate
      : new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
    const totalHours = reportData.entries.reduce((sum, entry) => sum + (Number(entry.hours) || 0), 0);
    const preparedByName = reportData.preparedByName || reportData.traineeName || '';
    const preparedByTitle = reportData.preparedByTitle || 'Trainee';
    const notedByName = reportData.notedByName || '';
    const notedByTitle = reportData.notedByTitle || 'Job Title of Supervisor';
    const receivedByName = reportData.receivedByName || '';
    const receivedByTitle = reportData.receivedByTitle || 'OJT Adviser';

    const entryRows = reportData.entries
      .map(
        (entry) => `
        <tr>
          <td>${entry.date || ''}</td>
          <td>${entry.timeIn || ''}</td>
          <td>${entry.timeOut || ''}</td>
          <td>${entry.hours || ''}</td>
          <td>${entry.taskCompleted || ''}</td>
          <td>${entry.remarks || ''}</td>
        </tr>`
      )
      .join('');

    const headerLogos = `
      <div class="logo-wrapper">
        <div class="logo-box">
          ${
            reportData.leftLogoUrl
              ? `<img src="${reportData.leftLogoUrl}" alt="Left Logo" />`
              : `<div class="logo-placeholder">LOGO</div>`
          }
        </div>
        <div class="logo-box">
          ${
            reportData.rightLogoUrl
              ? `<img src="${reportData.rightLogoUrl}" alt="Right Logo" />`
              : `<div class="logo-placeholder">LOGO</div>`
          }
        </div>
      </div>
    `;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Weekly Accomplishment Report</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 32px;
              background-color: #f6f6f6;
              color: #333;
            }
            .report {
              background: #fff;
              max-width: 900px;
              margin: 0 auto;
              padding: 32px 40px;
              border: 1px solid #dcdcdc;
            }
            .logo-wrapper {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 16px;
            }
            .logo-box {
              width: 90px;
              height: 90px;
              border: 1px solid #ddd;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
              overflow: hidden;
            }
            .logo-box img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            .logo-placeholder {
              font-size: 12px;
              color: #999;
            }
            .header-text {
              text-align: center;
              margin-bottom: 16px;
            }
            .header-text h1 {
              font-size: 20px;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .header-text h2 {
              font-size: 18px;
              margin: 8px 0 4px;
              text-transform: uppercase;
            }
            .header-text p {
              margin: 4px 0;
              font-size: 12px;
              letter-spacing: 0.5px;
            }
            .highlight-title {
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              margin: 16px 0 24px;
            }
            .meta-table,
            .entries-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
              font-size: 13px;
            }
            .meta-table td {
              border: 1px solid #000;
              padding: 8px 10px;
            }
            .meta-label {
              width: 20%;
              font-weight: bold;
              text-transform: uppercase;
            }
            .entries-table th,
            .entries-table td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
              vertical-align: top;
            }
            .entries-table th {
              text-align: center;
              background-color: #f0f0f0;
            }
            .total-row td {
              font-weight: bold;
              text-transform: uppercase;
            }
            .summary-row {
              font-weight: bold;
            }
            .footer-signatures {
              margin-top: 24px;
              display: flex;
              justify-content: space-between;
              text-align: center;
            }
            .signature-block {
              width: 30%;
            }
            .signature-line {
              margin-top: 48px;
              border-top: 1px solid #000;
              padding-top: 4px;
              font-size: 12px;
            }
            .signature-label {
              font-size: 11px;
              text-transform: uppercase;
              color: #666;
            }
            .submitted-row {
              margin-top: 16px;
              display: flex;
              justify-content: space-between;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="report">
            ${headerLogos}
            <div class="header-text">
              <h2>New Era University</h2>
              <p>College of Computer Studies</p>
              <p>Department of Information Technology</p>
              <h1>Weekly Accomplishment Report</h1>
              <p>On the Job Training</p>
            </div>

            <table class="meta-table">
              <tr>
                <td class="meta-label">Trainee:</td>
                <td>${reportData.traineeName || ''}</td>
                <td class="meta-label">Department Assigned:</td>
                <td>${reportData.departmentAssigned || ''}</td>
              </tr>
              <tr>
                <td class="meta-label">Company:</td>
                <td>${reportData.companyName || ''}</td>
                <td class="meta-label">Month Covered:</td>
                <td>${reportData.monthCovered || ''}</td>
              </tr>
            </table>

            <table class="entries-table">
              <thead>
                <tr>
                  <th style="width: 12%;">Date</th>
                  <th style="width: 10%;">Time IN</th>
                  <th style="width: 10%;">Time OUT</th>
                  <th style="width: 10%;">Number of Hours</th>
                  <th style="width: 38%;">Task Completed</th>
                  <th style="width: 20%;">Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${entryRows}
                <tr class="total-row">
                  <td colspan="3">Total Number of Hours</td>
                  <td>${totalHours}</td>
                  <td colspan="2"></td>
                </tr>
              </tbody>
            </table>

            <div class="submitted-row">
              <span>Prepared by:</span>
              <span>Noted by:</span>
              <span>Received by:</span>
            </div>

            <div class="footer-signatures">
              <div class="signature-block">
                <div class="signature-line">${preparedByName}</div>
                <div class="signature-label">${preparedByTitle}</div>
              </div>
              <div class="signature-block">
                <div class="signature-line">${notedByName}</div>
                <div class="signature-label">${notedByTitle}</div>
              </div>
              <div class="signature-block">
                <div class="signature-line">${receivedByName}</div>
                <div class="signature-label">${receivedByTitle}</div>
              </div>
            </div>

            <div class="submitted-row">
              <span>Date Submitted: ${currentDate}</span>
              <span></span>
              <span></span>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static async generateMultipleReportsPDF(): Promise<string> {
    throw new Error('generateMultipleReportsPDF is not implemented for the tabular template yet.');
  }
}

export default PDFGenerator;