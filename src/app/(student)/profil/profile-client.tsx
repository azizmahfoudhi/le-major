'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { updateProfile, updatePassword } from './actions';
import { Loader2 } from 'lucide-react';

interface ProfileClientProps {
  initialProfile: {
    first_name: string | null;
    last_name: string | null;
    phone_number: string | null;
  };
}

export function ProfileInfoEditor({ initialProfile }: ProfileClientProps) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [firstName, setFirstName] = useState(initialProfile.first_name || '');
  const [lastName, setLastName] = useState(initialProfile.last_name || '');
  const [phoneNumber, setPhoneNumber] = useState(initialProfile.phone_number || '');

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateProfile({ first_name: firstName, last_name: lastName, phone_number: phoneNumber });
    setLoading(false);
    
    if (result.success) {
      setIsProfileModalOpen(false);
    } else {
      alert('Erreur: ' + result.error);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setIsProfileModalOpen(true)}>Modifier mes informations</Button>
      <Modal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="Modifier mes informations">
        <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
            <Input 
              required
              value={firstName} 
              onChange={e => setFirstName(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
            <Input 
              required
              value={lastName} 
              onChange={e => setLastName(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
            <Input 
              type="tel"
              value={phoneNumber} 
              onChange={e => setPhoneNumber(e.target.value)} 
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsProfileModalOpen(false)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Enregistrer
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function PasswordEditor() {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    
    setLoading(true);
    const result = await updatePassword(password);
    setLoading(false);
    
    if (result.success) {
      setIsPasswordModalOpen(false);
      setPassword('');
      setConfirmPassword('');
      alert('Mot de passe mis à jour avec succès.');
    } else {
      alert('Erreur: ' + result.error);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setIsPasswordModalOpen(true)}>Changer le mot de passe</Button>
      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="Changer le mot de passe">
        <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
            <Input 
              type="password"
              required
              minLength={8}
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
            <Input 
              type="password"
              required
              minLength={8}
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Mettre à jour
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
