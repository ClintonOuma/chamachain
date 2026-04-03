import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import api from '../services/api'
import usePageTitle from '../hooks/usePageTitle'

export default function ContributionsPage() {
  usePageTitle('My Contributions')
  const [allContributions, setAllContributions] = useState([])
  const [chamas, setChamas] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedChama, setSelectedChama] = useState('all')
  const [totalThisMonth, setTotalThisMonth] = useState(0)
  const [totalAllTime, setTotalAllTime] = useState(0)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const chamasRes = await api.get('/chamas')
        const chamaList = chamasRes.data.chamas || []
        setChamas(chamaList)
        const allContribs = []
        for (const item of chamaList) {
          const chamaId = item.chamaId?._id || item._id
          try {
            const res = await api.get(`/contributions/${chamaId}/my`)
            const contribs = (res.data.contributions || []).map(c => ({
              ...c,
              chamaName: item.chamaId?.name || item.name
            }))
            allContribs.push(...contribs)
          } catch (e) {}
        }
        allContribs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setAllContributions(allContribs)
        const now = new Date()
        const thisMonth = allContribs.filter(c => {
          const d = new Date(c.createdAt)
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        })
        setTotalThisMonth(thisMonth.reduce((s, c) => s + c.amount, 0))
        setTotalAllTime(allContribs.reduce((s, c) => s + c.amount, 0))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const filtered = selectedChama === 'all'
    ? allContributions
    : allContributions.filter(c => c.chamaId === selectedChama || c.chamaId?._id === selectedChama)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0B1E' }}>
      <div className="mesh-bg" />
      <Sidebar />
      <main className="main-content" style={{ marginLeft: '240px', flex: 1, padding: '32px', position: 'relative', zIndex: 1, overflowY: 'auto', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
            <div>
              <h1 style={{ fontFamily: 'Syne', fontSize: '32px', color: '#F8FAFC', fontWeight: 800, margin: 0 }}>My Contributions</h1>
              <p style={{ fontFamily: 'DM Sans', color: '#64748B', fontSize: '16px', marginTop: '8px' }}>Track all your payments across your chamas.</p>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="glass-card" style={{ padding: '12px 24px', textAlign: 'right' }}>
                <span style={{ display: 'block', fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>This Month</span>
                <span style={{ fontFamily: 'Syne', fontSize: '20px', color: '#10B981', fontWeight: 700 }}>KES {totalThisMonth.toLocaleString()}</span>
              </div>
              <div className="glass-card" style={{ padding: '12px 24px', textAlign: 'right' }}>
                <span style={{ display: 'block', fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>All Time</span>
                <span style={{ fontFamily: 'Syne', fontSize: '20px', color: '#0EA5E9', fontWeight: 700 }}>KES {totalAllTime.toLocaleString()}</span>
              </div>
            </div>
          </header>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontFamily: 'DM Sans', fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>Filter by Chama</label>
            <select
              value={selectedChama}
              onChange={(e) => setSelectedChama(e.target.value)}
              style={{ padding: '12px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', fontFamily: 'DM Sans' }}
            >
              <option value="all">All Chamas</option>
              {chamas.map(c => (
                <option key={c.chamaId?._id || c._id} value={c.chamaId?._id || c._id}>{c.chamaId?.name || c.name}</option>
              ))}
            </select>
          </div>

          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Chama', 'Amount', 'Date', 'Status', 'Reference'].map(h => (
                    <th key={h} style={{ padding: '16px 24px', textAlign: 'left', fontFamily: 'DM Sans', fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>Loading contributions...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: '60px', textAlign: 'center', color: '#64748B', fontFamily: 'DM Sans' }}>No contributions found for this selection.</td></tr>
                ) : (
                  filtered.map((c, i) => (
                    <tr key={i} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                      <td style={{ padding: '16px 24px', fontFamily: 'DM Sans', color: '#F8FAFC', fontWeight: 500 }}>{c.chamaName}</td>
                      <td style={{ padding: '16px 24px', fontFamily: 'Syne', color: '#10B981', fontWeight: 700 }}>KES {c.amount.toLocaleString()}</td>
                      <td style={{ padding: '16px 24px', fontFamily: 'DM Sans', color: '#94A3B8', fontSize: '14px' }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span className="badge-success">{c.status}</span>
                      </td>
                      <td style={{ padding: '16px 24px', fontFamily: 'JetBrains Mono', color: '#475569', fontSize: '12px' }}>{c.mpesaRef}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  ) 
}
