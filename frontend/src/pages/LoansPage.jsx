import { useState, useEffect } from 'react' 
 import { motion } from 'framer-motion' 
 import Sidebar from '../components/Sidebar' 
import api from '../services/api' 
import usePageTitle from '../hooks/usePageTitle'

export default function LoansPage() { 
  usePageTitle('My Loans')
  const [allLoans, setAllLoans] = useState([]) 
  const [chamas, setChamas] = useState([]) 
  const [loading, setLoading] = useState(true) 
  const [showRepayModal, setShowRepayModal] = useState(false) 
  const [selectedLoan, setSelectedLoan] = useState(null) 
  const [repayAmount, setRepayAmount] = useState('') 

  useEffect(() => { 
    const fetchAll = async () => { 
      setLoading(true) 
      try { 
        const chamasRes = await api.get('/chamas') 
        const chamaList = chamasRes.data.chamas || [] 
        setChamas(chamaList) 
        const allL = [] 
        for (const item of chamaList) { 
          const chamaId = item.chamaId?._id || item._id 
          const chamaName = item.chamaId?.name || item.name 
          try { 
            const res = await api.get(`/loans/${chamaId}/my`) 
            const loans = (res.data.loans || []).map(l => ({ ...l, chamaName, chamaId })) 
            allL.push(...loans) 
          } catch (e) {} 
        } 
        allL.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) 
        setAllLoans(allL) 
      } catch (err) { 
        console.error(err) 
      } finally { 
        setLoading(false) 
      } 
    } 
    fetchAll() 
  }, []) 

  const handleRepay = async () => { 
    if (!repayAmount || !selectedLoan) return 
    try { 
      await api.post(`/loans/${selectedLoan.chamaId}/loans/${selectedLoan._id}/repay`, { 
        amount: Number(repayAmount), 
        mpesaRef: 'REPAY' + Date.now() 
      }) 
      setShowRepayModal(false) 
      setRepayAmount('') 
      window.location.reload() 
    } catch (err) { 
      alert(err.response?.data?.message || 'Repayment failed') 
    } 
  } 

  const activeLoans = allLoans.filter(l => l.status === 'disbursed') 
  const otherLoans = allLoans.filter(l => l.status !== 'disbursed') 

  return ( 
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0B1E' }}> 
      <div className="mesh-bg" /> 
      <Sidebar /> 
      <main className="main-content" style={{ marginLeft: '240px', flex: 1, padding: '32px', position: 'relative', zIndex: 1, overflowY: 'auto' }}> 
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}> 
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}> 
            <div> 
              <h1 style={{ fontFamily: 'Syne', fontSize: '32px', color: '#F8FAFC', fontWeight: 800, margin: 0 }}>My Loans</h1> 
              <p style={{ color: '#64748B', fontFamily: 'DM Sans', marginTop: '4px', fontSize: '16px' }}>Track your loans and repayments across all chamas.</p> 
            </div> 
            <div style={{ display: 'flex', gap: '16px' }}> 
              <div className="glass-card" style={{ padding: '12px 24px', textAlign: 'right' }}> 
                <span style={{ display: 'block', fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>Total Borrowed</span> 
                <span style={{ fontFamily: 'Syne', fontSize: '20px', color: '#EF4444', fontWeight: 700 }}>KES {allLoans.reduce((s, l) => s + (l.amount || 0), 0).toLocaleString()}</span> 
              </div> 
              <div className="glass-card" style={{ padding: '12px 24px', textAlign: 'right' }}> 
                <span style={{ display: 'block', fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>Total Repaid</span> 
                <span style={{ fontFamily: 'Syne', fontSize: '20px', color: '#10B981', fontWeight: 700 }}>KES {allLoans.reduce((s, l) => s + (l.repayments?.reduce((r, p) => r + p.amount, 0) || 0), 0).toLocaleString()}</span> 
              </div> 
            </div> 
          </header> 

          {/* Active Loans */} 
          {activeLoans.length > 0 && ( 
            <div style={{ marginBottom: '48px' }}> 
              <h2 style={{ fontFamily: 'Syne', fontSize: '20px', color: '#F8FAFC', marginBottom: '20px', fontWeight: 700 }}>Active Loans</h2> 
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}> 
                {activeLoans.map((loan, i) => { 
                  const repaid = loan.repayments?.reduce((s, r) => s + r.amount, 0) || 0 
                  const progress = Math.min((repaid / loan.totalRepayable) * 100, 100) 
                  return ( 
                    <motion.div key={i} className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '28px' }}> 
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}> 
                        <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#0EA5E9', fontWeight: 600, textTransform: 'uppercase' }}>{loan.chamaName}</span> 
                        <span className="badge-info">Active</span> 
                      </div> 
                      <div style={{ marginBottom: '24px' }}> 
                        <span style={{ display: 'block', fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>Loan Amount</span> 
                        <span style={{ fontFamily: 'Syne', fontSize: '28px', color: '#F8FAFC', fontWeight: 700 }}>KES {loan.amount.toLocaleString()}</span> 
                      </div> 
                      <div style={{ marginBottom: '24px' }}> 
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}> 
                          <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B' }}>Repayment Progress</span> 
                          <span style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#F8FAFC' }}>{progress.toFixed(0)}%</span> 
                        </div> 
                        <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255,255,255,0.06)' }}> 
                          <div style={{ height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg, #0EA5E9, #8B5CF6)', width: `${progress}%`, transition: 'width 0.5s ease' }} /> 
                        </div> 
                      </div> 
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> 
                        <div> 
                          <span style={{ display: 'block', fontFamily: 'DM Sans', fontSize: '11px', color: '#64748B' }}>Due Date</span> 
                          <span style={{ fontFamily: 'DM Sans', fontSize: '14px', color: '#F8FAFC' }}>{loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : 'Pending'}</span> 
                        </div> 
                        <button 
                          className="btn-primary" 
                          style={{ padding: '8px 20px', fontSize: '13px' }} 
                          onClick={() => { setSelectedLoan(loan); setShowRepayModal(true); }} 
                        > 
                          Repay Loan 
                        </button> 
                      </div> 
                    </motion.div> 
                  ) 
                })} 
              </div> 
            </div> 
          )} 

          {/* Loan History */} 
          {otherLoans.length > 0 && ( 
            <div> 
              <h2 style={{ fontFamily: 'Syne', fontSize: '20px', color: '#F8FAFC', marginBottom: '20px', fontWeight: 700 }}>Loan History</h2> 
              <div className="glass-card" style={{ overflow: 'hidden' }}> 
                <table style={{ width: '100%', borderCollapse: 'collapse' }}> 
                  <thead> 
                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}> 
                      {['Chama', 'Purpose', 'Amount', 'Date', 'Status'].map(h => ( 
                        <th key={h} style={{ padding: '16px 24px', textAlign: 'left', fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th> 
                      ))} 
                    </tr> 
                  </thead> 
                  <tbody> 
                    {otherLoans.map((loan, i) => ( 
                      <tr key={i} style={{ borderBottom: i < otherLoans.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}> 
                        <td style={{ padding: '16px 24px', fontFamily: 'DM Sans', color: '#F8FAFC', fontWeight: 500 }}>{loan.chamaName}</td> 
                        <td style={{ padding: '16px 24px', fontFamily: 'DM Sans', color: '#94A3B8', fontSize: '14px', textTransform: 'capitalize' }}>{loan.purpose}</td> 
                        <td style={{ padding: '16px 24px', fontFamily: 'Syne', color: '#F8FAFC', fontWeight: 700 }}>KES {loan.amount.toLocaleString()}</td> 
                        <td style={{ padding: '16px 24px', fontFamily: 'DM Sans', color: '#94A3B8', fontSize: '14px' }}>{new Date(loan.createdAt).toLocaleDateString()}</td> 
                        <td style={{ padding: '16px 24px' }}> 
                          <span className={loan.status === 'repaid' ? 'badge-success' : loan.status === 'rejected' ? 'badge-danger' : 'badge-warning'}>{loan.status}</span> 
                        </td> 
                      </tr> 
                    ))} 
                  </tbody> 
                </table> 
              </div> 
            </div> 
          )} 

          {allLoans.length === 0 && !loading && ( 
            <div style={{ textAlign: 'center', padding: '100px 0' }}> 
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>🏛️</div> 
              <h2 style={{ fontFamily: 'Syne', color: '#F8FAFC', fontSize: '24px', fontWeight: 700 }}>No active loans</h2> 
              <p style={{ color: '#64748B', fontFamily: 'DM Sans', marginTop: '8px', maxWidth: '400px', margin: '8px auto 0' }}>You don't have any active loans or history. Request a loan from one of your chamas to get started.</p> 
            </div> 
          )} 
        </div> 
      </main> 

      {/* Repay Modal */} 
      {showRepayModal && selectedLoan && ( 
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}> 
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card" style={{ width: '400px', padding: '36px' }}> 
            <h3 style={{ fontFamily: 'Syne', fontSize: '22px', color: '#F8FAFC', marginBottom: '8px', fontWeight: 700 }}>Repay Loan</h3> 
            <p style={{ color: '#64748B', fontFamily: 'DM Sans', marginBottom: '24px', fontSize: '14px' }}> 
              Loan for <strong>{selectedLoan.chamaName}</strong> · Balance: KES {selectedLoan.amount?.toLocaleString()} 
            </p> 
            <input 
              type="number" 
              placeholder="Amount to repay (KES)" 
              value={repayAmount} 
              onChange={e => setRepayAmount(e.target.value)} 
              style={{ 
                width: '100%', 
                padding: '16px', 
                borderRadius: '12px', 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                color: '#FFF', 
                marginBottom: '24px', 
                outline: 'none', 
                fontFamily: 'DM Sans' 
              }} 
            /> 
            <div style={{ display: 'flex', gap: '12px' }}> 
              <button 
                className="btn-ghost" 
                style={{ flex: 1 }} 
                onClick={() => setShowRepayModal(false)} 
              >Cancel</button> 
              <button 
                className="btn-primary" 
                style={{ flex: 1 }} 
                onClick={handleRepay} 
              >Confirm</button> 
            </div> 
          </motion.div> 
        </div> 
      )} 
    </div> 
  ) 
} 
