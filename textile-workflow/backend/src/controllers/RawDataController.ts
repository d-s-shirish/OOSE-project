import { Request, Response } from 'express';
import { RawDataService } from '../services/RawDataService';

export class RawDataController {
  private rawDataService: RawDataService;

  constructor(rawDataService: RawDataService) {
    this.rawDataService = rawDataService;
  }

  public createBatch = async (req: Request, res: Response): Promise<void> => {
    try {
      const { externalId, material, weightKg, supplier } = req.body;
      const result = await this.rawDataService.createBatch(externalId, material, parseFloat(weightKg), supplier);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      console.error("[RawDataController] CREATE_BATCH_ERROR:", error.message || error);
      res.status(400).json({ success: false, error: error.message });
    }
  };

  public getBatches = async (req: Request, res: Response): Promise<void> => {
    try {
      const batches = await this.rawDataService.getBatches();
      res.status(200).json({ success: true, data: batches });
    } catch (error: any) {
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  };
}
