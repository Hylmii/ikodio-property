'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2 } from 'lucide-react';
import { CategoryCard } from '@/components/TenantCategories/CategoryCard';
import { CategoryDialog } from '@/components/TenantCategories/CategoryDialog';
import { DeleteDialog } from '@/components/TenantCategories/DeleteDialog';

interface Category {
  id: string;
  name: string;
  _count: {
    properties: number;
  };
}

export default function TenantCategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login-tenant');
    } else if (status === 'authenticated') {
      if (session.user.role !== 'TENANT') {
        router.push('/');
      } else {
        fetchCategories();
      }
    }
  }, [status]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (response.ok) setCategories(data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menyimpan kategori');
      }

      toast({
        title: 'Berhasil',
        description: editingCategory ? 'Kategori berhasil diupdate' : 'Kategori berhasil ditambahkan',
      });

      setIsDialogOpen(false);
      setCategoryName('');
      setEditingCategory(null);
      fetchCategories();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/categories/${deletingId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghapus kategori');
      }

      toast({ title: 'Berhasil', description: 'Kategori berhasil dihapus' });
      setIsDeleteDialogOpen(false);
      setDeletingId('');
      fetchCategories();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Kategori Properti</h1>
          <Button onClick={() => { setEditingCategory(null); setCategoryName(''); setIsDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kategori
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <CategoryDialog
          open={isDialogOpen}
          isEdit={!!editingCategory}
          categoryName={categoryName}
          isSubmitting={isSubmitting}
          onClose={() => { setIsDialogOpen(false); setCategoryName(''); setEditingCategory(null); }}
          onNameChange={setCategoryName}
          onSubmit={handleSubmit}
        />

        <DeleteDialog
          open={isDeleteDialogOpen}
          isDeleting={isDeleting}
          onClose={() => { setIsDeleteDialogOpen(false); setDeletingId(''); }}
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  );
}
