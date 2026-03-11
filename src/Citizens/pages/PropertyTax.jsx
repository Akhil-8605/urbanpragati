import { useState, useEffect, useCallback } from 'react';
import './PropertyTax.css';
import CitizenNavbar from '../components/CitizenNavbar';
import CitizenFooter from '../components/CitizenFooter';
import { getPropertyTaxRecords, recordPropertyTaxPayment } from '../../firebaseOperations/db';

// ─── Dummy Razorpay modal ──────────────────────────────────────────────────────
function RazorpayModal({ record, onClose, onSuccess }) {
  const [step, setStep] = useState('confirm'); // confirm | processing | success
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [error, setError] = useState('');

  const handlePay = () => {
    setError('');
    if (method === 'upi' && !upiId.trim()) { setError('Please enter your UPI ID.'); return; }
    if (method === 'card' && cardNum.replace(/\s/g, '').length < 16) { setError('Please enter a valid 16-digit card number.'); return; }
    setStep('processing');
    setTimeout(() => setStep('success'), 2200);
  };

  const handleDone = () => {
    const txnId = 'TXN' + Date.now().toString().slice(-8).toUpperCase();
    onSuccess({
      transactionId: txnId,
      amount: record.totalDue,
      method,
      financialYear: record.financialYear,
    });
  };

  return (
    <div className="rzp-overlay" role="dialog" aria-modal="true" aria-label="Razorpay payment">
      <div className="rzp-modal">
        <div className="rzp-header">
          <div className="rzp-brand">
            <div className="rzp-brand-dot" aria-hidden="true" />
            <span>Razorpay</span>
          </div>
          {step !== 'processing' && (
            <button className="rzp-close" onClick={onClose} aria-label="Close payment modal">
              <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
          )}
        </div>

        <div className="rzp-body">
          {step === 'confirm' && (
            <>
              <div className="rzp-amount-block">
                <p className="rzp-label">Property Tax Payment</p>
                <p className="rzp-owner">{record.ownerName}</p>
                <p className="rzp-pid">{record.propertyId}</p>
                <p className="rzp-due">Amount Due: <strong>₹{record.totalDue?.toLocaleString()}</strong></p>
              </div>

              <div className="rzp-method-tabs">
                <button className={`rzp-tab${method === 'upi' ? ' active' : ''}`} onClick={() => setMethod('upi')}>UPI</button>
                <button className={`rzp-tab${method === 'card' ? ' active' : ''}`} onClick={() => setMethod('card')}>Card</button>
                <button className={`rzp-tab${method === 'netbanking' ? ' active' : ''}`} onClick={() => setMethod('netbanking')}>Net Banking</button>
              </div>

              {method === 'upi' && (
                <div className="rzp-field">
                  <label>UPI ID</label>
                  <input placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)} />
                </div>
              )}
              {method === 'card' && (
                <div className="rzp-field">
                  <label>Card Number</label>
                  <input
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    value={cardNum}
                    onChange={e => setCardNum(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                  />
                </div>
              )}
              {method === 'netbanking' && (
                <div className="rzp-field">
                  <label>Select Bank</label>
                  <select>
                    <option>State Bank of India</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                  </select>
                </div>
              )}

              {error && <p className="rzp-error">{error}</p>}

              <button className="rzp-pay-btn" onClick={handlePay}>
                Pay ₹{record.totalDue?.toLocaleString()}
              </button>
              <p className="rzp-secure">
                <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                Secured by Razorpay
              </p>
            </>
          )}

          {step === 'processing' && (
            <div className="rzp-processing">
              <div className="rzp-spinner" aria-hidden="true" />
              <p>Processing your payment...</p>
              <p className="rzp-processing-sub">Please do not close this window.</p>
            </div>
          )}

          {step === 'success' && (
            <div className="rzp-success">
              <div className="rzp-success-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" width="32" height="32"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h3>Payment Successful!</h3>
              <p>Your property tax for <strong>{record.financialYear}</strong> has been paid.</p>
              <p className="rzp-txn">Transaction ID: <strong>{'TXN' + Date.now().toString().slice(-8).toUpperCase()}</strong></p>
              <button className="rzp-pay-btn" onClick={handleDone}>Download Receipt</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function PropertyTax() {
  const [records, setRecords] = useState([]);
  const [myRecord, setMyRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [payingRecord, setPayingRecord] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('userData') || '{}'); } catch { return {}; }
  })();

  const loadRecords = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const data = await getPropertyTaxRecords(q);
      setRecords(data);
      // Show logged-in user's own record at top if present
      const mine = data.find(r => r.userId === user.uid);
      setMyRecord(mine || null);
    } catch (err) {
      console.error('[PropertyTax] load error:', err);
    } finally {
      setLoading(false);
    }
  }, [user.uid]);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    loadRecords(searchInput.trim());
  };

  const handlePaymentSuccess = async (paymentData) => {
    if (!payingRecord) return;
    try {
      await recordPropertyTaxPayment(payingRecord.id, paymentData);
      setSuccessMsg(`Payment of ₹${payingRecord.totalDue?.toLocaleString()} recorded. Transaction ID: ${paymentData.transactionId}`);
      setPayingRecord(null);
      loadRecords(search);
      setTimeout(() => setSuccessMsg(''), 8000);
    } catch (err) {
      console.error('[PropertyTax] payment record error:', err);
    }
  };

  const pending = records.filter(r => r.status === 'Pending' || r.status === 'Unpaid');
  const paid = records.filter(r => r.status === 'Paid');

  return (
    <div className="property-page">
      <CitizenNavbar />

      <main className="property-main">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <a href="/citizen-dashboard">Dashboard</a>
          <span className="breadcrumb-sep">›</span>
          <span>Property Tax</span>
        </nav>

        <header className="property-header">
          <div className="property-header-icon">
            <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 28L32 8l24 20v28H40V40H24v16H8V28z" fill="#FF6F00" opacity="0.15" stroke="#FF6F00" strokeWidth="2.5" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1>Property Tax Portal</h1>
            <p>View pending property tax dues, search by owner or property ID, and pay online securely.</p>
          </div>
          <div className="pt-header-stats">
            <div className="pt-stat">
              <span className="pt-stat-num" style={{ color: '#e65100' }}>{pending.length}</span>
              <span className="pt-stat-label">Pending</span>
            </div>
            <div className="pt-stat-sep" />
            <div className="pt-stat">
              <span className="pt-stat-num" style={{ color: '#10b981' }}>{paid.length}</span>
              <span className="pt-stat-label">Paid</span>
            </div>
          </div>
        </header>

        {successMsg && (
          <div className="pt-success-banner" role="status">
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18" aria-hidden="true"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            {successMsg}
          </div>
        )}

        {/* My record */}
        {myRecord && myRecord.status !== 'Paid' && (
          <div className="pt-my-record card">
            <div className="pt-my-record-header">
              <div>
                <span className="pt-my-label">Your Property Tax — Due</span>
                <h2>{myRecord.ownerName}</h2>
                <p className="pt-my-pid">{myRecord.propertyId}</p>
              </div>
              <div className="pt-my-right">
                <span className="pt-due-amount">₹{myRecord.totalDue?.toLocaleString()}</span>
                <button className="btn btn-primary" onClick={() => setPayingRecord(myRecord)}>Pay Now</button>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <form className="pt-search-bar" onSubmit={handleSearch} aria-label="Search property records">
          <input
            type="text"
            placeholder="Search by Owner Name, Property ID or Address..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            aria-label="Search query"
          />
          <button type="submit" className="btn btn-primary">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
            Search
          </button>
          {search && (
            <button type="button" className="btn btn-ghost" onClick={() => { setSearchInput(''); setSearch(''); loadRecords(''); }}>
              Clear
            </button>
          )}
        </form>

        <div className="property-two-col">
          {/* Pending list */}
          <section className="property-left">
            <h2 className="section-heading">
              Pending Tax Records
              <span className="pt-count-badge">{pending.length}</span>
            </h2>

            {loading ? (
              <div className="pt-loading">
                {[1, 2, 3].map(i => <div key={i} className="pt-skeleton" aria-hidden="true" />)}
              </div>
            ) : pending.length === 0 ? (
              <div className="pt-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40" aria-hidden="true"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p>{search ? 'No records found for your search.' : 'No pending tax records.'}</p>
              </div>
            ) : (
              <div className="pt-records-list">
                {pending.map(record => (
                  <div key={record.id} className="card pt-record-card">
                    <div className="pt-record-top">
                      <div className="pt-record-info">
                        <div className="pt-record-owner">{record.ownerName}</div>
                        <div className="pt-record-pid">{record.propertyId}</div>
                        <div className="pt-record-address">{record.address}</div>
                        <div className="pt-record-meta">
                          <span>{record.type || 'Residential'}</span>
                          <span className="pt-dot" aria-hidden="true" />
                          <span>{record.area}</span>
                          <span className="pt-dot" aria-hidden="true" />
                          <span>FY {record.financialYear}</span>
                        </div>
                      </div>
                      <div className="pt-record-right">
                        <span className="pt-due-chip">₹{record.totalDue?.toLocaleString()}</span>
                        <span className="status-chip pending" style={{ fontSize: '0.72rem' }}>Unpaid</span>
                      </div>
                    </div>
                    <div className="pt-record-breakdown">
                      <span>Base: ₹{record.baseTax?.toLocaleString()}</span>
                      <span>Surcharge: ₹{record.surcharge?.toLocaleString()}</span>
                      <span>Penalty: ₹{record.penalty?.toLocaleString() || 0}</span>
                    </div>
                    <div className="pt-record-footer">
                      <span className="pt-due-date">
                        <svg viewBox="0 0 20 20" fill="currentColor" width="13" height="13" aria-hidden="true"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                        Due: {record.dueDate}
                      </span>
                      <button className="btn btn-primary btn-sm" onClick={() => setPayingRecord(record)}>
                        Pay Online
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paid records */}
            {paid.length > 0 && (
              <>
                <h2 className="section-heading" style={{ marginTop: '2rem' }}>
                  Paid Records
                  <span className="pt-count-badge" style={{ background: '#d1fae5', color: '#065f46' }}>{paid.length}</span>
                </h2>
                <div className="pt-records-list">
                  {paid.map(record => (
                    <div key={record.id} className="card pt-record-card pt-record-card--paid">
                      <div className="pt-record-top">
                        <div className="pt-record-info">
                          <div className="pt-record-owner">{record.ownerName}</div>
                          <div className="pt-record-pid">{record.propertyId}</div>
                          <div className="pt-record-address">{record.address}</div>
                        </div>
                        <div className="pt-record-right">
                          <span className="status-chip resolved">Paid</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Right: search + history */}
          <section className="property-right">
            <div className="card search-property-card">
              <h3>Search Another Property</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                Enter a Property ID, owner name, or address to look up tax records.
              </p>
              <form className="service-form" onSubmit={handleSearch} aria-label="Quick property search">
                <div className="form-group">
                  <label htmlFor="pt-search-id">Property ID / Owner Name</label>
                  <input
                    id="pt-search-id"
                    type="text"
                    placeholder="e.g. UP-MUN-2026-XXXXX"
                    value={searchInput}
                    onChange={e => setSearchInput(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-secondary">Search Property</button>
              </form>
            </div>

            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, marginBottom: '0.75rem' }}>How to Pay</h3>
              <ol className="pt-how-list">
                <li>Search for your property by name or ID above.</li>
                <li>Click <strong>Pay Online</strong> on your property card.</li>
                <li>Choose your payment method: UPI, Card, or Net Banking.</li>
                <li>Complete payment — you will get a Transaction ID as receipt.</li>
              </ol>
            </div>
          </section>
        </div>
      </main>

      <CitizenFooter />

      {payingRecord && (
        <RazorpayModal
          record={payingRecord}
          onClose={() => setPayingRecord(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
