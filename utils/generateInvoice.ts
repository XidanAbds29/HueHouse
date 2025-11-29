import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoice = (order: any) => {
    const doc = new jsPDF();

    // Shop Header
    doc.setFontSize(22);
    doc.setTextColor(79, 70, 229); // Indigo-600
    doc.text('My Shop', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Dhaka, Bangladesh', 14, 26);
    doc.text('Phone: +880 1700 000000', 14, 31);
    doc.text('Email: support@myshop.com', 14, 36);

    // Invoice Details
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('INVOICE', 140, 20);

    doc.setFontSize(10);
    doc.text(`Invoice #: ${order.id.slice(0, 8).toUpperCase()}`, 140, 26);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 140, 31);
    doc.text(`Status: ${order.status.toUpperCase()}`, 140, 36);

    // Bill To
    doc.text('Bill To:', 14, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(order.customer_name, 14, 56);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(order.phone, 14, 61);
    doc.text(doc.splitTextToSize(order.address, 60), 14, 66);

    // Items Table

    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150);
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });

    // Save
    doc.save(`Invoice-${order.id.slice(0, 8)}.pdf`);
};
