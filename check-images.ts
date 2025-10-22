import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkImages() {
  const property = await prisma.property.findUnique({
    where: { id: 'sample-apartment-1' },
    select: {
      id: true,
      name: true,
      images: true,
    },
  });
  
  console.log('Property:', property?.name);
  console.log('Images:', property?.images);
  console.log('Has images:', property?.images && property.images.length > 0);
  
  await prisma.$disconnect();
}

checkImages().catch(console.error);
