'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { ProfileHeader } from '@/components/Profile/ProfileHeader';
import { ProfileInfoForm } from '@/components/Profile/ProfileInfoForm';
import { PasswordChangeForm } from '@/components/Profile/PasswordChangeForm';

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login-user');
    } else if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();

      if (response.ok) {
        setName(data.data.name || '');
        setEmail(data.data.email || '');
        setPhone(data.data.phone || '');
        setAvatar(data.data.profilePicture || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast({ title: 'Error', description: 'Ukuran file maksimal 1MB', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setAvatar(base64);

      try {
        const response = await fetch('/api/user/profile/avatar', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: base64 }),
        });

        if (response.ok) {
          toast({ title: 'Berhasil', description: 'Avatar berhasil diupdate' });
          await update();
        }
      } catch (error) {
        toast({ title: 'Error', description: 'Gagal mengupdate avatar', variant: 'destructive' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async () => {
    if (!name || !phone) {
      toast({ title: 'Error', description: 'Semua field harus diisi', variant: 'destructive' });
      return;
    }

    setIsLoadingProfile(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengupdate profil');
      }

      toast({ title: 'Berhasil', description: 'Profil berhasil diupdate' });
      await update();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: 'Error', description: 'Semua field harus diisi', variant: 'destructive' });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'Password baru tidak cocok', variant: 'destructive' });
      return;
    }

    if (newPassword.length < 8) {
      toast({ title: 'Error', description: 'Password minimal 8 karakter', variant: 'destructive' });
      return;
    }

    setIsLoadingPassword(true);

    try {
      const response = await fetch('/api/user/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengubah password');
      }

      toast({ title: 'Berhasil', description: 'Password berhasil diubah' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoadingPassword(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <ProfileHeader name={name} email={email} avatar={avatar} onAvatarChange={handleAvatarChange} />

        <Tabs defaultValue="profile" className="max-w-2xl">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileInfoForm
              name={name}
              email={email}
              phone={phone}
              isLoading={isLoadingProfile}
              onNameChange={setName}
              onPhoneChange={setPhone}
              onSubmit={handleUpdateProfile}
            />
          </TabsContent>

          <TabsContent value="password">
            <PasswordChangeForm
              currentPassword={currentPassword}
              newPassword={newPassword}
              confirmPassword={confirmPassword}
              isLoading={isLoadingPassword}
              onCurrentPasswordChange={setCurrentPassword}
              onNewPasswordChange={setNewPassword}
              onConfirmPasswordChange={setConfirmPassword}
              onSubmit={handleChangePassword}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
