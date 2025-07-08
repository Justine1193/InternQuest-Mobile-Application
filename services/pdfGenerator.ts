import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export interface WeeklyReportData {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  tasks: string[];
  learnings: string[];
  outcomes: string[];
  challenges: string[];
  nextWeekPlan: string[];
  attachments: string[];
  createdAt: Date;
  studentName: string;
  companyName: string;
  supervisorName?: string;
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
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Weekly Report - Week ${reportData.weekNumber}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f8f9fa;
              color: #333;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background-color: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #007bff;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #007bff;
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .header h2 {
              color: #666;
              margin: 10px 0 0 0;
              font-size: 18px;
              font-weight: normal;
            }
            .report-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              padding: 15px;
              background-color: #f8f9fa;
              border-radius: 6px;
            }
            .info-item {
              text-align: center;
            }
            .info-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .info-value {
              font-size: 14px;
              color: #333;
              font-weight: 600;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #007bff;
              margin-bottom: 15px;
              padding-bottom: 5px;
              border-bottom: 2px solid #e9ecef;
            }
            .list-item {
              margin-bottom: 8px;
              padding-left: 20px;
              position: relative;
            }
            .list-item:before {
              content: "•";
              color: #007bff;
              font-weight: bold;
              position: absolute;
              left: 0;
            }
            .attachments {
              margin-top: 30px;
              padding: 15px;
              background-color: #e8f5e8;
              border-radius: 6px;
              border-left: 4px solid #28a745;
            }
            .attachments h3 {
              color: #28a745;
              margin: 0 0 10px 0;
              font-size: 16px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e9ecef;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            .signature-section {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
            }
            .signature-box {
              width: 45%;
              text-align: center;
            }
            .signature-line {
              border-top: 1px solid #333;
              margin-top: 50px;
              padding-top: 5px;
            }
            .signature-label {
              font-size: 12px;
              color: #666;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Weekly Accomplishment Report</h1>
              <h2>Week ${reportData.weekNumber} - ${reportData.startDate} to ${reportData.endDate}</h2>
            </div>

            <div class="report-info">
              <div class="info-item">
                <div class="info-label">Student Name</div>
                <div class="info-value">${reportData.studentName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Company</div>
                <div class="info-value">${reportData.companyName}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Report Date</div>
                <div class="info-value">${currentDate}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Tasks Accomplished</div>
              ${reportData.tasks.map(task => `<div class="list-item">${task}</div>`).join('')}
            </div>

            <div class="section">
              <div class="section-title">Learnings and Insights</div>
              ${reportData.learnings.map(learning => `<div class="list-item">${learning}</div>`).join('')}
            </div>

            <div class="section">
              <div class="section-title">Outcomes and Achievements</div>
              ${reportData.outcomes.map(outcome => `<div class="list-item">${outcome}</div>`).join('')}
            </div>

            <div class="section">
              <div class="section-title">Challenges Faced</div>
              ${reportData.challenges.map(challenge => `<div class="list-item">${challenge}</div>`).join('')}
            </div>

            <div class="section">
              <div class="section-title">Plans for Next Week</div>
              ${reportData.nextWeekPlan.map(plan => `<div class="list-item">${plan}</div>`).join('')}
            </div>

            ${reportData.attachments.length > 0 ? `
              <div class="attachments">
                <h3>📎 Attachments</h3>
                ${reportData.attachments.map(attachment => `<div class="list-item">${attachment}</div>`).join('')}
              </div>
            ` : ''}

            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-label">Student Signature</div>
              </div>
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-label">Supervisor Signature</div>
              </div>
            </div>

            <div class="footer">
              <p>Generated on ${currentDate} | InternQuest Mobile Application</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static async generateMultipleReportsPDF(reports: WeeklyReportData[]): Promise<string> {
    const htmlContent = this.generateMultipleReportsHTML(reports);

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

  private static generateMultipleReportsHTML(reports: WeeklyReportData[]): string {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const reportsHTML = reports.map(report => `
      <div class="report-section">
        <div class="report-header">
          <h2>Week ${report.weekNumber} - ${report.startDate} to ${report.endDate}</h2>
        </div>
        
        <div class="report-summary">
          <div class="summary-item">
            <strong>Tasks:</strong> ${report.tasks.length} completed
          </div>
          <div class="summary-item">
            <strong>Learnings:</strong> ${report.learnings.length} insights gained
          </div>
          <div class="summary-item">
            <strong>Outcomes:</strong> ${report.outcomes.length} achievements
          </div>
        </div>

        <div class="report-details">
          <div class="detail-section">
            <h4>Key Tasks:</h4>
            ${report.tasks.slice(0, 3).map(task => `<div class="list-item">${task}</div>`).join('')}
            ${report.tasks.length > 3 ? `<div class="more-items">... and ${report.tasks.length - 3} more tasks</div>` : ''}
          </div>

          <div class="detail-section">
            <h4>Key Learnings:</h4>
            ${report.learnings.slice(0, 2).map(learning => `<div class="list-item">${learning}</div>`).join('')}
            ${report.learnings.length > 2 ? `<div class="more-items">... and ${report.learnings.length - 2} more learnings</div>` : ''}
          </div>
        </div>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Weekly Reports Summary</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f8f9fa;
              color: #333;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background-color: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #007bff;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #007bff;
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .header h2 {
              color: #666;
              margin: 10px 0 0 0;
              font-size: 18px;
              font-weight: normal;
            }
            .report-section {
              margin-bottom: 30px;
              padding: 20px;
              border: 1px solid #e9ecef;
              border-radius: 8px;
              background-color: #f8f9fa;
            }
            .report-header h2 {
              color: #007bff;
              margin: 0 0 15px 0;
              font-size: 20px;
            }
            .report-summary {
              display: flex;
              justify-content: space-between;
              margin-bottom: 15px;
              padding: 10px;
              background-color: white;
              border-radius: 6px;
            }
            .summary-item {
              font-size: 14px;
              color: #666;
            }
            .report-details {
              display: flex;
              gap: 20px;
            }
            .detail-section {
              flex: 1;
            }
            .detail-section h4 {
              color: #333;
              margin: 0 0 10px 0;
              font-size: 16px;
            }
            .list-item {
              margin-bottom: 6px;
              padding-left: 15px;
              position: relative;
              font-size: 14px;
            }
            .list-item:before {
              content: "•";
              color: #007bff;
              font-weight: bold;
              position: absolute;
              left: 0;
            }
            .more-items {
              font-size: 12px;
              color: #666;
              font-style: italic;
              margin-top: 5px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e9ecef;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Weekly Reports Summary</h1>
              <h2>${reports.length} Reports Generated</h2>
            </div>

            ${reportsHTML}

            <div class="footer">
              <p>Generated on ${currentDate} | InternQuest Mobile Application</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export default PDFGenerator; 