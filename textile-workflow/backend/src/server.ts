import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Services
import { RawDataService } from './services/RawDataService';
import { ChemicalResourceService } from './services/ChemicalResourceService';
import { ProductionService } from './services/ProductionService';
import { WasteService } from './services/WasteService';
import { ComplianceService } from './services/ComplianceService';
import { ExportService } from './services/ExportService';

// Controllers
import { RawDataController } from './controllers/RawDataController';
import { ChemicalResourceController } from './controllers/ChemicalResourceController';
import { ProductionController } from './controllers/ProductionController';
import { WasteController } from './controllers/WasteController';
import { ComplianceController } from './controllers/ComplianceController';
import { ExportController } from './controllers/ExportController';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;
const prisma = new PrismaClient();

// Dependency Injection
const rawDataService = new RawDataService(prisma);
const rawDataController = new RawDataController(rawDataService);

const chemicalService = new ChemicalResourceService(prisma);
const chemicalController = new ChemicalResourceController(chemicalService);

const productionService = new ProductionService(prisma);
const productionController = new ProductionController(productionService);

const wasteService = new WasteService(prisma);
const wasteController = new WasteController(wasteService);

const complianceService = new ComplianceService(prisma);
const complianceController = new ComplianceController(complianceService);

const exportService = new ExportService(prisma);
const exportController = new ExportController(exportService);

// ================= ROUTES ================= //

// Raw Data
app.post('/api/raw-data', rawDataController.createBatch);
app.get('/api/raw-data', rawDataController.getBatches);

// Chemicals
app.get('/api/chemicals', chemicalController.getChemicals);
app.post('/api/chemicals', chemicalController.addChemical);
app.put('/api/chemicals/:id/consume', chemicalController.consumeChemical);

// Production
app.get('/api/production', productionController.getProcesses);
app.post('/api/production', productionController.startProcess);
app.put('/api/production/:id/finish', productionController.finishProcess);

// Waste
app.get('/api/waste', wasteController.getWasteRecords);
app.post('/api/waste', wasteController.logWaste);

// Compliance
app.get('/api/compliance', complianceController.getLogs);
app.post('/api/compliance', complianceController.logCompliance);

// Exports
app.get('/api/exports', exportController.getExports);
app.post('/api/exports', exportController.generateExport);

app.get('/', (_req, res) => {
  res.send(`
    <style>
      body { background: #0f172a; color: #f8fafc; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
      .card { background: rgba(30, 41, 59, 0.7); padding: 40px; border-radius: 24px; border: 1px solid #334155; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
      h1 { color: #2dd4bf; margin-bottom: 8px; }
      .pill { background: #134e4a; color: #2dd4bf; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: bold; margin-bottom: 24px; display: inline-block; }
    </style>
    <div class="card">
      <div class="pill">CORE NODE ACTIVE</div>
      <h1>Smart Textile Process Intelligence</h1>
      <p>Node V1.0 API Engine — (SQLite/Prisma)</p>
      <hr style="border: 0; border-top: 1px solid #334155; margin: 20px 0;">
      <p style="font-size: 14px; opacity: 0.7;">Frontend is reachable on port 5173 / 5174</p>
    </div>
  `);
});

app.get('/api/status', (_req, res) => {
  res.json({ status: 'Textile Intel Nominal', theme: 'Emerald & Slate', port: PORT });
});

// ================= SEED DEFAULT DATA ================= //
async function seedDefaults() {
  // Seed chemicals if none exist
  const existingChemicals = await prisma.chemicalResource.count();
  if (existingChemicals === 0) {
    await prisma.chemicalResource.createMany({
      data: [
        { name: 'Indigo Dye',       currentLiters: 180, depletionRate: 0.4 },
        { name: 'Sodium Hydroxide', currentLiters: 95,  depletionRate: 0.6 },
        { name: 'Hydrogen Peroxide',currentLiters: 42,  depletionRate: 0.2, threshold50: true },
        { name: 'Acetic Acid',      currentLiters: 15,  depletionRate: 0.1, threshold50: true, threshold20: true },
      ]
    });
    console.log('[SEED] Chemical resources seeded.');
  }

  // Seed compliance logs if none exist
  const existingCompliance = await prisma.complianceLog.count();
  if (existingCompliance === 0) {
    await prisma.complianceLog.createMany({
      data: [
        { parameter: 'Water pH',       value: 7.2,  isCompliant: true },
        { parameter: 'CO2 Emissions',  value: 340,  isCompliant: true },
        { parameter: 'Noise Level (dB)',value: 78,  isCompliant: true },
        { parameter: 'Water pH',       value: 9.1,  isCompliant: false },
        { parameter: 'Effluent BOD',   value: 45,   isCompliant: true },
      ]
    });
    console.log('[SEED] Compliance logs seeded.');
  }
}

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await seedDefaults();
});
