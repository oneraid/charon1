import express from 'express';
import cors from 'cors';
import { db } from '../db/connection.js';
import { allPositions } from '../db/positions.js';
import { recentEligibleCandidates } from '../db/candidates.js';
import { allStrategies, updateStrategyConfig, setActiveStrategy } from '../db/settings.js';
import { closePosition } from '../telegram/commands.js';
import { fetchWalletPnl } from '../enrichment/wallets.js';
import { TELEGRAM_CHAT_ID } from '../config.js';
import { now } from '../utils.js';

export function startWebServer(port = 3000) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // API Endpoints

  app.get('/api/stats', (req, res) => {
    try {
      // Basic stats calculation from trades and positions
      const trades = db.prepare('SELECT * FROM dry_run_trades').all();
      const positions = db.prepare('SELECT * FROM dry_run_positions').all();
      
      const closedPositions = positions.filter(p => p.status === 'closed');
      const winCount = closedPositions.filter(p => {
        const exit = Number(p.exit_price || 0);
        const entry = Number(p.entry_price || 0);
        return exit > entry;
      }).length;
      
      res.json({
        totalTrades: trades.length,
        totalPositions: positions.length,
        winRate: closedPositions.length > 0 ? (winCount / closedPositions.length) * 100 : 0,
        openPositions: positions.filter(p => p.status === 'open').length,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/positions', (req, res) => {
    try {
      const positions = allPositions(50);
      res.json(positions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // NEW: Close a position
  app.post('/api/positions/:id/close', async (req, res) => {
    try {
      const { id } = req.params;
      const reason = req.body.reason || 'manual_close_via_web';
      await closePosition(TELEGRAM_CHAT_ID, Number(id), reason);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // NEW: Update TP/SL rules
  app.post('/api/positions/:id/rules', (req, res) => {
    try {
      const { id } = req.params;
      const { tp_percent, sl_percent, trailing_enabled, trailing_percent } = req.body;
      
      const posId = Number(id);
      db.prepare(`
        UPDATE dry_run_positions 
        SET tp_percent = ?, sl_percent = ?, trailing_enabled = ?, trailing_percent = ? 
        WHERE id = ?
      `).run(tp_percent, sl_percent, trailing_enabled ? 1 : 0, trailing_percent, posId);
      
      db.prepare(`
        INSERT INTO tp_sl_rules (position_id, tp_percent, sl_percent, trailing_enabled, trailing_percent, updated_at_ms)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(position_id) DO UPDATE SET
          tp_percent = excluded.tp_percent,
          sl_percent = excluded.sl_percent,
          trailing_enabled = excluded.trailing_enabled,
          trailing_percent = excluded.trailing_percent,
          updated_at_ms = excluded.updated_at_ms
      `).run(posId, tp_percent, sl_percent, trailing_enabled ? 1 : 0, trailing_percent, now());
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/candidates', (req, res) => {
    try {
      const candidates = recentEligibleCandidates(20);
      res.json(candidates);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/settings', (req, res) => {
    try {
      const strategies = allStrategies();
      res.json({ strategies });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/settings', (req, res) => {
    try {
      const { strategyId, config, isActive } = req.body;
      if (strategyId && config) {
        updateStrategyConfig(strategyId, config);
      }
      if (isActive) {
        setActiveStrategy(strategyId);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // NEW: Wallet endpoints
  app.get('/api/wallets', (req, res) => {
    try {
      const wallets = db.prepare('SELECT * FROM saved_wallets ORDER BY label').all();
      res.json({ wallets });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/wallets', (req, res) => {
    try {
      const { label, address } = req.body;
      if (!label || !address) throw new Error("Label and address required");
      db.prepare(`
        INSERT INTO saved_wallets (label, address, created_at_ms) VALUES (?, ?, ?)
        ON CONFLICT(label) DO UPDATE SET address = excluded.address
      `).run(label, address, now());
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/wallets/:label', (req, res) => {
    try {
      const { label } = req.params;
      db.prepare('DELETE FROM saved_wallets WHERE label = ?').run(label);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/pnl', async (req, res) => {
    try {
      const wallets = db.prepare('SELECT * FROM saved_wallets ORDER BY label').all();
      const pnlData = [];
      for (const wallet of wallets) {
        const pnl = await fetchWalletPnl(wallet.address).catch(() => null);
        pnlData.push({ wallet, pnl });
      }
      res.json({ pnlData });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.listen(port, () => {
    console.log(`[web] Dashboard API listening on port ${port}`);
  });
}
