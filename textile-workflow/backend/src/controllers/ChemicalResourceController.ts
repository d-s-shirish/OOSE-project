import { Request, Response } from 'express';
import { ChemicalResourceService } from '../services/ChemicalResourceService';

export class ChemicalResourceController {
  private chemicalService: ChemicalResourceService;

  constructor(service: ChemicalResourceService) {
    this.chemicalService = service;
  }

  public getChemicals = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.chemicalService.getChemicals();
      res.status(200).json({ success: true, data });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  public addChemical = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, currentLiters, depletionRate } = req.body;
      const data = await this.chemicalService.addChemical(name, currentLiters, depletionRate);
      res.status(201).json({ success: true, data });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  }

  public consumeChemical = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) throw new Error("ID is required");
      const { usedLiters } = req.body;
      const data = await this.chemicalService.consumeChemical(id as string, parseFloat(usedLiters));
      res.status(200).json({ success: true, data });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  }
}
