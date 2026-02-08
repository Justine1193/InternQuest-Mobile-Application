import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

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
        width: 792, // 11 inches in points (US Letter height - now width for landscape)
        height: 612, // 8.5 inches in points (US Letter width - now height for landscape)
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
        // Many share targets derive the saved filename from the URI.
        // Copy to a stable path with the requested filename first.
        const safeNameRaw = String(filename || 'Weekly_Report.pdf');
        const safeName = safeNameRaw.toLowerCase().endsWith('.pdf') ? safeNameRaw : `${safeNameRaw}.pdf`;
        const baseDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;

        let shareUri = pdfUri;
        if (baseDir) {
          const targetUri = `${baseDir}${safeName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
          try {
            await FileSystem.deleteAsync(targetUri, { idempotent: true });
          } catch (e) {
            // ignore
          }
          try {
            await FileSystem.copyAsync({ from: pdfUri, to: targetUri });
            shareUri = targetUri;
          } catch (e) {
            // If copy fails, fall back to original URI
            shareUri = pdfUri;
          }
        }

        await Sharing.shareAsync(shareUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Weekly Report',
          UTI: 'com.adobe.pdf',
        });
      }
    }
  }

  private static generateHTMLContent(reportData: WeeklyReportData): string {
    const escapeHtml = (unsafe: string) =>
      String(unsafe ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const normalizeTime = (t: string) => String(t ?? '').trim().replace(/\s+/g, ' ');

    // Accepts "7:57 AM", "7:57AM", "12:38 PM", "12:38PM"
    const parseTimeToMinutes = (timeStr: string): number | null => {
      const s = normalizeTime(timeStr).toUpperCase();
      const m = s.match(/^(\d{1,2})\s*:\s*(\d{2})\s*(AM|PM)$/i);
      if (!m) return null;
      let h = Number(m[1]);
      const min = Number(m[2]);
      const ampm = m[3].toUpperCase();
      if (Number.isNaN(h) || Number.isNaN(min)) return null;
      if (h < 1 || h > 12 || min < 0 || min > 59) return null;
      if (ampm === 'AM') {
        if (h === 12) h = 0;
      } else {
        if (h !== 12) h += 12;
      }
      return h * 60 + min;
    };

    const formatHMM = (totalMinutes: number) => {
      const mins = Math.max(0, Math.round(totalMinutes));
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      return `${h}:${String(m).padStart(2, '0')}`;
    };

    const calcDurationMinutes = (timeIn: string, timeOut: string): number | null => {
      const start = parseTimeToMinutes(timeIn);
      const end = parseTimeToMinutes(timeOut);
      if (start == null || end == null) return null;
      let diff = end - start;
      if (diff < 0) diff += 24 * 60; // overnight safeguard
      return diff;
    };

    const currentDate = reportData.submittedDate
      ? reportData.submittedDate
      : new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
    const preparedByName = reportData.preparedByName || reportData.traineeName || '';
    const preparedByTitle = reportData.preparedByTitle || 'Trainee';
    const notedByName = reportData.notedByName || '';
    const notedByTitle = reportData.notedByTitle || 'Job Title of Supervisor';
    const receivedByName = reportData.receivedByName || '';
    const receivedByTitle = reportData.receivedByTitle || 'OJT Adviser';

    let totalMinutes = 0;
    const entryRows = reportData.entries
      .map((entry) => {
        const safeDate = escapeHtml(entry.date || '');
        const safeTimeIn = escapeHtml(normalizeTime(entry.timeIn || ''));
        const safeTimeOut = escapeHtml(normalizeTime(entry.timeOut || ''));
        const safeTask = escapeHtml(entry.taskCompleted || '').replace(/\n/g, '<br/>');
        const safeRemarks = escapeHtml(entry.remarks || '');

        const duration = calcDurationMinutes(entry.timeIn || '', entry.timeOut || '');
        if (duration != null) totalMinutes += duration;

        const hoursCell =
          duration != null
            ? formatHMM(duration)
            : typeof entry.hours === 'number' && Number.isFinite(entry.hours)
              ? formatHMM(entry.hours * 60)
              : '';

        return `
        <tr>
          <td class="center">${safeDate}</td>
          <td class="center">${safeTimeIn}</td>
          <td class="center">${safeTimeOut}</td>
          <td class="center">${escapeHtml(hoursCell)}</td>
          <td class="task">${safeTask}</td>
          <td class="center">${safeRemarks}</td>
        </tr>`;
      })
      .join('');

    const totalHMM = formatHMM(totalMinutes);

    const headerLogos = `
      <div class="header-row">
        <div class="logo-slot">
          ${
            reportData.leftLogoUrl
              ? `<img class="logo-img" src="${reportData.leftLogoUrl}" alt="Left Logo" />`
              : `<div class="logo-placeholder">LOGO</div>`
          }
        </div>
        <div class="header-center">
          <div class="uni-script">New Era University</div>
          <div class="uni-sub">College of Computer Studies</div>
          <div class="uni-sub">Department of Information Technology</div>
        </div>
        <div class="logo-slot">
          ${
            reportData.rightLogoUrl
              ? `<img class="logo-img" src="${reportData.rightLogoUrl}" alt="Right Logo" />`
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
            @page {
              margin: 0.5in;
              size: letter landscape;
            }
            body {
              font-family: Arial, Helvetica, sans-serif;
              margin: 0;
              padding: 0;
              background: #fff;
              color: #000;
            }
            .page {
              width: 100%;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
            }
            .content-wrapper {
              flex: 1;
            }
            .header-row {
              display: flex;
              justify-content: center;
              align-items: flex-start;
              margin-bottom: 6px;
              gap: 20px;
            }
            .logo-slot {
              width: 95px;
              height: 95px;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              flex-shrink: 0;
            }
            .logo-img {
              width: 95px;
              height: 95px;
              object-fit: contain;
            }
            .logo-placeholder {
              font-size: 12px;
              color: #777;
            }
            .header-center {
              text-align: center;
              padding-top: 6px;
              flex-shrink: 0;
            }
            .uni-script {
              font-family: "Brush Script MT", "Segoe Script", cursive;
              font-size: 34px;
              line-height: 1;
              margin: 0;
              font-weight: 500;
            }
            .uni-sub {
              font-size: 14px;
              line-height: 1.2;
              margin: 0;
            }
            .report-title {
              text-align: center;
              font-size: 20px;
              font-weight: 700;
              margin: 10px 0 2px;
              letter-spacing: 0.2px;
            }
            .report-subtitle {
              text-align: center;
              font-size: 16px;
              margin: 0 0 12px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            .meta-table td {
              border: 1px solid #000;
              padding: 7px 8px;
              font-size: 13px;
            }
            .meta-label {
              font-weight: 700;
              width: 18%;
            }
            .meta-value {
              text-align: center;
            }
            .entries-table {
              margin-top: 14px;
              font-size: 12px;
            }
            .entries-table th,
            .entries-table td {
              border: 1px solid #000;
              padding: 7px 6px;
              vertical-align: top;
            }
            .entries-table th {
              text-align: center;
              font-weight: 700;
            }
            .center {
              text-align: center;
              vertical-align: middle;
              white-space: nowrap;
            }
            .task {
              text-align: center;
              font-size: 11.5px;
            }
            .total-row td {
              font-weight: 700;
            }
            .total-label {
              text-align: center;
            }
            .signatures {
              margin-top: auto;
              margin-bottom: 20px;
              display: grid;
              grid-template-columns: 1fr 1fr 1.4fr 1fr;
              column-gap: 18px;
              align-items: end;
            }
            .sig-col {
              width: 100%;
            }
            .sig-label {
              font-size: 13px;
              font-weight: 700;
              text-align: left;
              margin-bottom: 22px;
            }
            .sig-name {
              border-bottom: 1px solid #000;
              text-align: center;
              font-size: 12px;
              padding-bottom: 2px;
              min-height: 16px;
            }
            .sig-title {
              text-align: center;
              font-size: 12px;
              margin-top: 4px;
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="content-wrapper">
              ${headerLogos}

              <div class="report-title">WEEKLY ACCOMPLISHMENT REPORT</div>
              <div class="report-subtitle">On the Job Training</div>

              <table class="meta-table">
                <tr>
                  <td class="meta-label">Trainee:</td>
                  <td class="meta-value">${escapeHtml(reportData.traineeName || '')}</td>
                  <td class="meta-label">Department Assigned:</td>
                  <td class="meta-value">${escapeHtml(reportData.departmentAssigned || '')}</td>
                </tr>
                <tr>
                  <td class="meta-label">Company:</td>
                  <td class="meta-value">${escapeHtml(reportData.companyName || '')}</td>
                  <td class="meta-label">Month Covered:</td>
                  <td class="meta-value">${escapeHtml(reportData.monthCovered || '')}</td>
                </tr>
              </table>

              <table class="entries-table">
                <colgroup>
                  <col style="width: 12%;" />
                  <col style="width: 11%;" />
                  <col style="width: 11%;" />
                  <col style="width: 8%;" />
                  <col style="width: 46%;" />
                  <col style="width: 12%;" />
                </colgroup>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time IN</th>
                    <th>Time OUT</th>
                    <th>Number<br/>of Hours</th>
                    <th>TASK COMPLETED</th>
                    <th>REMARKS</th>
                  </tr>
                </thead>
                <tbody>
                  ${entryRows}
                  <tr class="total-row">
                    <td colspan="3" class="total-label">Total Number of Hours</td>
                    <td class="center">${escapeHtml(totalHMM)}</td>
                    <td></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="signatures">
              <div class="sig-col">
                <div class="sig-label">Prepared by:</div>
                <div class="sig-name">${escapeHtml(preparedByName)}</div>
                <div class="sig-title">${escapeHtml(preparedByTitle)}</div>
              </div>
              <div class="sig-col">
                <div class="sig-label">Noted by:</div>
                <div class="sig-name">${escapeHtml(notedByName)}</div>
                <div class="sig-title">${escapeHtml(notedByTitle)}</div>
              </div>
              <div class="sig-col">
                <div class="sig-label">Date Submitted:</div>
                <div class="sig-name">${escapeHtml(currentDate)}</div>
                <div class="sig-title">&nbsp;</div>
              </div>
              <div class="sig-col">
                <div class="sig-label">Received by:</div>
                <div class="sig-name">${escapeHtml(receivedByName)}</div>
                <div class="sig-title">${escapeHtml(receivedByTitle)}</div>
              </div>
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