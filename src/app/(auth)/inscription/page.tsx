'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { register } from './actions';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Lock, AlertCircle } from 'lucide-react';

const initialState = {
  error: '',
};

export default function InscriptionPage() {
  const [state, formAction, isPending] = useActionState(register, initialState);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-navy-900">Créer un compte</h1>
        <p className="text-sm text-navy-600 mt-1">Rejoignez l'excellence académique</p>
      </div>

      {state?.error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-4">
        <div className="space-y-1">
          <label htmlFor="fullName" className="text-sm font-medium text-navy-900 block">
            Nom complet
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
            <Input 
              id="fullName" 
              name="fullName" 
              type="text" 
              placeholder="Jean Dupont"
              required 
              className="pl-10 w-full"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-navy-900 block">
            Adresse email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="etudiant@exemple.fr"
              required 
              className="pl-10 w-full"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-navy-900 block">
            Mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
            <Input 
              id="password" 
              name="password" 
              type="password" 
              placeholder="••••••••"
              required 
              minLength={8}
              className="pl-10 w-full"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-navy-900 block">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
            <Input 
              id="confirmPassword" 
              name="confirmPassword" 
              type="password" 
              placeholder="••••••••"
              required 
              minLength={8}
              className="pl-10 w-full"
            />
          </div>
        </div>

        <Button type="submit" className="w-full bg-navy-900 hover:bg-navy-800 text-white mt-2" disabled={isPending}>
          {isPending ? 'Création...' : 'Créer un compte'}
        </Button>
      </form>

      <div className="text-center text-sm">
        <span className="text-navy-600">Déjà un compte ?</span>{' '}
        <Link href={ROUTES.connexion} className="text-gold-600 font-medium hover:text-gold-700 transition-colors">
          Se connecter
        </Link>
      </div>
    </div>
  );
}
