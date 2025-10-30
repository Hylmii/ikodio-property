interface SalesData {
  id: string;
  bookingDate: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: string;
  user: { name: string; email: string };
  room: {
    name: string;
    property: { id: string; name: string };
  };
}

export function applyFilters(
  sales: SalesData[],
  selectedProperty: string,
  startDate: string,
  endDate: string,
  sortBy: string
): SalesData[] {
  let filtered = [...sales];

  if (selectedProperty !== 'all') {
    filtered = filtered.filter(sale => sale.room.property.id === selectedProperty);
  }

  if (startDate) {
    filtered = filtered.filter(sale => new Date(sale.bookingDate) >= new Date(startDate));
  }

  if (endDate) {
    filtered = filtered.filter(sale => new Date(sale.bookingDate) <= new Date(endDate));
  }

  if (sortBy === 'date') {
    filtered.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
  } else {
    filtered.sort((a, b) => b.totalPrice - a.totalPrice);
  }

  return filtered;
}

export function calculateSummary(data: SalesData[]) {
  const totalRevenue = data.reduce((sum, sale) => {
    if (isConfirmed(sale.status)) return sum + sale.totalPrice;
    return sum;
  }, 0);

  const totalBookings = data.length;
  const confirmedBookings = data.filter(sale => isConfirmed(sale.status)).length;
  const averageBookingValue = confirmedBookings > 0 ? totalRevenue / confirmedBookings : 0;

  return { totalRevenue, totalBookings, averageBookingValue, confirmedBookings };
}

function isConfirmed(status: string): boolean {
  return status === 'CONFIRMED' || status === 'COMPLETED';
}

export function groupData(
  filteredSales: SalesData[],
  groupBy: string
) {
  if (groupBy === 'property') {
    return groupByProperty(filteredSales);
  } else if (groupBy === 'user') {
    return groupByUser(filteredSales);
  } else {
    return groupByTransaction(filteredSales);
  }
}

function groupByProperty(sales: SalesData[]) {
  const grouped = sales.reduce((acc, sale) => {
    const propertyId = sale.room.property.id;
    if (!acc[propertyId]) {
      acc[propertyId] = { name: sale.room.property.name, totalRevenue: 0, count: 0 };
    }
    if (isConfirmed(sale.status)) {
      acc[propertyId].totalRevenue += sale.totalPrice;
    }
    acc[propertyId].count += 1;
    return acc;
  }, {} as Record<string, { name: string; totalRevenue: number; count: number }>);

  return Object.entries(grouped).map(([id, data]) => ({
    id,
    label: data.name,
    revenue: data.totalRevenue,
    count: data.count,
  }));
}

function groupByUser(sales: SalesData[]) {
  const grouped = sales.reduce((acc, sale) => {
    const userEmail = sale.user.email;
    if (!acc[userEmail]) {
      acc[userEmail] = { name: sale.user.name, totalRevenue: 0, count: 0 };
    }
    if (isConfirmed(sale.status)) {
      acc[userEmail].totalRevenue += sale.totalPrice;
    }
    acc[userEmail].count += 1;
    return acc;
  }, {} as Record<string, { name: string; totalRevenue: number; count: number }>);

  return Object.entries(grouped).map(([email, data]) => ({
    id: email,
    label: data.name,
    revenue: data.totalRevenue,
    count: data.count,
  }));
}

function groupByTransaction(sales: SalesData[]) {
  return sales.map(sale => ({
    id: sale.id,
    label: `#${sale.id.slice(0, 8)}`,
    revenue: isConfirmed(sale.status) ? sale.totalPrice : 0,
    count: 1,
    date: sale.bookingDate,
    user: sale.user.name,
    property: sale.room.property.name,
    room: sale.room.name,
    status: sale.status,
  }));
}