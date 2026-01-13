import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export interface OJTChecklistData {
  studentName: string;
  studentId?: string;
  program?: string;
  section?: string;
  studentEmail?: string;
  contactNumber?: string;
  adviserName: string;
  adviserSignatureUrl?: string;

  companyName?: string;
  companyContactPerson?: string;
  companyJobTitle?: string;
  companyEmail?: string;
  companyAddress?: string;

  // Optional extra fields (kept for compatibility / future)
  startDate?: string;
  endDate?: string;
  completedDate?: string;

  requirements: Array<{
    title: string;
    status: 'approved' | 'rejected' | 'pending';
    dateCompleted?: string;
    remarks?: string;
  }>;

  // Optional logos (if you later upload official logos to Storage and pass URLs)
  leftLogoUrl?: string;
  rightLogoUrl?: string;
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
    const safe = (v: any) => (v === null || v === undefined ? '' : String(v));

    const leftLogo = data.leftLogoUrl
      ? `<img src="${data.leftLogoUrl}" style="width: 100%; height: 100%; object-fit: contain;" />`
      : `<div style="font-size: 10px; color: #666;">LOGO</div>`;

    const rightLogo = data.rightLogoUrl
      ? `<img src="${data.rightLogoUrl}" style="width: 100%; height: 100%; object-fit: contain;" />`
      : `<div style="font-size: 10px; color: #666;">LOGO</div>`;

    const adviserSignatureImg = data.adviserSignatureUrl
      ? `<img src="${data.adviserSignatureUrl}" alt="Adviser Signature" style="max-width: 90px; max-height: 34px; display: block; margin: 0 auto;" />`
      : '';

    const statusText = (s: 'approved' | 'rejected' | 'pending') => {
      if (s === 'approved') return 'APPROVED';
      if (s === 'rejected') return 'REJECTED';
      return '';
    };

    const buildRows = (rows: Array<{ title: string; status?: 'approved' | 'rejected' | 'pending'; dateCompleted?: string; remarks?: string }>) =>
      rows
        .map(
          (r) => {
            const hasSigned = r.status === 'approved' && Boolean(adviserSignatureImg);
            return `
              <tr>
                <td class="cell req">${safe(r.title)}</td>
                <td class="cell date">${safe(r.dateCompleted)}</td>
                <td class="cell remarks">${safe(r.remarks || (r.status ? statusText(r.status) : ''))}</td>
                <td class="cell sig">${hasSigned ? adviserSignatureImg : ''}</td>
              </tr>
            `;
          }
        )
        .join('');

    // Map the app-tracked requirements into Section A rows.
    const sectionARows = data.requirements.map((r) => ({
      title: r.title,
      status: r.status,
      dateCompleted: r.dateCompleted,
      remarks: r.remarks,
    }));

    // The screenshot shows additional sections that may not be tracked in-app.
    // We include them as blank rows so the PDF matches the form layout.
    const sectionBRows = [
      { title: 'Internship Contract' },
      { title: 'Site Visit (by the OJT Adviser)' },
    ];

    const sectionCRows = [
      { title: 'A. HTE Evaluation of the Student' },
      { title: 'B. Student Performance Evaluation of the HTE' },
      { title: 'C. Student Outcomes Evaluation of the HTE' },
      { title: 'D. SIP Evaluation of the Student' },
      { title: 'E. Certificate of Completion' },
      { title: 'F. Internship Journal' },
      { title: 'G. LINKDIN Account and Link' },
    ];

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Student Internship Program - Internship Checklist</title>
          <style>
            @page { size: A4; margin: 16mm; }
            * { box-sizing: border-box; }
            body {
              font-family: 'Times New Roman', Times, serif;
              margin: 0;
              padding: 0;
              color: #000;
              background: #fff;
            }
            .page { width: 100%; }
            .pageBreak { page-break-after: always; }

            .topHeader {
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 10px;
              margin-bottom: 6px;
            }
            .logoCircle {
              width: 54px;
              height: 54px;
              border-radius: 999px;
              border: 1px solid #000;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
              flex: 0 0 auto;
            }
            .headerText {
              flex: 1;
              text-align: center;
              line-height: 1.1;
            }
            .headerText .u { font-size: 18px; font-style: italic; font-weight: 600; }
            .headerText .c { font-size: 11px; font-weight: 700; }
            .headerText .a { font-size: 10px; }
            .headerText .t { margin-top: 6px; font-size: 12px; font-weight: 700; }
            .headerText .tt { font-size: 12px; font-weight: 700; }

            .formTitle {
              margin-top: 6px;
              text-align: center;
              font-weight: 700;
              font-size: 12px;
            }

            table.form {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
              margin-top: 10px;
            }
            table.form td, table.form th {
              border: 1px solid #000;
              padding: 4px 6px;
              vertical-align: middle;
            }
            .label { width: 26%; }
            .value { width: 74%; }

            .sectionTitle {
              margin: 12px 0 6px;
              text-align: center;
              font-size: 11px;
              font-style: italic;
              font-weight: 700;
            }

            table.checklist {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
              margin-top: 6px;
            }
            table.checklist th, table.checklist td {
              border: 1px solid #000;
              padding: 6px 6px;
              vertical-align: top;
            }
            table.checklist th {
              background: #000;
              color: #fff;
              text-align: center;
              font-weight: 700;
              padding: 5px 4px;
            }
            .cell.req { width: 40%; }
            .cell.date { width: 18%; text-align: center; }
            .cell.remarks { width: 22%; }
            .cell.sig { width: 20%; text-align: center; }
            .subSection {
              margin-top: 10px;
              font-weight: 700;
              font-size: 11px;
              text-align: center;
            }

            .blackBar {
              background: #000;
              color: #fff;
              text-align: center;
              font-weight: 700;
              font-size: 11px;
              padding: 6px 8px;
              margin-top: 12px;
            }

            .notesBox {
              width: 100%;
              height: 160px;
              border: 1px solid #000;
              margin-top: 0;
            }
          </style>
        </head>
        <body>
          <!-- PAGE 1 -->
          <div class="page pageBreak">
            <div class="topHeader">
              <div class="logoCircle">${leftLogo}</div>
              <div class="headerText">
                <div class="u">New Era University</div>
                <div class="c">COLLEGE OF INFORMATICS AND COMPUTING STUDIES</div>
                <div class="a">No. 9 Central Avenue, New Era University</div>
                <div class="a">(02) 8981 4221 local 3285 • computstudies@neu.edu.ph</div>
              </div>
              <div class="logoCircle">${rightLogo}</div>
            </div>

            <div class="formTitle">STUDENT INTERNSHIP PROGRAM</div>
            <div class="formTitle">INTERNSHIP CHECKLIST</div>

            <table class="form">
              <tr>
                <td class="label"><b>Program:</b></td>
                <td class="value">${safe(data.program)}</td>
                <td class="label"><b>Section:</b></td>
                <td class="value">${safe(data.section)}</td>
              </tr>
              <tr>
                <td class="label"><b>Student Name (LN, FN, MI):</b></td>
                <td class="value" colspan="3">${safe(data.studentName)}</td>
              </tr>
              <tr>
                <td class="label"><b>E-mail Address:</b></td>
                <td class="value" colspan="3">${safe(data.studentEmail)}</td>
              </tr>
              <tr>
                <td class="label"><b>Contact Number:</b></td>
                <td class="value" colspan="3">${safe(data.contactNumber)}</td>
              </tr>
              <tr>
                <td class="label"><b>Adviser:</b></td>
                <td class="value" colspan="3">${safe(data.adviserName)}</td>
              </tr>
            </table>

            <table class="form" style="margin-top: 10px;">
              <tr>
                <td class="label"><b>Company Name:</b></td>
                <td class="value" colspan="3">${safe(data.companyName)}</td>
              </tr>
              <tr>
                <td class="label"><b>Contact Person:</b></td>
                <td class="value" colspan="3">${safe(data.companyContactPerson)}</td>
              </tr>
              <tr>
                <td class="label"><b>Job Title:</b></td>
                <td class="value" colspan="3">${safe(data.companyJobTitle)}</td>
              </tr>
              <tr>
                <td class="label"><b>E-mail Address:</b></td>
                <td class="value" colspan="3">${safe(data.companyEmail)}</td>
              </tr>
              <tr>
                <td class="label"><b>Company Address:</b></td>
                <td class="value" colspan="3">${safe(data.companyAddress)}</td>
              </tr>
            </table>

            <div class="sectionTitle">A. Pre-deployment Requirements</div>
            <table class="checklist">
              <thead>
                <tr>
                  <th>Requirement/s:</th>
                  <th>Date Completed/Submitted:</th>
                  <th>Remarks:</th>
                  <th>Adviser's Signature:</th>
                </tr>
              </thead>
              <tbody>
                ${buildRows(sectionARows)}
              </tbody>
            </table>

            <div class="blackBar">OJT Endorsement Letter<br><span style="font-weight: 400; font-size: 10px;">(To be filled-up by the Receiving Staff at the Dean's Office)</span></div>
            <table class="checklist" style="margin-top: 0;">
              <thead>
                <tr>
                  <th>Issued by:</th>
                  <th>Remarks:</th>
                  <th>Date Received:</th>
                  <th>Received by:</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="cell" style="height: 34px;"></td>
                  <td class="cell"></td>
                  <td class="cell"></td>
                  <td class="cell"></td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- PAGE 2 -->
          <div class="page">
            <div class="sectionTitle">B. Training Requirements</div>
            <table class="checklist">
              <thead>
                <tr>
                  <th>Requirement/s:</th>
                  <th>Date Completed/Submitted:</th>
                  <th>Remarks:</th>
                  <th>Adviser's Signature:</th>
                </tr>
              </thead>
              <tbody>
                ${buildRows(sectionBRows)}
              </tbody>
            </table>

            <div class="sectionTitle">C. Post/ Final Requirements</div>
            <table class="checklist">
              <thead>
                <tr>
                  <th>Requirement/s:</th>
                  <th>Date Completed/Submitted:</th>
                  <th>Remarks:</th>
                  <th>Adviser's Signature:</th>
                </tr>
              </thead>
              <tbody>
                ${buildRows(sectionCRows)}
              </tbody>
            </table>

            <div class="blackBar">COMPILATION OF WEEKLY ACCOMPLISHMENT REPORT<br><span style="font-weight: 400; font-size: 10px;">(To be filled-up by the OJT Adviser)</span></div>
            <table class="checklist" style="margin-top: 0;">
              <thead>
                <tr>
                  <th>Date of Deployment:</th>
                  <th>Date of Completion:</th>
                  <th>Duration:</th>
                  <th>Signature:</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="height: 30px;"></td>
                  <td></td>
                  <td></td>
                  <td>${adviserSignatureImg}</td>
                </tr>
              </tbody>
            </table>

            <div class="blackBar">OTHER REMARKS/ COMMENTS:</div>
            <div class="notesBox"></div>

            <div class="blackBar">FINAL SUBMISSION<br><span style="font-weight: 400; font-size: 10px;">(To be filled-up by the OJT Adviser)</span></div>
            <table class="checklist" style="margin-top: 0;">
              <thead>
                <tr>
                  <th>Submitted by:</th>
                  <th>Date of Submission:</th>
                  <th>Remarks:</th>
                  <th>Signature:</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="height: 30px;"></td>
                  <td></td>
                  <td></td>
                  <td>${adviserSignatureImg}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;
  }
}

export default OJTChecklistGenerator;
