import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface CategoryDialogProps {
  open: boolean;
  isEdit: boolean;
  categoryName: string;
  isSubmitting: boolean;
  onClose: () => void;
  onNameChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CategoryDialog({
  open,
  isEdit,
  categoryName,
  isSubmitting,
  onClose,
  onNameChange,
  onSubmit,
}: CategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit' : 'Tambah'} Kategori</DialogTitle>
            <DialogDescription>
              {isEdit ? 'Update' : 'Buat'} kategori properti baru
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Kategori</Label>
              <Input
                id="name"
                placeholder="Contoh: Villa"
                value={categoryName}
                onChange={(e) => onNameChange(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Update' : 'Tambah'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
