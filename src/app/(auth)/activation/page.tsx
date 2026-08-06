'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { activateCode } from './actions';
import { ROUTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Key, AlertCircle, CheckCircle2 } from 'lucide-react';

const initialState: { error?: string; success?: boolean; message?: string } = {
  error: undefined,
  success: false,
  message: undefined,
};

export default function ActivationPage() {
  const [state, formAction, isPending] = useActionState(activateCode, initialState);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        router.push(ROUTES.accueil);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state?.success, router]);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-navy-900">Code d'activation</h1>
        <p className="text-sm text-navy-600 mt-2">
          Entrez votre code d'activation pour accéder à vos cours
        </p>
      </div>

      {state?.error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      {state?.success && (
        <div className="p-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      <form action={formAction} className="flex flex-col gap-4">
        <div className="space-y-1">
          <label htmlFor="code" className="text-sm font-medium text-navy-900 block">
            Code d'accès
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
            <Input 
              id="code" 
              name="code" 
              type="text" 
              placeholder="XXXX-XXXX-XXXX"
              required 
              className="pl-10 w-full font-mono text-center tracking-wider uppercase text-lg h-12"
              disabled={state?.success || isPending}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gold-500 hover:bg-gold-600 text-white mt-2 h-12 text-base font-medium" 
          disabled={isPending || state?.success}
        >
          {isPending ? 'Vérification...' : 'Activer mon accès'}
        </Button>
      </form>

      <div className="text-center text-sm">
        <Link href={ROUTES.connexion} className="text-navy-500 hover:text-navy-700 transition-colors">
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
