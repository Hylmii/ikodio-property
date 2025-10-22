import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export function EmptyReviews() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <MessageSquare className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Belum Ada Review</h3>
        <p className="text-slate-600 dark:text-slate-400 text-center">
          Properti ini belum memiliki review dari pelanggan
        </p>
      </CardContent>
    </Card>
  );
}
