import { PrismaClient } from '@prisma/client';

export class ExportService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  public async getExports() {
    return this.prisma.exportDocument.findMany({
      include: { batch: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  public async generateExport(batchId: string, type: string) {
    // Generate a mock secure URL based on type and timestamp
    const token = Math.random().toString(36).substr(2, 9);
    const mockUrl = `https://aura-docs.s3.amazonaws.com/exports/${batchId}/${type}_${token}.pdf`;

    return this.prisma.exportDocument.create({
      data: {
        batchId,
        type,
        url: mockUrl
      }
    });
  }
}
