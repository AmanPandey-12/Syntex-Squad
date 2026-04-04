export const generateHTMLReport = (data, t, now = new Date(), language = 'en') => {
  const title = t ? (t('inv.healthCert') || 'Plant Health Certificate') : 'Plant Health Certificate';
  const subtitle = t ? (t('inv.officialReport') || 'Official KrishiAI Biological Report') : 'Official KrishiAI Biological Report';
  const cropIdLabel = t ? (t('inv.cropId') || 'Crop Identification') : 'Crop Identification';
  const healthScoreLabel = t ? (t('inv.health') || 'Health Score') : 'Health Score';
  const vitalityIndexLabel = t ? (t('inv.vitalityIndex') || 'Vitality Index') : 'Vitality Index';
  const severityLabel = t ? (t('inv.severity') || 'Severity') : 'Severity';
  const protocolLabel = t ? (t('inv.medicalProtocol') || 'Medical & Nutritional Protocol') : 'Medical & Nutritional Protocol';
  const fertLabel = t ? (t('det.nutrientProtocol') || 'Recommended Fertilizer') : 'Recommended Fertilizer';
  const pestLabel = t ? (t('det.protectionProtocol') || 'Protection Medicine') : 'Protection Medicine';
  
  // Data Extraction (Handling both Scan Result and Firestore Crop Doc)
  const full = data.lastScanFull || data;
  const content = full?.[language] || full?.en || full || {};
  const cropName = data.nickname || content.cropName || data.name || data.cropName || "Unknown Crop";
  const diagnosis = content.diagnosis || data.diagnosis || data.problem || "Healthy";
  const healthScore = data.healthScore || data.score || 0;
  const confidence = data.confidence || 0;
  const severity = data.severity || "Low";
  const fertilizer = content.fertilizer || data.solve || "N/A";
  const pesticide = content.pesticide || "None Required";
  const summary = content.summary || data.summary || "Optimal status maintained.";
  const solutions = content.solution || [];
  const imgUrl = data.imgUrl || data.imageUrl || "";

  const stepRows = (steps = [], label) => steps.length ? `
    <p class="section-label">${label}</p>
    ${steps.slice(0, 3).map((s, i) => `
      <div class="step-row">
        <div class="step-num">${i + 1}</div>
        <div class="step-body">
          <p class="step-title">${s.title}</p>
          <p class="step-detail">${s.detail}</p>
        </div>
      </div>`).join('')}` : '';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<title>${title} - ${cropName}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800&family=Mrs+Saint+Delafield&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',sans-serif;background:#f8fafc;color:#0f172a;padding:20px}
.certificate{max-width:800px;margin:10px auto;background:#fff;border:10px double #cbd5e1;padding:30px 40px;position:relative;box-shadow:0 10px 30px rgba(0,0,0,0.05)}
.watermark{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-45deg);font-size:120px;font-weight:900;color:rgba(46,125,79,0.03);z-index:0;white-space:nowrap;pointer-events:none;font-family:'Instrument Serif',serif}
.header-box{border-bottom:2px solid #0f172a;padding-bottom:15px;margin-bottom:25px;text-align:center;position:relative;z-index:1}
.cert-title{font-family:'Instrument Serif',serif;font-size:38px;letter-spacing:-0.02em;color:#2e7d4f;margin-bottom:4px;text-transform:uppercase}
.cert-subtitle{font-size:10px;font-weight:800;letter-spacing:0.4em;color:#64748b;text-transform:uppercase}
.main-content{position:relative;z-index:1}
.meta-grid{display:grid;grid-template-columns:1.5fr 1fr;gap:20px;margin-bottom:25px}
.crop-info-card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:20px;display:flex;gap:16px;align-items:center}
.crop-photo{width:90px;height:90px;border-radius:12px;object-fit:cover;border:2px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,0.1);background:#e2e8f0}
.label{font-size:8px;font-weight:900;text-transform:uppercase;letter-spacing:0.2em;color:#94a3b8;margin-bottom:4px;display:block}
.value{font-size:24px;font-weight:800;color:#0f172a;font-family:'Instrument Serif',serif}
.diagnosis-badge{background:#1e293b;color:#fff;padding:6px 12px;border-radius:8px;font-size:11px;font-weight:800;text-transform:uppercase;display:inline-block;margin-top:6px}
.metrics-box{display:grid;grid-template-columns:1fr;gap:10px}
.metric-row{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#fff;border:1px solid #e2e8f0;border-radius:12px}
.metric-name{font-size:9px;font-weight:700;color:#64748b;text-transform:uppercase}
.metric-val{font-size:17px;font-weight:800;color:#2e7d4f}
.section-label{font-size:9px;font-weight:900;color:#2e7d4f;letter-spacing:0.15em;text-transform:uppercase;margin:20px 0 8px;border-left:3px solid #2e7d4f;padding-left:10px}
.summary-box{font-size:13px;line-height:1.5;color:#334155;background:#f0fdf4;border:1px solid #dcfce7;padding:14px;border-radius:10px;font-style:italic}
.krishi-stamp{position:absolute;bottom:80px;right:40px;width:120px;height:120px;display:flex;align-items:center;justify-content:center;transform:rotate(-15deg);opacity:0.6;pointer-events:none;z-index:2}
.stamp-outer{position:absolute;width:100%;height:100%;border:4px double #b91c1c;border-radius:50%}
.stamp-inner-circle{position:absolute;width:80%;height:80%;border:2px solid #b91c1c;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-direction:column;color:#b91c1c;font-family:'Instrument Serif',serif}
.stamp-text{font-size:20px;font-weight:900;letter-spacing:1px;border-top:1px solid #b91c1c;border-bottom:1px solid #b91c1c;padding:2px 6px;margin:1px 0}
.medicine-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.med-card{padding:12px;border-radius:10px;border:1px solid #e2e8f0}
.med-card--fert{background:#f0f9ff;border-color:#e0f2fe}
.med-card--pest{background:#fff1f2;border-color:#ffe4e6}
.med-title{font-size:9px;font-weight:800;text-transform:uppercase;margin-bottom:2px}
.med-val{font-size:12px;font-weight:700;color:#1e293b}
.step-row{display:flex;gap:10px;margin-bottom:6px;padding:6px 8px;border-bottom:1px solid #f1f5f9}
.step-num{width:18px;height:18px;background:#2e7d4f;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;flex-shrink:0}
.step-title{font-size:11px;font-weight:800;color:#0f172a}
.step-detail{font-size:10px;color:#64748b;margin-top:1px}
.footer{margin-top:40px;padding-top:15px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:flex-end}
.signature{text-align:center;position:relative}
.sig-name{font-family:'Mrs Saint Delafield', cursive;font-size:42px;color:#1e293b;margin-bottom:-18px;transform:rotate(-4deg);opacity:0.8}
.sig-label{font-size:10px;font-weight:800;color:#1e293b;text-transform:uppercase;border-top:1px solid #1e293b;padding-top:4px}
</style></head><body>
<div class="certificate">
  <div class="watermark">KrishiAI</div>
  <div class="header-box">
    <h1 class="cert-title">${title}</h1>
    <p class="cert-subtitle">${subtitle}</p>
  </div>
  <div class="main-content">
    <div class="meta-grid">
      <div class="crop-info-card">
        ${imgUrl ? `<img src="${imgUrl}" class="crop-photo" onerror="this.style.display='none'"/>` : `<div class="crop-photo"></div>`}
        <div>
          <span class="label">${cropIdLabel}</span>
          <div class="value">${cropName}</div>
          <div class="diagnosis-badge">${diagnosis}</div>
        </div>
      </div>
      <div class="metrics-box">
        <div class="metric-row"><span class="metric-name">${healthScoreLabel}</span><span class="metric-val" style="color:#2e7d4f">${healthScore}%</span></div>
        <div class="metric-row"><span class="metric-name">${vitalityIndexLabel}</span><span class="metric-val">${confidence}%</span></div>
        <div class="metric-row"><span class="metric-name">${severityLabel}</span><span class="metric-val">${severity}</span></div>
      </div>
    </div>

    <p class="section-label">${protocolLabel}</p>
    <div class="medicine-grid">
       <div class="med-card med-card--fert">
          <p class="med-title" style="color:#0369a1">${fertLabel}</p>
          <p class="med-val">${fertilizer}</p>
       </div>
       <div class="med-card med-card--pest">
          <p class="med-title" style="color:#be123c">${pestLabel}</p>
          <p class="med-val">${pesticide}</p>
       </div>
    </div>

    <p class="section-label">${t ? (t('inv.diagnosis') || 'Observations') : 'Observations'}</p>
    <div class="summary-box">${summary}</div>

    ${stepRows(solutions, t ? (t('inv.solutionSteps') || 'Solutions') : 'Solutions')}

    <div class="krishi-stamp">
      <div class="stamp-outer"></div>
      <div class="stamp-inner-circle">
        <div style="font-size:8px; font-weight:800">KrishiAI Station</div>
        <div class="stamp-text">CERTIFIED</div>
        <div style="font-size:8px; font-weight:800">VALIDATED</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div style="font-size:8px; color:#94a3b8; font-weight:600">
      KRISHIAI PRECISION REPORT V4<br/>
      SCANNED: ${now.toLocaleString()}
    </div>
    <div class="signature">
      <div class="sig-name">KrishiAI</div>
      <div class="sig-label">Authorized Signature</div>
    </div>
  </div>
</div></body></html>`;
};