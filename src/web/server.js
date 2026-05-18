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
import { getLiveWalletBalanceSOL } from '../liveExecutor.js';
import { fetchSolUsdPrice } from '../enrichment/jupiter.js';

export function startWebServer(port = 3000) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // API Endpoints

  app.get('/api/stats', async (req, res) => {
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
      
      const realWalletBalance = await getLiveWalletBalanceSOL();
      const solPriceUsd = await fetchSolUsdPrice();
      
      res.json({
        totalTrades: trades.length,
        totalPositions: positions.length,
        winRate: closedPositions.length > 0 ? (winCount / closedPositions.length) * 100 : 0,
        openPositions: positions.filter(p => p.status === 'open').length,
        realWalletBalance: realWalletBalance,
        solPriceUsd: solPriceUsd,
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
      // Sanity check: ensure only one strategy is enabled in DB
      const enabledCount = db.prepare('SELECT COUNT(*) as count FROM strategies WHERE enabled = 1').get().count;
      if (enabledCount > 1) {
        console.log(`[API] DB Inconsistency detected (${enabledCount} enabled). Fixing...`);
        const firstActive = db.prepare('SELECT id FROM strategies WHERE enabled = 1 LIMIT 1').get().id;
        db.prepare('UPDATE strategies SET enabled = 0').run();
        db.prepare('UPDATE strategies SET enabled = 1 WHERE id = ?').run(firstActive);
      }

      const strategies = allStrategies();
      const global = {
        trading_mode: db.prepare('SELECT value FROM settings WHERE key = ?').get('trading_mode')?.value || 'dry_run',
        agent_enabled: db.prepare('SELECT value FROM settings WHERE key = ?').get('agent_enabled')?.value !== 'false',
        dry_run_wallet_balance: db.prepare('SELECT value FROM settings WHERE key = ?').get('dry_run_wallet_balance')?.value || 'off',
        llm_candidate_pick_count: Number(db.prepare('SELECT value FROM settings WHERE key = ?').get('llm_candidate_pick_count')?.value || 10),
        llm_candidate_max_age_ms: Number(db.prepare('SELECT value FROM settings WHERE key = ?').get('llm_candidate_max_age_ms')?.value || 600000),
        max_open_positions: Number(db.prepare('SELECT value FROM settings WHERE key = ?').get('max_open_positions')?.value || 3),
        override_tpsl_enabled: db.prepare('SELECT value FROM settings WHERE key = ?').get('override_tpsl_enabled')?.value === 'true',
        default_tp_percent: Number(db.prepare('SELECT value FROM settings WHERE key = ?').get('default_tp_percent')?.value || 50),
        default_sl_percent: Number(db.prepare('SELECT value FROM settings WHERE key = ?').get('default_sl_percent')?.value || -25),
        default_trailing_percent: Number(db.prepare('SELECT value FROM settings WHERE key = ?').get('default_trailing_percent')?.value || 20),
        default_trailing_enabled: db.prepare('SELECT value FROM settings WHERE key = ?').get('default_trailing_enabled')?.value !== 'false',
      };
      res.json({ strategies, global });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/settings', (req, res) => {
    try {
      const { strategyId, config, isActive, global } = req.body;
      
      // Update specific strategy config
      if (strategyId && config) {
        updateStrategyConfig(strategyId, config);
      }
      
      // Set active strategy
      if (strategyId !== undefined && isActive !== undefined) {
        const isTrue = isActive === true || isActive === 'true';
        // Only log if it's a real toggle request
        console.log(`[API] Strategy Toggle Request: ${strategyId} -> ${isTrue}`);
        
        if (isTrue) {
          setActiveStrategy(strategyId);
        } else {
          db.prepare('UPDATE strategies SET enabled = 0 WHERE id = ?').run(strategyId);
        }
      }

      // Update global settings
      if (global) {
        console.log('[API] Global settings update request:', global);
        for (const [key, value] of Object.entries(global)) {
          const valStr = String(value);
          db.prepare(`
            INSERT INTO settings (key, value) VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
          `).run(key, valStr);
          console.log(`[API] Saved to DB: ${key} = ${valStr}`);
        }
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

  app.get('/api/system-info', (req, res) => {
    try {
      res.json({
        solanaRpc: process.env.SOLANA_RPC_URL ? 'Connected' : 'Not Configured',
        jupiterApi: process.env.JUPITER_SWAP_BASE_URL ? 'Active' : 'Not Configured',
        gmgnApi: process.env.GMGN_API_KEY ? 'Active' : 'Not Configured',
        llmApi: process.env.LLM_API_KEY ? 'Active' : 'Not Configured',
        signalServer: process.env.SIGNAL_SERVER_URL ? 'Connected' : 'Not Configured',
        dbPath: './charon.sqlite',
        nodeVersion: process.version,
        platform: process.platform,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.listen(port, () => {
    console.log(`[web] Dashboard API listening on port ${port}`);
  });
}
