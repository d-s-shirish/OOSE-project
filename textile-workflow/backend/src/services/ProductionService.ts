import { PrismaClient } from '@prisma/client';

export class ProductionService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  public async getProcesses() {
    return this.prisma.productionProcess.findMany({
      include: { batch: true }
    });
  }

  public async generateExport(batchId: string, type: string) {
    // SRS 4.3.3:
    const hsCode = "HS-" + Math.floor(Math.random() * 9999);
    const gstNumber = "29AAAAA0000A1Z" + Math.floor(Math.random() * 9);

    return this.prisma.exportDocument.create({
      data: {
        batchId,
        type,
        hsCode,
        gstNumber,
        isSigned: true
      },
      include: { batch: true }
    });
  }

  public async startProcess(batchId: string, machineId: string, machineRpm: number, estimatedHrs: number) {
    return this.prisma.productionProcess.create({
      data: {
        batchId,
        machineId,
        machineRpm,
        estimatedHrs,
        status: "IN_PROGRESS",
        startTime: new Date()
      },
      include: { batch: true }
    });
  }

  public async finishProcess(processId: string, chemicalUsed: number) {
    return this.prisma.productionProcess.update({
      where: { id: processId },
      data: {
        status: "DONE",
        endTime: new Date(),
        chemicalUsed
      },
      include: { batch: true }
    });
  }
}
