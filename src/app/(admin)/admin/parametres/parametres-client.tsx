'use client';

import React, { useState, useTransition } from 'react';
import { Settings, User, Shield, Loader2, CheckCircle } from 'lucide-react';
import { Card, Button, Input } from '@/components/ui';

interface AdminProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  platformDescription: string;
}

interface ParametresClientProps {
  adminProfile: AdminProfile;
  platformSettings: PlatformSettings;
  updateProfile: (data: FormData) => Promise<{ success: boolean; error?: string }>;
  updatePlatform: (data: FormData) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (data: FormData) => Promise<{ success: boolean; error?: string }>;
}

export default function ParametresClient({
  adminProfile,
  platformSettings,
  updateProfile,
  updatePlatform,
  updatePassword,
}: ParametresClientProps) {
  const [isPending, startTransition] = useTransition();
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [platformMsg, setPlatformMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setProfileMsg(null);
    startTransition(async () => {
      const result = await updateProfile(new FormData(form));
      setProfileMsg(result.success
        ? { type: 'success', text: 'Profil mis à jour avec succès.' }
        : { type: 'error', text: result.error || 'Erreur.' });
    });
  };

  const handlePlatform = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setPlatformMsg(null);
    startTransition(async () => {
      const result = await updatePlatform(new FormData(form));
      setPlatformMsg(result.success
        ? { type: 'success', text: 'Paramètres sauvegardés.' }
        : { type: 'error', text: result.error || 'Erreur.' });
    });
  };

  const handlePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setPasswordMsg(null);
    const newPass = (form.querySelector('#new_password') as HTMLInputElement)?.value;
    const confirmPass = (form.querySelector('#confirm_password') as HTMLInputElement)?.value;
    if (newPass !== confirmPass) {
      setPasswordMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    startTransition(async () => {
      const result = await updatePassword(new FormData(form));
      setPasswordMsg(result.success
        ? { type: 'success', text: 'Mot de passe modifié avec succès.' }
        : { type: 'error', text: result.error || 'Erreur.' });
      if (result.success) form.reset();
    });
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 font-playfair">Paramètres</h1>
        <p className="text-gray-500 mt-1">Gérez votre compte et la configuration de la plateforme.</p>
      </div>

      {/* Profil Admin */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <User className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="font-semibold text-navy-900">Profil Administrateur</h2>
            <p className="text-xs text-gray-500">{adminProfile.email}</p>
          </div>
        </div>

        <form onSubmit={handleProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="first_name" className="text-sm font-medium text-gray-700">Prénom</label>
              <Input
                id="first_name"
                name="first_name"
                defaultValue={adminProfile.first_name || ''}
                placeholder="Votre prénom"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="last_name" className="text-sm font-medium text-gray-700">Nom</label>
              <Input
                id="last_name"
                name="last_name"
                defaultValue={adminProfile.last_name || ''}
                placeholder="Votre nom"
              />
            </div>
          </div>

          {profileMsg && (
            <div className={`flex items-center gap-2 text-sm p-3 rounded-md ${profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {profileMsg.type === 'success' && <CheckCircle className="w-4 h-4" />}
              {profileMsg.text}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enregistrement...</> : 'Sauvegarder'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Paramètres Plateforme */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Settings className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h2 className="font-semibold text-navy-900">Informations de la Plateforme</h2>
            <p className="text-xs text-gray-500">Nom, description et contact public</p>
          </div>
        </div>

        <form onSubmit={handlePlatform} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="platform_name" className="text-sm font-medium text-gray-700">Nom de la plateforme</label>
            <Input
              id="platform_name"
              name="platform_name"
              defaultValue={platformSettings.platformName}
              placeholder="ex: Le Major"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="support_email" className="text-sm font-medium text-gray-700">Email de support</label>
            <Input
              id="support_email"
              name="support_email"
              type="email"
              defaultValue={platformSettings.supportEmail}
              placeholder="support@exemple.com"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="platform_description" className="text-sm font-medium text-gray-700">Description (affichée sur la page d'accueil)</label>
            <textarea
              id="platform_description"
              name="platform_description"
              defaultValue={platformSettings.platformDescription}
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
              placeholder="Décrivez votre plateforme en quelques mots..."
            />
          </div>

          {platformMsg && (
            <div className={`flex items-center gap-2 text-sm p-3 rounded-md ${platformMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {platformMsg.type === 'success' && <CheckCircle className="w-4 h-4" />}
              {platformMsg.text}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enregistrement...</> : 'Sauvegarder'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Sécurité */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-rose-50 rounded-lg">
            <Shield className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <h2 className="font-semibold text-navy-900">Sécurité</h2>
            <p className="text-xs text-gray-500">Modifier votre mot de passe administrateur</p>
          </div>
        </div>

        <form onSubmit={handlePassword} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="new_password" className="text-sm font-medium text-gray-700">Nouveau mot de passe</label>
            <Input
              id="new_password"
              name="new_password"
              type="password"
              placeholder="Minimum 8 caractères"
              minLength={8}
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="confirm_password" className="text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              placeholder="Répétez le mot de passe"
              required
            />
          </div>

          {passwordMsg && (
            <div className={`flex items-center gap-2 text-sm p-3 rounded-md ${passwordMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {passwordMsg.type === 'success' && <CheckCircle className="w-4 h-4" />}
              {passwordMsg.text}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isPending} variant="outline">
              {isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Mise à jour...</> : 'Changer le mot de passe'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
