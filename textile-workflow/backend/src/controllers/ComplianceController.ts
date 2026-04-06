import { Request, Response } from 'express';
import { ComplianceService } from '../services/ComplianceService';

export class ComplianceController {
  private complianceService: ComplianceService;

  constructor(service: ComplianceService) {
    this.complianceService = service;
  }

  public getLogs = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.complianceService.getLogs();
      res.status(200).json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public logCompliance = async (req: Request, res: Response): Promise<void> => {
    try {
      const { parameter, value } = req.body;
      const data = await this.complianceService.logCompliance(parameter, parseFloat(value));
      res.status(201).json({ success: true, data });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  }
}
