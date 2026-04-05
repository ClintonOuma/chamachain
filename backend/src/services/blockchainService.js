
const crypto = require('crypto')
const mongoose = require('mongoose')

// Simple hash chain schema
const hashRecordSchema = new mongoose.Schema({
  recordType: { type: String, required: true }, // 'vote_created', 'vote_cast', 'vote_finalized'
  loanId: { type: String, required: true },
  data: { type: Object, required: true },
  hash: { type: String, required: true },
  previousHash: { type: String, default: '0000000000000000' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true })

const HashRecord = mongoose.models.HashRecord || mongoose.model('HashRecord', hashRecordSchema)

// Generate SHA-256 hash from data
const generateHash = (data, previousHash) => {
  const content = JSON.stringify(data) + previousHash + Date.now().toString()
  return crypto.createHash('sha256').update(content).digest('hex')
}

// Get last hash in chain
const getLastHash = async (loanId) => {
  const last = await HashRecord.findOne({ loanId }).sort({ createdAt: -1 })
  return last ? last.hash : '0000000000000000'
}

// Create vote record on chain
const createLoanVote = async (loanId, threshold = 51) => {
  try {
    const previousHash = await getLastHash(loanId)
    const data = { loanId, threshold, action: 'vote_created', timestamp: new Date() }
    const hash = generateHash(data, previousHash)

    await HashRecord.create({
      recordType: 'vote_created',
      loanId: loanId.toString(),
      data,
      hash,
      previousHash
    })

    console.log(`[chain] Vote created for loan ${loanId}. Hash: ${hash.slice(0, 16)}...`)
    return hash
  } catch (err) {
    console.error('[chain] createLoanVote error:', err.message)
    return null
  }
}

// Cast vote on chain
const castLoanVote = async (loanId, voterId, support) => {
  try {
    const previousHash = await getLastHash(loanId)
    const data = {
      loanId,
      voterId: voterId.toString(),
      support,
      action: 'vote_cast',
      timestamp: new Date()
    }
    const hash = generateHash(data, previousHash)

    await HashRecord.create({
      recordType: 'vote_cast',
      loanId: loanId.toString(),
      data,
      hash,
      previousHash
    })

    console.log(`[chain] Vote cast for loan ${loanId}. Hash: ${hash.slice(0, 16)}...`)
    return hash
  } catch (err) {
    console.error('[chain] castLoanVote error:', err.message)
    return null
  }
}

// Finalize vote on chain
const finalizeLoanVote = async (loanId, approved, yesVotes, noVotes) => {
  try {
    const previousHash = await getLastHash(loanId)
    const data = {
      loanId,
      approved,
      yesVotes,
      noVotes,
      action: 'vote_finalized',
      timestamp: new Date()
    }
    const hash = generateHash(data, previousHash)

    await HashRecord.create({
      recordType: 'vote_finalized',
      loanId: loanId.toString(),
      data,
      hash,
      previousHash
    })

    console.log(`[chain] Vote finalized for loan ${loanId}. Approved: ${approved}. Hash: ${hash.slice(0, 16)}...`)
    return { hash, approved }
  } catch (err) {
    console.error('[chain] finalizeLoanVote error:', err.message)
    return null
  }
}

// Get full chain for a loan (audit trail)
const getLoanVote = async (loanId) => {
  try {
    const records = await HashRecord.find({ loanId: loanId.toString() }).sort({ createdAt: 1 })
    if (records.length === 0) return null

    const voteRecord = records.find(r => r.recordType === 'vote_created')
    const castRecords = records.filter(r => r.recordType === 'vote_cast')
    const finalRecord = records.find(r => r.recordType === 'vote_finalized')

    const yesVotes = castRecords.filter(r => r.data.support).length
    const noVotes = castRecords.filter(r => !r.data.support).length

    return {
      yesVotes,
      noVotes,
      threshold: voteRecord?.data?.threshold || 51,
      finalized: !!finalRecord,
      approved: finalRecord?.data?.approved || false,
      chainHash: records[records.length - 1]?.hash,
      chainLength: records.length,
      auditTrail: records.map(r => ({
        type: r.recordType,
        hash: r.hash,
        previousHash: r.previousHash,
        timestamp: r.timestamp
      }))
    }
  } catch (err) {
    console.error('[chain] getLoanVote error:', err.message)
    return null
  }
}

// Verify chain integrity
const verifyChain = async (loanId) => {
  try {
    const records = await HashRecord.find({ loanId: loanId.toString() }).sort({ createdAt: 1 })
    let isValid = true
    for (let i = 1; i < records.length; i++) {
      if (records[i].previousHash !== records[i - 1].hash) {
        isValid = false
        break
      }
    }
    return isValid
  } catch (err) {
    return false
  }
}

module.exports = { createLoanVote, castLoanVote, finalizeLoanVote, getLoanVote, verifyChain }