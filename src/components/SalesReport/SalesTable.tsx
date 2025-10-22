'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils/formatDate';
import { formatPrice } from '@/lib/utils/formatPrice';

interface SalesTableProps {
  groupBy: string;
  groupedData: any[];
  filteredSalesCount: number;
}

export function SalesTable({ groupBy, groupedData, filteredSalesCount }: SalesTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {groupBy === 'transaction' && 'Detail Transaksi'}
          {groupBy === 'property' && 'Laporan Per Properti'}
          {groupBy === 'user' && 'Laporan Per Pelanggan'}
        </CardTitle>
        <CardDescription>
          {filteredSalesCount} {groupBy === 'transaction' ? 'transaksi' : 'data'} ditemukan
        </CardDescription>
      </CardHeader>
      <CardContent>
        {groupedData.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            Tidak ada data untuk ditampilkan
          </div>
        ) : (
          <div className="overflow-x-auto">
            {groupBy === 'transaction' ? (
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-slate-600 dark:text-slate-400">
                    <th className="pb-3 font-semibold">ID</th>
                    <th className="pb-3 font-semibold">Tanggal</th>
                    <th className="pb-3 font-semibold">Pelanggan</th>
                    <th className="pb-3 font-semibold">Properti</th>
                    <th className="pb-3 font-semibold">Kamar</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedData.map((item: any) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-3 text-sm">#{item.id.slice(0, 8)}</td>
                      <td className="py-3 text-sm">{formatDate(item.date)}</td>
                      <td className="py-3 text-sm">{item.user}</td>
                      <td className="py-3 text-sm">{item.property}</td>
                      <td className="py-3 text-sm">{item.room}</td>
                      <td className="py-3 text-sm font-semibold">{formatPrice(item.revenue)}</td>
                      <td className="py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.status === 'COMPLETED' || item.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-slate-600 dark:text-slate-400">
                    <th className="pb-3 font-semibold">
                      {groupBy === 'property' ? 'Nama Properti' : 'Nama Pelanggan'}
                    </th>
                    <th className="pb-3 font-semibold">Jumlah Pesanan</th>
                    <th className="pb-3 font-semibold">Total Pendapatan</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedData.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-3 text-sm">{item.label}</td>
                      <td className="py-3 text-sm">{item.count}</td>
                      <td className="py-3 text-sm font-semibold">{formatPrice(item.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
