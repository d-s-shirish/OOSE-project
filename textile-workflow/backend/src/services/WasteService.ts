import { PrismaClient } from '@prisma/client';

export class WasteService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  public async getWasteRecords() {
    return this.prisma.wasteRecord.findMany({
      include: { batch: true },
      orderBy: { recordedAt: 'desc' }
    });
  }

  public async logWaste(batchId: string, type: string, quantityKg: number) {
    // SRS 4.4.2 & 4.4.4: Classify and Recommend
    let guidance = "Standard Treatment";
    if (type.toLowerCase().includes("biodegradable")) {
      guidance = "Sent to composting partner (SRS 4.4.2)";
    } else if (type.toLowerCase().includes("non-bio")) {
      guidance = "Polyester shredding -> Sent to insulation plant";
    }

    return this.prisma.wasteRecord.create({
      data: {
        batchId,
        type,
        quantityKg,
        upcycleGuidance: guidance
      }
    });
  }
}
