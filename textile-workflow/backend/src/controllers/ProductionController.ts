import { Request, Response } from 'express';
import { ProductionService } from '../services/ProductionService';

export class ProductionController {
  private prodService: ProductionService;

  constructor(service: ProductionService) {
    this.prodService = service;
  }

  public getProcesses = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.prodService.getProcesses();
      res.status(200).json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public startProcess = async (req: Request, res: Response): Promise<void> => {
    try {
      const { batchId, machineId, machineRpm, estimatedHrs } = req.body;
      const data = await this.prodService.startProcess(batchId, machineId, machineRpm, estimatedHrs);
      res.status(201).json({ success: true, data });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  }

  public finishProcess = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) throw new Error("ID is required");
      const { chemicalUsed } = req.body;
      const data = await this.prodService.finishProcess(id as string, parseFloat(chemicalUsed || "0"));
      res.status(200).json({ success: true, data });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  }
}
