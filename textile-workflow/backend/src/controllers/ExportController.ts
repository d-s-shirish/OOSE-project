import { Request, Response } from 'express';
import { ExportService } from '../services/ExportService';

export class ExportController {
  private exportService: ExportService;

  constructor(service: ExportService) {
    this.exportService = service;
  }

  public getExports = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.exportService.getExports();
      res.status(200).json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public generateExport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { batchId, type } = req.body;
      const data = await this.exportService.generateExport(batchId, type);
      res.status(201).json({ success: true, data });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  }
}
