import { prisma } from './src/lib/prisma';

async function testPropertyAPI() {
  console.log('🔍 Testing property API...\n');

  try {
    // Get all properties first
    const properties = await prisma.property.findMany({
      take: 5,
      select: {
        id: true,
        name: true,
      },
    });

    console.log(`Found ${properties.length} properties:\n`);
    properties.forEach((p, i) => {
      console.log(`${i + 1}. ID: ${p.id}`);
      console.log(`   Name: ${p.name}\n`);
    });

    if (properties.length > 0) {
      const firstProperty = properties[0];
      console.log(`\n📋 Testing detail fetch for: ${firstProperty.id}\n`);

      // Try to fetch like the API does
      const property = await prisma.property.findUnique({
        where: { id: firstProperty.id },
        include: {
          category: true,
          tenant: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          rooms: {
            include: {
              peakSeasonRates: {
                where: {
                  endDate: {
                    gte: new Date(),
                  },
                },
              },
            },
          },
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true,
                },
              },
              reply: {
                include: {
                  tenant: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 10,
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      });

      if (!property) {
        console.log('❌ Property not found!');
        return;
      }

      console.log('✅ Property fetched successfully!');
      console.log(`Name: ${property.name}`);
      console.log(`Category: ${property.category?.name || 'N/A'}`);
      console.log(`Rooms: ${property.rooms?.length || 0}`);
      console.log(`Reviews: ${property._count.reviews}`);
      console.log(`Images: ${property.images?.length || 0}`);

      const avgRating = await prisma.review.aggregate({
        where: { propertyId: firstProperty.id },
        _avg: {
          rating: true,
        },
      });

      console.log(`Average Rating: ${avgRating._avg.rating || 0}`);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPropertyAPI();
