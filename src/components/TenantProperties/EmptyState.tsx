import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Plus className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Belum Ada Properti</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4 text-center">
          Mulai dengan menambahkan properti pertama Anda
        </p>
        <Button asChild>
          <Link href="/tenant/properties/create">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Properti
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
