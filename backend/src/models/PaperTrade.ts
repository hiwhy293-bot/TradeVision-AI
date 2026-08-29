import { runQuery, allQuery, getQuery } from "../config/database";
import { v4 as uuidv4 } from "uuid";

export interface PaperTrade {
  id: string;
  predictionId: string;
  pair: string;
  direction: "LONG" | "SHORT";
  quantity: number;
  entryPrice: number;
  entryTime: Date;
  exitPrice?: number;
  exitTime?: Date;
  stopLoss: number;
  takeProfit: number;
  profitLoss?: number;
  status: "open" | "closed";
  exitReason?: string;
}

export class PaperTradeModel {
  /**
   * Create paper trade
   */
  async create(trade: Omit<PaperTrade, "id" | "status">): Promise<PaperTrade> {
    const id = uuidv4();
    const status = "open";

    const query = `
      INSERT INTO paper_trades (
        id, prediction_id, pair, direction, quantity, entry_price, entry_time,
        stop_loss, take_profit, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await runQuery(query, [
      id,
      trade.predictionId,
      trade.pair,
      trade.direction,
      trade.quantity,
      trade.entryPrice,
      trade.entryTime.toISOString(),
      trade.stopLoss,
      trade.takeProfit,
      status,
    ]);

    return { ...trade, id, status };
  }

  /**
   * Close paper trade
   */
  async close(
    id: string,
    exitPrice: number,
    exitReason: string
  ): Promise<PaperTrade | null> {
    const trade = await this.getById(id);
    if (!trade) return null;

    const exitTime = new Date();
    const profitLoss = (exitPrice - trade.entryPrice) * trade.quantity * (trade.direction === "LONG" ? 1 : -1);

    const query = `
      UPDATE paper_trades
      SET exit_price = ?, exit_time = ?, profit_loss = ?, status = ?, exit_reason = ?
      WHERE id = ?
    `;

    await runQuery(query, [exitPrice, exitTime.toISOString(), profitLoss, "closed", exitReason, id]);

    return {
      ...trade,
      exitPrice,
      exitTime,
      profitLoss,
      status: "closed",
      exitReason,
    };
  }

  /**
   * Get trade by ID
   */
  async getById(id: string): Promise<PaperTrade | null> {
    const query = `SELECT * FROM paper_trades WHERE id = ?`;
    const row = await getQuery(query, [id]);

    if (!row) return null;

    return this.mapRowToTrade(row);
  }

  /**
   * Get all trades
   */
  async getAll(
    status?: string,
    pair?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ trades: PaperTrade[]; total: number }> {
    let countQuery = "SELECT COUNT(*) as count FROM paper_trades WHERE 1=1";
    let dataQuery = "SELECT * FROM paper_trades WHERE 1=1";
    const params: any[] = [];

    if (status) {
      countQuery += " AND status = ?";
      dataQuery += " AND status = ?";
      params.push(status);
    }
    if (pair) {
      countQuery += " AND pair = ?";
      dataQuery += " AND pair = ?";
      params.push(pair);
    }

    dataQuery += " ORDER BY entry_time DESC LIMIT ? OFFSET ?";

    const countRow = await getQuery(countQuery, params.slice(0, params.length));
    const total = countRow?.count || 0;

    const dataParams = [...params, limit, offset];
    const rows = await allQuery(dataQuery, dataParams);

    const trades = rows.map((row) => this.mapRowToTrade(row));

    return { trades, total };
  }

  /**
   * Get trading statistics
   */
  async getStatistics(pair?: string): Promise<{
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    totalProfit: number;
    totalLoss: number;
    netProfit: number;
    avgWin: number;
    avgLoss: number;
  }> {
    let query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN profit_loss > 0 THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN profit_loss < 0 THEN 1 ELSE 0 END) as losses,
        SUM(CASE WHEN profit_loss > 0 THEN profit_loss ELSE 0 END) as total_profit,
        SUM(CASE WHEN profit_loss < 0 THEN profit_loss ELSE 0 END) as total_loss,
        AVG(CASE WHEN profit_loss > 0 THEN profit_loss ELSE NULL END) as avg_win,
        AVG(CASE WHEN profit_loss < 0 THEN profit_loss ELSE NULL END) as avg_loss
      FROM paper_trades
      WHERE status = 'closed'
    `;

    const params: any[] = [];
    if (pair) {
      query += " AND pair = ?";
      params.push(pair);
    }

    const row = await getQuery(query, params);

    const total = row?.total || 0;
    const wins = row?.wins || 0;
    const losses = row?.losses || 0;
    const totalProfit = row?.total_profit || 0;
    const totalLoss = row?.total_loss || 0;

    return {
      totalTrades: total,
      winningTrades: wins,
      losingTrades: losses,
      winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
      totalProfit,
      totalLoss,
      netProfit: totalProfit + totalLoss,
      avgWin: row?.avg_win || 0,
      avgLoss: row?.avg_loss || 0,
    };
  }

  private mapRowToTrade(row: any): PaperTrade {
    return {
      id: row.id,
      predictionId: row.prediction_id,
      pair: row.pair,
      direction: row.direction,
      quantity: row.quantity,
      entryPrice: row.entry_price,
      entryTime: new Date(row.entry_time),
      exitPrice: row.exit_price,
      exitTime: row.exit_time ? new Date(row.exit_time) : undefined,
      stopLoss: row.stop_loss,
      takeProfit: row.take_profit,
      profitLoss: row.profit_loss,
      status: row.status,
      exitReason: row.exit_reason,
    };
  }
}

export default new PaperTradeModel();
