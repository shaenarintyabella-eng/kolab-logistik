import { masterModel } from '../models/masterModel.js';

export const dashboardController = {
  async getSummary(req, res) {
    try {
      const summary = await masterModel.getDashboardSummary();
      res.json({ success: true, data: summary });
    } catch (error) {
      console.error('Error getDashboardSummary:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
