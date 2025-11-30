import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoice = (order: any) => {
    const doc = new jsPDF();

    // HueHouse Brand Color: #8B4513 (RGB: 139, 69, 19)
    const brandColor = [139, 69, 19] as [number, number, number];

    // Shop Header
    doc.setFont('times', 'bold'); // Serif font for HueHouse
    doc.setFontSize(28);
    doc.setTextColor(...brandColor);
    doc.text('HueHouse', 14, 22);

    doc.setFont('helvetica', 'normal'); // Clean font for details
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Dhaka, Bangladesh', 14, 28);
    doc.text('Phone: +880 1700 000000', 14, 33);
    doc.text('Email: hello@huehouse.com', 14, 38);

    // Invoice Details
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.setFont('times', 'bold');
    doc.text('INVOICE', 140, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Invoice #: ${order.id.slice(0, 8).toUpperCase()}`, 140, 28);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 140, 33);
    doc.text(`Status: ${order.status.toUpperCase()}`, 140, 38);

    // Bill To
    doc.setDrawColor(200);
    doc.line(14, 45, 196, 45); // Divider line

    doc.text('Bill To:', 14, 55);
    doc.setFontSize(11);
    doc.setFont('times', 'bold');
    doc.setTextColor(0);
    doc.text(order.customer_name, 14, 61);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80);
    doc.text(order.phone, 14, 66);
    doc.text(doc.splitTextToSize(order.address, 60), 14, 71);

    // Items Table
    const tableColumn = ["Item", "Quantity", "Price"];
    const tableRows: any[] = [];

    order.items_json.forEach((item: any) => {
        const itemData = [
            item.name,
            item.quantity || 1,
            `Tk ${item.price}`,
        ];
        tableRows.push(itemData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 85,
        theme: 'plain',
        headStyles: {
            fillColor: brandColor,
            textColor: 255,
            font: 'times',
            fontStyle: 'bold',
            halign: 'left'
        },
        styles: {
            font: 'helvetica',
            fontSize: 10,
            cellPadding: 4,
        },
        columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 30, halign: 'center' },
            2: { cellWidth: 40, halign: 'right' },
        },
    });

    // Total
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...brandColor);
    doc.text(`Total: Tk ${order.total_amount}`, 196, finalY, { align: 'right' });

    // Footer
    doc.setFontSize(9);
    doc.setFont('times', 'italic');
    doc.setTextColor(150);
    doc.text('Thank you for choosing HueHouse. Art for your soul.', 105, 280, { align: 'center' });

    // Save
    doc.save(`HueHouse-Invoice-${order.id.slice(0, 8)}.pdf`);
};
