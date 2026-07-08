/**
 * Tạo file Word hướng dẫn demo cho giảng viên
 * Chạy: node docs/generate-demo-docx.js
 */
const fs = require('fs');
const path = require('path');

let docx;
try {
  docx = require('docx');
} catch {
  console.error('Cần cài docx: npm install docx (trong thư mục docs hoặc global)');
  process.exit(1);
}

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  PageNumber, Header, Footer, LevelFormat, PageBreak,
} = docx;

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };
const TABLE_W = 9360;

function cell(text, opts = {}) {
  const { bold, width = 3120, fill = 'FFFFFF' } = opts;
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      children: [new TextRun({ text, bold: !!bold, size: 22, font: 'Arial' })],
    })],
  });
}

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ heading: level, children: [new TextRun(text)] });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, size: 22, font: 'Arial', ...opts })],
  });
}

function bullet(ref, text) {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 22, font: 'Arial' })],
  });
}

function table(headers, rows) {
  const colW = Math.floor(TABLE_W / headers.length);
  return new Table({
    width: { size: TABLE_W, type: WidthType.DXA },
    columnWidths: headers.map(() => colW),
    rows: [
      new TableRow({
        children: headers.map(h => cell(h, { bold: true, fill: 'D5E8F0', width: colW })),
      }),
      ...rows.map(row => new TableRow({
        children: row.map(c => cell(c, { width: colW })),
      })),
    ],
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 32, bold: true, font: 'Arial' },
        paragraph: { spacing: { before: 240, after: 240 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: 'Arial' },
        paragraph: { spacing: { before: 180, after: 180 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: 'Arial' },
        paragraph: { spacing: { before: 120, after: 120 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: 'bullets',
        levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: 'numbers',
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [new TextRun({ text: 'BusTicket Pro — Hướng dẫn Demo DBMS', italics: true, size: 20, color: '004AC6' })],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: 'Trang ', size: 20 }),
            new TextRun({ children: [PageNumber.CURRENT], size: 20 }),
          ],
        })],
      }),
    },
    children: [
      heading('HƯỚNG DẪN DEMO ĐỀ TÀI DBMS'),
      para('Nghiên cứu Concurrency Control & Deadlock — Hệ thống Đặt Vé Xe Khách', { bold: true }),
      para('Database: BusBookingDB | Thời lượng demo: 20–25 phút'),

      heading('1. Giới thiệu đề tài', HeadingLevel.HEADING_2),
      para('Tên đề tài: Nghiên cứu các giải thuật kiểm soát đồng thời (Concurrency Control) và kịch bản xử lý bế tắc (Deadlock) trong bài toán đặt chỗ thời gian thực — Thực nghiệm mô phỏng trên Hệ thống đặt vé xe khách trực tuyến.'),
      bullet('bullets', 'Website là công cụ mô phỏng — KHÔNG phải thương mại điện tử'),
      bullet('bullets', 'Transaction xử lý trong Stored Procedure trên SQL Server'),
      bullet('bullets', 'So sánh 3 chế độ: KHONG_KHOA, BI_QUAN (Pessimistic), LE_QUAN (Optimistic)'),

      heading('2. Kiến trúc', HeadingLevel.HEADING_2),
      para('React (localhost:5173) → Express API (localhost:3001) → SQL Server (BusBookingDB) → Stored Procedure + Transaction'),

      heading('3. Chuẩn bị', HeadingLevel.HEADING_2),
      heading('Khởi động', HeadingLevel.HEADING_3),
      bullet('numbers', 'Kiểm tra SQL Server + database BusBookingDB'),
      bullet('numbers', 'Backend: cd backend && npm run dev'),
      bullet('numbers', 'Frontend: cd frontend && npm run dev'),
      bullet('numbers', 'Mở SSMS với file database/05_deadlock_demo.sql'),
      bullet('numbers', 'Reset log tại trang /simulation'),

      table(['Thông tin', 'Giá trị'], [
        ['Chuyến demo', 'Mã 1 (HCM - Đà Lạt)'],
        ['Ghế Deadlock', 'A1, A2'],
        ['Ghế Concurrency', 'A1 (ma_ghe = 1)'],
      ]),

      new Paragraph({ children: [new PageBreak()] }),

      heading('4. Kịch bản trình bày', HeadingLevel.HEADING_2),
      table(['Thời gian', 'Nội dung', 'Trang'], [
        ['0–2 phút', 'Giới thiệu đề tài', '/'],
        ['2–5 phút', 'Đặt vé, Admin CRUD', '/trips, /admin'],
        ['5–13 phút', 'Concurrency Control (3 chế độ)', '/simulation'],
        ['13–18 phút', 'Deadlock Error 1205', 'SSMS + /deadlock'],
        ['18–25 phút', 'Dashboard, Hỏi đáp', '/simulation'],
      ]),

      heading('5. Demo Concurrency Control', HeadingLevel.HEADING_2),
      para('Mở 3 tab trình duyệt: http://localhost:5173/simulation'),

      heading('Chế độ KHONG_KHOA — Lost Update', HeadingLevel.HEADING_3),
      bullet('numbers', 'Chọn KHONG_KHOA, ghế A1, chuyến 1'),
      bullet('numbers', 'Tab 1: Transaction A — Tab 2: Transaction B (trong 3 giây)'),
      bullet('numbers', 'Giải thích: không lock → race condition'),

      heading('Chế độ BI_QUAN — Pessimistic', HeadingLevel.HEADING_3),
      bullet('numbers', 'SP dùng WITH (UPDLOCK, HOLDLOCK, ROWLOCK)'),
      bullet('numbers', 'Transaction B phải CHỜ transaction A'),
      bullet('numbers', 'Kết quả: 1 COMMIT, 1 ROLLBACK'),

      heading('Chế độ LE_QUAN — Optimistic', HeadingLevel.HEADING_3),
      bullet('numbers', 'Kiểm tra cột rowversion trên bảng GHE'),
      bullet('numbers', 'Conflict → ROLLBACK transaction đến sau'),

      table(['Chế độ', 'Cơ chế', 'Kết quả'], [
        ['KHONG_KHOA', 'Không lock', 'Lost Update'],
        ['BI_QUAN', 'UPDLOCK, HOLDLOCK', 'Chờ / Block'],
        ['LE_QUAN', 'rowversion', 'Rollback nếu conflict'],
      ]),

      new Paragraph({ children: [new PageBreak()] }),

      heading('6. Demo Deadlock', HeadingLevel.HEADING_2),
      para('Kịch bản: Tx A khóa A1 đợi A2 — Tx B khóa A2 đợi A1'),
      bullet('bullets', 'Mở 2 cửa sổ Query trong SSMS'),
      bullet('bullets', 'Chạy SCRIPT A và SCRIPT B trong 05_deadlock_demo.sql'),
      bullet('bullets', 'Quan sát Error 1205 trên 1 cửa sổ'),
      bullet('bullets', 'Giải thích Wait-For Graph và Deadlock Victim'),

      heading('7. Câu hỏi thường gặp', HeadingLevel.HEADING_2),
      para('Q: Transaction xử lý ở đâu?', { bold: true }),
      para('A: Trong Stored Procedure (sp_DatVe) với BEGIN/COMMIT/ROLLBACK/TRY-CATCH.'),
      para('Q: Deadlock và Block khác nhau?', { bold: true }),
      para('A: Block là chờ lock; Deadlock là chu trình chờ lẫn nhau — SQL Server chọn victim.'),
      para('Q: Error 1205?', { bold: true }),
      para('A: Transaction bị chọn làm deadlock victim và đã rollback.'),

      heading('8. Checklist trước demo', HeadingLevel.HEADING_2),
      bullet('bullets', 'SQL Server + BusBookingDB OK'),
      bullet('bullets', 'Backend port 3001, Frontend port 5173'),
      bullet('bullets', 'SSMS mở sẵn deadlock script'),
      bullet('bullets', 'Reset log, ghế A1 trống'),
      bullet('bullets', '3 tab /simulation sẵn sàng'),

      para(''),
      para('Tài liệu dự án BusTicket Pro — Đề tài DBMS, 2026.', { italics: true, size: 20 }),
    ],
  }],
});

const outPath = path.join(__dirname, 'HUONG_DAN_DEMO_GIANG_VIEN.docx');
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outPath, buffer);
  console.log('Đã tạo:', outPath);
});