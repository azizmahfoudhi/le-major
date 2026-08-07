import React from 'react';
import { Settings, Shield, Bell, CreditCard } from 'lucide-react';
import { Card, Button } from '@/components/ui';

export default function ParametresManager() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 font-playfair">Paramètres Système</h1>
        <p className="text-gray-500 mt-1">Gérez la configuration globale de la plateforme.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-navy-900 mb-1">Sécurité & Authentification</h3>
              <p className="text-sm text-gray-500 mb-4">Configuration des politiques de mot de passe et de sécurité globale.</p>
              <Button variant="outline" size="sm">Configurer</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-navy-900 mb-1">Passerelle de Paiement</h3>
              <p className="text-sm text-gray-500 mb-4">Intégration Stripe / Konnect pour les packs premium.</p>
              <Button variant="outline" size="sm">Configurer</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <Bell className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-navy-900 mb-1">Notifications Email</h3>
              <p className="text-sm text-gray-500 mb-4">Modèles d'emails transactionnels (bienvenue, activation).</p>
              <Button variant="outline" size="sm">Configurer</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gray-50 text-gray-600 rounded-xl">
              <Settings className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-navy-900 mb-1">Préférences Générales</h3>
              <p className="text-sm text-gray-500 mb-4">Nom de l'application, logos, et informations légales.</p>
              <Button variant="outline" size="sm">Configurer</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
