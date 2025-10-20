import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Demo Tenant first
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  let tenant = await prisma.user.findUnique({
    where: { email: 'tenant@demo.com' },
  });

  if (!tenant) {
    tenant = await prisma.user.create({
      data: {
        email: 'tenant@demo.com',
        password: hashedPassword,
        name: 'Demo Tenant',
        phone: '081234567890',
        role: 'TENANT',
        isVerified: true,
      },
    });
    console.log(`✅ Created demo tenant: ${tenant.email}`);
  } else {
    console.log(`ℹ️  Tenant already exists: ${tenant.email}`);
  }

  // 2. Create Demo User
  let user = await prisma.user.findUnique({
    where: { email: 'user@demo.com' },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'user@demo.com',
        password: hashedPassword,
        name: 'Demo User',
        phone: '081234567891',
        role: 'USER',
        isVerified: true,
      },
    });
    console.log(`✅ Created demo user: ${user.email}`);
  } else {
    console.log(`ℹ️  User already exists: ${user.email}`);
  }

  // 3. Create Categories for the tenant
  const categoryData = [
    { name: 'Villa', description: 'Luxury villa rentals' },
    { name: 'Apartemen', description: 'Modern apartments' },
    { name: 'Hotel', description: 'Hotel rooms' },
    { name: 'Rumah', description: 'House rentals' },
  ];

  const categories = [];
  for (const cat of categoryData) {
    let category = await prisma.category.findFirst({
      where: { name: cat.name, tenantId: tenant.id },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: cat.name,
          description: cat.description,
          tenantId: tenant.id,
        },
      });
      console.log(`✅ Created category: ${category.name}`);
    } else {
      console.log(`ℹ️  Category already exists: ${category.name}`);
    }
    categories.push(category);
  }

  // 4. Create Sample Properties
  const villaCategory = categories.find((c) => c.name === 'Villa');
  const apartmentCategory = categories.find((c) => c.name === 'Apartemen');

  if (villaCategory) {
    let property1 = await prisma.property.findUnique({
      where: { id: 'sample-villa-1' },
    });

    if (!property1) {
      property1 = await prisma.property.create({
        data: {
          id: 'sample-villa-1',
          name: 'Beautiful Villa Bali',
          description: 'Luxury 3-bedroom villa with private pool overlooking rice fields. Perfect for family vacation.',
          address: 'Jl. Raya Ubud No. 123',
          city: 'Ubud',
          province: 'Bali',
          latitude: -8.5069,
          longitude: 115.2625,
          images: [
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
          ],
          categoryId: villaCategory.id,
          tenantId: tenant.id,
        },
      });

      // Add rooms to villa
      await prisma.room.createMany({
        data: [
          {
            propertyId: property1.id,
            name: 'Master Bedroom',
            description: 'Spacious master bedroom with king size bed, private bathroom, and balcony with rice field view.',
            basePrice: 1500000,
            capacity: 2,
            images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800'],
          },
          {
            propertyId: property1.id,
            name: 'Guest Bedroom',
            description: 'Comfortable guest bedroom with queen size bed and garden view.',
            basePrice: 1000000,
            capacity: 2,
            images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'],
          },
        ],
        skipDuplicates: true,
      });

      console.log(`✅ Created property: ${property1.name}`);
    } else {
      console.log(`ℹ️  Property already exists: ${property1.name}`);
    }
  }

  if (apartmentCategory) {
    let property2 = await prisma.property.findUnique({
      where: { id: 'sample-apartment-1' },
    });

    if (!property2) {
      property2 = await prisma.property.create({
        data: {
          id: 'sample-apartment-1',
          name: 'Modern Apartment Jakarta',
          description: 'Cozy 2-bedroom apartment in the heart of Jakarta with city view. Close to shopping malls and public transportation.',
          address: 'Jl. Sudirman No. 45',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          latitude: -6.2088,
          longitude: 106.8456,
          images: [
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
          ],
          categoryId: apartmentCategory.id,
          tenantId: tenant.id,
        },
      });

      // Add rooms to apartment
      await prisma.room.createMany({
        data: [
          {
            propertyId: property2.id,
            name: 'Studio Room',
            description: 'Cozy studio apartment with kitchenette and city view. Perfect for solo travelers or couples.',
            basePrice: 500000,
            capacity: 2,
            images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'],
          },
          {
            propertyId: property2.id,
            name: '1 Bedroom',
            description: 'One bedroom apartment with separate living room, full kitchen, and modern amenities.',
            basePrice: 750000,
            capacity: 3,
            images: ['https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800'],
          },
        ],
        skipDuplicates: true,
      });

      console.log(`✅ Created property: ${property2.name}`);
    } else {
      console.log(`ℹ️  Property already exists: ${property2.name}`);
    }
  }

  console.log('');
  console.log('🎉 Database seed completed!');
  console.log('');
  console.log('📝 Demo Accounts:');
  console.log('   Tenant: tenant@demo.com / password123');
  console.log('   User: user@demo.com / password123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
