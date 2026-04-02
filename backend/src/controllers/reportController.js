const Contribution = require('../models/Contribution') 
const Loan = require('../models/Loan') 
const Membership = require('../models/Membership') 
const Chama = require('../models/Chama') 
const PDFDocument = require('pdfkit') 

const exportCSV = async (req, res) => { 
  try { 
    const { chamaId } = req.params 
    const contributions = await Contribution.find({ chamaId }) 
      .populate('userId', 'fullName phone') 
      .sort({ createdAt: -1 }) 

    const headers = ['Member Name', 'Phone', 'Amount (KES)', 'M-Pesa Ref', 'Period', 'Date', 'Status'] 
    const rows = contributions.map(c => [ 
      c.userId?.fullName || 'Unknown', 
      c.userId?.phone || '', 
      c.amount, 
      c.mpesaRef, 
      c.periodMonth, 
      new Date(c.createdAt).toLocaleDateString(), 
      c.status 
    ]) 

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n') 
    res.setHeader('Content-Type', 'text/csv') 
    res.setHeader('Content-Disposition', `attachment; filename=contributions-${chamaId}.csv`) 
    res.send(csv) 
  } catch (err) { 
    res.status(500).json({ success: false, message: err.message }) 
  } 
} 

const exportPDF = async (req, res) => { 
  try { 
    const { chamaId } = req.params 
    const [chama, contributions, loans, members] = await Promise.all([ 
      Chama.findById(chamaId), 
      Contribution.find({ chamaId, status: 'success' }).populate('userId', 'fullName'), 
      Loan.find({ chamaId }), 
      Membership.find({ chamaId, status: 'active' }).populate('userId', 'fullName') 
    ]) 

    const doc = new PDFDocument({ margin: 50 }) 
    res.setHeader('Content-Type', 'application/pdf') 
    res.setHeader('Content-Disposition', `attachment; filename=report-${chamaId}.pdf`) 
    doc.pipe(res) 

    // Header 
    doc.fontSize(24).font('Helvetica-Bold').text('ChamaChain Financial Report', { align: 'center' }) 
    doc.fontSize(16).font('Helvetica').text(chama?.name || 'Chama Report', { align: 'center' }) 
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' }) 
    doc.moveDown(2) 

    // Summary 
    doc.fontSize(14).font('Helvetica-Bold').text('Financial Summary') 
    doc.moveDown(0.5) 
    const totalContributions = contributions.reduce((s, c) => s + c.amount, 0) 
    const totalLoans = loans.filter(l => ['disbursed', 'repaid'].includes(l.status)).reduce((s, l) => s + l.amount, 0) 
    const activeLoans = loans.filter(l => l.status === 'disbursed').length 
    doc.fontSize(12).font('Helvetica') 
    doc.text(`Total Members: ${members.length}`) 
    doc.text(`Total Contributions: KES ${totalContributions.toLocaleString()}`) 
    doc.text(`Current Balance: KES ${(chama?.totalBalance || 0).toLocaleString()}`) 
    doc.text(`Total Loans Issued: KES ${totalLoans.toLocaleString()}`) 
    doc.text(`Active Loans: ${activeLoans}`) 
    doc.moveDown(2) 

    // Top Contributors 
    doc.fontSize(14).font('Helvetica-Bold').text('Top Contributors') 
    doc.moveDown(0.5) 
    const sorted = [...members].sort((a, b) => (b.totalContributed || 0) - (a.totalContributed || 0)).slice(0, 10) 
    sorted.forEach((m, i) => { 
      doc.fontSize(11).font('Helvetica').text(`${i + 1}. ${m.userId?.fullName} — KES ${(m.totalContributed || 0).toLocaleString()}`) 
    }) 
    doc.moveDown(2) 

    // Loans Summary 
    doc.fontSize(14).font('Helvetica-Bold').text('Loans Summary') 
    doc.moveDown(0.5) 
    loans.slice(0, 20).forEach(loan => { 
      doc.fontSize(11).font('Helvetica').text(`KES ${loan.amount?.toLocaleString()} — ${loan.purpose} — ${loan.status} — ${new Date(loan.createdAt).toLocaleDateString()}`) 
    }) 

    doc.end() 
  } catch (err) { 
    res.status(500).json({ success: false, message: err.message }) 
  } 
} 

module.exports = { exportCSV, exportPDF } 
