const fs = require('fs');

try {
  const data = JSON.parse(fs.readFileSync('dump.json'));

  let md = '# 📊 Charon Dry Run Trading Report\n\n';

  // --- Filters & Settings ---
  md += '## ⚙️ Filters & Settings Used\n\n';
  md += '| Key | Value |\n|---|---|\n';
  
  data.settings.forEach(s => {
    let val = s.value;
    try {
      const parsed = JSON.parse(s.value);
      if (typeof parsed === 'object') {
        val = JSON.stringify(parsed);
      }
    } catch(e) {}
    md += '| `' + s.key + '` | `' + val + '` |\n';
  });

  md += '\n## 📈 Dry Run Positions\n\n';
  md += '| ID | Symbol | Mint | Status | Entry Price | PnL % | PnL SOL | Exit Reason |\n|---|---|---|---|---|---|---|---|\n';

  data.positions.slice(0, 100).forEach(p => {
    const pnlPct = p.pnl_percent !== null ? p.pnl_percent.toFixed(2) + '%' : '-';
    const pnlSol = p.pnl_sol !== null ? p.pnl_sol.toFixed(6) : '-';
    const entryPrice = p.entry_price ? p.entry_price.toFixed(10) : '-';
    md += '| ' + p.id + ' | **' + p.symbol + '** | `' + p.mint.slice(0,8) + '...` | ' + p.status + ' | ' + entryPrice + ' | ' + pnlPct + ' | ' + pnlSol + ' | ' + (p.exit_reason || '-') + ' |\n';
  });

  if (data.positions.length > 100) {
    md += '\n*(Showing latest 100 positions out of ' + data.positions.length + ')*\n';
  }

  fs.writeFileSync('dry_run_report.md', md);
  console.log('Report successfully generated at dry_run_report.md');
} catch (e) {
  console.error('Error generating report:', e);
}
