import { PrismaClient } from '@prisma/client';

export class ComplianceService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  public async getLogs() {
    return this.prisma.complianceLog.findMany({
      orderBy: { recordedAt: 'desc' }
    });
  }

  public async logCompliance(parameter: string, value: number) {
    // Assess compliance dynamically based on param
    let isCompliant = true;

    if (parameter.toLowerCase().includes("ph")) {
      // pH should be between 6.5 and 8.5
      isCompliant = (value >= 6.5 && value <= 8.5);
    } else if (parameter.toLowerCase().includes("emission")) {
      // CO2 below 500
      isCompliant = (value <= 500);
    }

    return this.prisma.complianceLog.create({
      data: {
        parameter,
        value,
        isCompliant
      }
    });
  }
}
