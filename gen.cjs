const Database = require('better-sqlite3');
const db = new Database('charon.sqlite');
const positions = db.prepare('SELECT * FROM dry_run_positions ORDER BY opened_at_ms DESC LIMIT 100').all();
const settings = db.prepare('SELECT * FROM settings').all();
const fs = require('fs');

let md = '# 📊 Charon Dry Run Trading Report\n\n';

md += '## ⚙️ Filters & Settings Used\n\n';
md += '| Key | Value |\n|---|---|\n';
settings.forEach(s => {
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
md += '| ID | Strategy | Symbol | Mint | Status | Entry Price | PnL % | PnL SOL | Exit Reason |\n|---|---|---|---|---|---|---|---|---|\n';

positions.forEach(p => {
  const pnlPct = p.pnl_percent !== null ? p.pnl_percent.toFixed(2) + '%' : '-';
  const pnlSol = p.pnl_sol !== null ? p.pnl_sol.toFixed(6) : '-';
  const entryPrice = p.entry_price ? p.entry_price.toFixed(10) : '-';
  const strategy = p.strategy_id || '-';
  md += '| ' + p.id + ' | ' + strategy + ' | **' + p.symbol + '** | `' + p.mint.slice(0,8) + '...` | ' + p.status + ' | ' + entryPrice + ' | ' + pnlPct + ' | ' + pnlSol + ' | ' + (p.exit_reason || '-') + ' |\n';
});

fs.writeFileSync('dry_run_report.md', md);
