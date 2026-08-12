import { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, CreditCard, LogOut, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { signOut } from '@/app/(auth)/signout/actions';
import { ProfileInfoEditor, PasswordEditor } from './profile-client';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mon Profil | Le Major',
  description: 'Gérez vos informations personnelles',
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, phone_number')
    .eq('id', user?.id)
    .single();

  const { data: activations } = await supabase
    .from('student_activations')
    .select(`
      end_date,
      packages ( name )
    `)
    .eq('student_id', user.id)
    .eq('is_active', true)
    .gt('end_date', new Date().toISOString());

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name ?? ''}`.trim()
    : user?.email ?? 'Étudiant';

  const email = profile?.email ?? user?.email ?? '';

  return (
    <div className="space-y-8 pb-12 max-w-3xl">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-4xl text-navy-900">Mon Profil</h1>
        <p className="text-gray-600">Gérez vos informations personnelles et votre abonnement.</p>
      </div>

      {/* Informations personnelles */}
      <Card className="rounded-card border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-navy-900 flex items-center gap-2">
            <User className="w-5 h-5 text-gold-600" />
            Informations personnelles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Nom complet</label>
            <p className="text-navy-900 font-medium mt-1">{displayName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Adresse email</label>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4 text-gray-400" />
              <p className="text-navy-900 font-medium">{email}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t border-gray-100 flex justify-end">
          <ProfileInfoEditor initialProfile={{
            first_name: profile?.first_name || null,
            last_name: profile?.last_name || null,
            phone_number: profile?.phone_number || null,
          }} />
        </CardFooter>
      </Card>

      {/* Abonnement */}
      <Card className="rounded-card border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-navy-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gold-600" />
            Mon Abonnement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {activations && activations.length > 0 ? (
            activations.map((activation, idx) => (
              <div key={idx} className="p-4 border border-gold-500/20 bg-gold-500/5 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-medium text-navy-900 text-lg">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(activation.packages as any)?.name || 'Accès Premium'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Expire le {new Date(activation.end_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <span className="px-3 py-1 bg-gold-500 text-white text-sm font-medium rounded-full">
                  Actif
                </span>
              </div>
            ))
          ) : (
            <div className="p-4 border border-gray-200 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600 mb-4">Vous n'avez aucun abonnement actif pour le moment.</p>
              <Link href="/activation">
                <Button>Activer un code</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sécurité */}
      <Card className="rounded-card border border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-medium text-navy-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gold-600" />
            Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Protégez votre compte en utilisant un mot de passe sécurisé.
          </p>
          <PasswordEditor />
        </CardContent>
      </Card>

      {/* Déconnexion */}
      <div className="pt-4 border-t border-gray-100">
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-medium"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Se déconnecter
          </Button>
        </form>
      </div>
    </div>
  );
}
