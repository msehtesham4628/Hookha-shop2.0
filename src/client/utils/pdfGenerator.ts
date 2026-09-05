import { jsPDF } from 'jspdf';
import { Order } from '../../types/index.js';

/**
 * Builds a vector-sharp, professional luxury commercial invoice PDF
 * for Fumare Hookah orders using jsPDF.
 */
export function buildInvoicePDF(order: Order, extraNote?: string): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = margin;

  // 1. Top Decorative Brand Bar
  doc.setFillColor(120, 53, 15); // Amber 900
  doc.rect(0, 0, pageWidth, 5, 'F');

  y += 5;

  // 2. Company Brand & Invoice Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(28, 25, 23); // Stone 900
  doc.text('FUMARE HOOKAH', margin, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 113, 108); // Stone 500
  doc.text('PREMIER SHISHA ARTISANS & LUXURY SMOKING ARTIFACTS', margin, y + 13);
  doc.text('concierge@fumarehookah.com  |  www.fumarehookah.com', margin, y + 17);

  // Right-aligned Invoice Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(120, 53, 15);
  doc.text('COMMERCIAL INVOICE', pageWidth - margin, y + 8, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(41, 37, 36);
  doc.text(`Invoice #: ${order.orderNumber}`, pageWidth - margin, y + 13, { align: 'right' });
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, pageWidth - margin, y + 17, { align: 'right' });
  doc.text(`Status: ${order.paymentStatus || 'PAID'} • ${order.orderStatus || 'CONFIRMED'}`, pageWidth - margin, y + 21, { align: 'right' });

  y += 28;

  // 3. Thin Accent Rule
  doc.setDrawColor(231, 229, 228);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // 4. Billing & Logistics Information (Two Columns)
  const colWidth = (pageWidth - margin * 2 - 10) / 2;

  // Left: Bill To & Destination
  doc.setFillColor(250, 250, 249);
  doc.roundedRect(margin, y, colWidth, 38, 2, 2, 'F');
  doc.setDrawColor(245, 245, 244);
  doc.roundedRect(margin, y, colWidth, 38, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(120, 53, 15);
  doc.text('BILLED & SHIPPED TO', margin + 4, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(28, 25, 23);
  doc.text(order.customerName || 'Valued Client', margin + 4, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(87, 83, 78);
  doc.text(order.customerEmail, margin + 4, y + 17);
  if (order.shippingAddress) {
    const addr1 = order.shippingAddress.addressLine1 || (order.shippingAddress as any).street || '';
    const addr2 = order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : '';
    doc.text(`${addr1}${addr2}`, margin + 4, y + 22);
    doc.text(`${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} ${order.shippingAddress.postalCode || ''}`, margin + 4, y + 26);
    doc.text(`${order.shippingAddress.country || 'United States'}`, margin + 4, y + 30);
  }

  // Right: Carrier & Order Logistics
  const colRightX = margin + colWidth + 10;
  doc.setFillColor(250, 250, 249);
  doc.roundedRect(colRightX, y, colWidth, 38, 2, 2, 'F');
  doc.setDrawColor(245, 245, 244);
  doc.roundedRect(colRightX, y, colWidth, 38, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(120, 53, 15);
  doc.text('DISPATCH & SETTLEMENT SPECIFICATIONS', colRightX + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(87, 83, 78);
  doc.text(`Internal Reference:`, colRightX + 4, y + 12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(28, 25, 23);
  doc.text(`${order.id}`, colRightX + 36, y + 12);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(87, 83, 78);
  doc.text(`Payment Instrument:`, colRightX + 4, y + 17);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(28, 25, 23);
  doc.text(`${order.paymentMethod || 'Stripe Electronic Settlement'}`, colRightX + 36, y + 17);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(87, 83, 78);
  doc.text(`Carrier Partner:`, colRightX + 4, y + 22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(28, 25, 23);
  doc.text(`${order.carrier || 'Priority Express Courier'}`, colRightX + 36, y + 22);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(87, 83, 78);
  doc.text(`Tracking Reference:`, colRightX + 4, y + 27);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(120, 53, 15);
  doc.text(`${order.trackingNumber || 'Pending Courier Scan'}`, colRightX + 36, y + 27);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(87, 83, 78);
  doc.text(`Age Verification:`, colRightX + 4, y + 32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 101, 52); // Emerald 800
  doc.text(`21+ Adult Signature Verified`, colRightX + 36, y + 32);

  y += 44;

  // 5. Line Items Table Header
  doc.setFillColor(28, 25, 23); // Stone 900
  doc.roundedRect(margin, y, pageWidth - margin * 2, 7, 1, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('DESCRIPTION / PRODUCT NAME', margin + 4, y + 4.8);
  doc.text('SKU', margin + 85, y + 4.8);
  doc.text('QTY', margin + 115, y + 4.8, { align: 'center' });
  doc.text('UNIT PRICE', margin + 145, y + 4.8, { align: 'right' });
  doc.text('TOTAL', pageWidth - margin - 4, y + 4.8, { align: 'right' });

  y += 9;

  // 6. Line Items
  const items = order.items || [];
  items.forEach((item, index) => {
    // Alternate row tinting
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 249);
      doc.rect(margin, y - 2, pageWidth - margin * 2, 8.5, 'F');
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(28, 25, 23);
    
    // Truncate long product names if needed
    const pName = item.productName.length > 42 ? item.productName.substring(0, 40) + '...' : item.productName;
    doc.text(pName, margin + 4, y + 2.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 113, 108);
    doc.text(item.productSku || `SKU-${index + 1}`, margin + 85, y + 2.5);

    doc.setTextColor(28, 25, 23);
    doc.text(`${item.quantity}`, margin + 115, y + 2.5, { align: 'center' });

    const unitPrice = item.price || (item.subtotal ? item.subtotal / item.quantity : (item.totalPrice ? item.totalPrice / item.quantity : 0));
    const lineTotal = item.subtotal || item.totalPrice || (unitPrice * item.quantity);

    doc.text(`$${unitPrice.toFixed(2)}`, margin + 145, y + 2.5, { align: 'right' });

    doc.setFont('helvetica', 'bold');
    doc.text(`$${lineTotal.toFixed(2)}`, pageWidth - margin - 4, y + 2.5, { align: 'right' });

    // Optional Flavor Note
    const itemFlavor = item.flavor || item.selectedFlavor;
    if (itemFlavor) {
      y += 4;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(180, 83, 9);
      doc.text(`Flavor: ${itemFlavor}`, margin + 6, y + 1.5);
    }

    y += 7.5;
  });

  // Table bottom border
  doc.setDrawColor(231, 229, 228);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // 7. Financial Summary Box (Right aligned)
  const summaryWidth = 75;
  const summaryX = pageWidth - margin - summaryWidth;

  doc.setFillColor(250, 250, 249);
  doc.roundedRect(summaryX, y, summaryWidth, 36, 1, 1, 'F');
  doc.setDrawColor(231, 229, 228);
  doc.roundedRect(summaryX, y, summaryWidth, 36, 1, 1, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(87, 83, 78);

  doc.text('Subtotal:', summaryX + 4, y + 6);
  doc.text(`$${(order.subtotal || 0).toFixed(2)}`, pageWidth - margin - 4, y + 6, { align: 'right' });

  if (order.discount && order.discount > 0) {
    doc.setTextColor(22, 101, 52);
    doc.text('Discount Applied:', summaryX + 4, y + 11);
    doc.text(`-$${order.discount.toFixed(2)}`, pageWidth - margin - 4, y + 11, { align: 'right' });
    doc.setTextColor(87, 83, 78);
  }

  doc.text('Sales & Excise Tax:', summaryX + 4, y + 16);
  doc.text(`$${(order.tax || 0).toFixed(2)}`, pageWidth - margin - 4, y + 16, { align: 'right' });

  doc.text('Courier Shipping:', summaryX + 4, y + 21);
  doc.text(order.shippingFee === 0 ? 'Complimentary' : `$${(order.shippingFee || 0).toFixed(2)}`, pageWidth - margin - 4, y + 21, { align: 'right' });

  // Total bar inside box
  doc.setFillColor(120, 53, 15);
  doc.roundedRect(summaryX + 2, y + 26, summaryWidth - 4, 8, 1, 1, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL PAID:', summaryX + 5, y + 31.5);
  doc.text(`$${(order.total || 0).toFixed(2)}`, pageWidth - margin - 5, y + 31.5, { align: 'right' });

  // Left of summary: Adult Regulatory Notice & Seal
  const noticeWidth = summaryX - margin - 8;
  doc.setFillColor(254, 252, 232); // Light yellow
  doc.roundedRect(margin, y, noticeWidth, 36, 1, 1, 'F');
  doc.setDrawColor(254, 240, 138);
  doc.roundedRect(margin, y, noticeWidth, 36, 1, 1, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(161, 98, 7);
  doc.text('MANDATORY 21+ COMPLIANCE ATTESTATION', margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(113, 63, 18);
  const legalText = doc.splitTextToSize(
    'This shipment contains premium hookah tobacco or smoking hardware. Direct adult (21+) physical signature and valid government photo identification is required upon courier delivery pursuant to PACT Act regulations.',
    noticeWidth - 8
  );
  doc.text(legalText, margin + 4, y + 12);

  if (extraNote) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(120, 53, 15);
    doc.text(`Note: ${extraNote}`, margin + 4, y + 30);
  }

  // 8. Footer Bar
  const footerY = pageHeight - 14;
  doc.setDrawColor(231, 229, 228);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(168, 162, 158);
  doc.text(
    'Fumare Hookah Inc. • Beverly Hills Luxury Shisha Dispatch • All artifacts double-boxed with impact-resistant foam casing.',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );
  doc.text(
    `Official Electronic Dispatch Record • Order #${order.orderNumber} • Generated on ${new Date().toISOString()}`,
    pageWidth / 2,
    footerY + 4,
    { align: 'center' }
  );

  return doc;
}

/**
 * Directly downloads the PDF invoice to the user's browser.
 */
export function downloadOrderInvoicePDF(order: Order, extraNote?: string): void {
  const doc = buildInvoicePDF(order, extraNote);
  doc.save(`Invoice-${order.orderNumber}.pdf`);
}

/**
 * Returns the PDF as a raw base64 string suitable for email transmission.
 */
export function getOrderInvoicePDFBase64(order: Order, extraNote?: string): string {
  const doc = buildInvoicePDF(order, extraNote);
  const dataUri = doc.output('datauristring');
  // data:application/pdf;filename=generated.pdf;base64,JVBER...
  return dataUri.includes(',') ? dataUri.split(',')[1] : dataUri;
}

/**
 * Sends a request to the backend API to email the official invoice PDF.
 */
export async function sendInvoicePDFViaEmail(
  orderIdOrNumber: string,
  recipientEmail: string,
  order?: Order,
  customNote?: string
): Promise<{ success: boolean; message: string; recipient?: string }> {
  let pdfBase64: string | undefined = undefined;

  if (order) {
    try {
      pdfBase64 = getOrderInvoicePDFBase64(order, customNote);
    } catch (err) {
      console.warn('Failed to pre-render client-side PDF for email payload, falling back to server template:', err);
    }
  }

  const response = await fetch(`/api/orders/${encodeURIComponent(orderIdOrNumber)}/email-pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: recipientEmail,
      pdfBase64,
      customNote
    })
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error?.message || data.message || 'Failed to dispatch invoice email.');
  }

  return data;
}
