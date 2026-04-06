import { PrismaClient } from '@prisma/client';
import * as QRCode from 'qrcode';

export class RawDataService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  public async createBatch(externalId: string, material: string, weightKg: number, supplier: string) {
    // 1. Create the raw batch
    const batch = await this.prisma.rawBatch.create({
      data: { externalId, material, weightKg, supplier, status: 'PENDING' }
    });

    // 2. Generate QR code with compact payload (AES hex is too long for QR)
    const qrPayload = `TEXTILE-INTEL:${batch.externalId}:${material}:${weightKg}kg`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 2, width: 200 });

    await this.prisma.rawBatch.update({
      where: { id: batch.id },
      data: { encryptedQr: qrDataUrl }
    });

    // ── AUTO-CASCADE: populate all other modules with this batch ────────

    // 3. Production — auto-start a process for this batch
    const machineNum = Math.floor(Math.random() * 4) + 1;
    const rpm = [800, 1000, 1200, 1500][Math.floor(Math.random() * 4)];
    const estHrs = parseFloat((weightKg * 0.04 + 2).toFixed(1)); // SRS 4.3.4 prediction
    await this.prisma.productionProcess.create({
      data: {
        batchId: batch.id,
        machineId: `MCH-0${machineNum}`,
        machineRpm: rpm,
        estimatedHrs: estHrs,
        status: 'IN_PROGRESS',
        startTime: new Date()
      }
    });

    // 4. Waste — estimate waste at ~8% of batch weight (biodegradable)
    const bioWaste = parseFloat((weightKg * 0.08).toFixed(2));
    const nonBioWaste = parseFloat((weightKg * 0.02).toFixed(2));
    await this.prisma.wasteRecord.createMany({
      data: [
        {
          batchId: batch.id,
          type: 'Biodegradable',
          quantityKg: bioWaste,
          upcycleGuidance: 'Sent to composting partner (SRS 4.4.2)'
        },
        {
          batchId: batch.id,
          type: 'Non-Biodegradable',
          quantityKg: nonBioWaste,
          upcycleGuidance: 'Polyester shredding → Insulation plant (SRS 4.4.4)'
        }
      ]
    });

    // 5. Compliance — log Water pH and CO2 readings for this batch run
    const ph = parseFloat((6.8 + Math.random() * 1.6).toFixed(2));   // 6.8–8.4
    const co2 = parseFloat((280 + Math.random() * 260).toFixed(1));   // 280–540
    await this.prisma.complianceLog.createMany({
      data: [
        { parameter: `Water pH [${externalId}]`,      value: ph,  isCompliant: ph >= 6.5 && ph <= 8.5 },
        { parameter: `CO2 Emissions [${externalId}]`, value: co2, isCompliant: co2 <= 500 }
      ]
    });

    // 6. Export — auto-generate an invoice for this batch
    const hsCode = 'HS-' + (5000 + Math.floor(Math.random() * 4999));
    const gstNum = '29AAAAA' + Math.floor(1000 + Math.random() * 8999) + 'A1Z5';
    const token = Math.random().toString(36).substring(2, 9);
    const mockUrl = `https://aura-docs.s3.amazonaws.com/exports/${batch.id}/INVOICE_${token}.pdf`;
    await this.prisma.exportDocument.create({
      data: {
        batchId: batch.id,
        type: 'INVOICE',
        url: mockUrl,
        hsCode,
        gstNumber: gstNum,
        isSigned: true
      }
    });

    // 7. Chemicals — automatically reduce chemicals based on batch volume (SRS 4.2.1)
    const totalLitersRequired = parseFloat((weightKg * 0.15).toFixed(1)); // e.g. 0.15L per KG
    const chemicals = await this.prisma.chemicalResource.findMany();
    
    // Distribute the usage across available chemicals
    for (const chem of chemicals) {
      const usage = totalLitersRequired / chemicals.length;
      const newLevel = Math.max(0, chem.currentLiters - usage);
      await this.prisma.chemicalResource.update({
        where: { id: chem.id },
        data: {
          currentLiters: newLevel,
          threshold50: newLevel <= 50,
          threshold20: newLevel <= 20
        }
      });
    }

    // Return the batch with QR included
    return this.prisma.rawBatch.findUnique({ 
      where: { id: batch.id },
      include: { processes: true } 
    });
  }

  public async getBatches() {
    return this.prisma.rawBatch.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }
}
