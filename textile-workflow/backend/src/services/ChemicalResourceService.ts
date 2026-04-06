import { PrismaClient } from '@prisma/client';

export class ChemicalResourceService {
  private prisma: PrismaClient;

  constructor(prismaClient: PrismaClient) {
    this.prisma = prismaClient;
  }

  public async getChemicals() {
    return this.prisma.chemicalResource.findMany();
  }

  public async addChemical(name: string, initialLiters: number, depletionRate: number) {
    return this.prisma.chemicalResource.create({
      data: {
        name,
        currentLiters: initialLiters,
        depletionRate,
        threshold50: false,
        threshold20: false
      }
    });
  }

  public async consumeChemical(id: string, usedLiters: number) {
    const chemical = await this.prisma.chemicalResource.findUnique({ where: { id } });
    if (!chemical) throw new Error("Chemical not found");

    const newLiters = Math.max(0, chemical.currentLiters - usedLiters);
    // Simple mock logic for threshold flags: e.g. base scale from an assumed max or just static
    const threshold50 = newLiters < 50; 
    const threshold20 = newLiters < 20;

    return this.prisma.chemicalResource.update({
      where: { id },
      data: {
        currentLiters: newLiters,
        threshold50,
        threshold20
      }
    });
  }
}
