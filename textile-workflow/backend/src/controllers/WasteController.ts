import { Request, Response } from 'express';
import { WasteService } from '../services/WasteService';

export class WasteController {
  private wasteService: WasteService;

  constructor(service: WasteService) {
    this.wasteService = service;
  }

  public getWasteRecords = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.wasteService.getWasteRecords();
      res.status(200).json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public logWaste = async (req: Request, res: Response): Promise<void> => {
    try {
      const { batchId, type, quantityKg } = req.body;
      const data = await this.wasteService.logWaste(batchId, type, parseFloat(quantityKg));
      res.status(201).json({ success: true, data });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  }
}
