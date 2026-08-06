import { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, CreditCard, LogOut, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Mon Profil | Le Major',
  description: 'Gérez vos informations personnelles',
};

export default async function ProfilePage() {
  // TODO: Fetch actual user from Supabase auth
  const user = {
    firstName: 'Alexandre',
    lastName: 'Dupont',
    email: 'alexandre.dupont@example.com',
    plan: 'Premium Annuel',
    expiryDate: '15 Septembre 2027',
  };

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Prénom</label>
              <p className="text-navy-900 font-medium mt-1">{user.firstName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Nom</label>
              <p className="text-navy-900 font-medium mt-1">{user.lastName}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Adresse email</label>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4 text-gray-400" />
              <p className="text-navy-900 font-medium">{user.email}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t border-gray-100 flex justify-end">
          <Button variant="outline">Modifier mes informations</Button>
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
        <CardContent>
          <div className="p-4 border border-gold-500/20 bg-gold-500/5 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-medium text-navy-900 text-lg">{user.plan}</h3>
              <p className="text-sm text-gray-600 mt-1">Valide jusqu'au {user.expiryDate}</p>
            </div>
            <span className="px-3 py-1 bg-gold-500 text-white text-sm font-medium rounded-full">
              Actif
            </span>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          <Button variant="outline">Gérer l'abonnement</Button>
        </CardFooter>
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
          <Button variant="outline">Changer le mot de passe</Button>
        </CardContent>
      </Card>

      {/* Déconnexion */}
      <div className="pt-4">
        <Button variant="ghost" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50">
          <LogOut className="w-4 h-4 mr-2" />
          Se déconnecter
        </Button>
      </div>
    </div>
  );
}
