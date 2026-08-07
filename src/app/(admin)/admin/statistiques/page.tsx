import React from 'react';
import { BarChart3, Users, BookOpen, KeyRound } from 'lucide-react';
import { Card } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';

export default async function StatistiquesManager() {
  const supabase = await createClient();

  // Fetch counts
  const { count: studentsCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: codesCount } = await supabase.from('activation_codes').select('*', { count: 'exact', head: true });
  const { count: contentsCount } = await supabase.from('contents').select('*', { count: 'exact', head: true });
  const { count: packsCount } = await supabase.from('packages').select('*', { count: 'exact', head: true });

  const stats = [
    { label: 'Total Étudiants', value: studentsCount || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Codes d\'Activation', value: codesCount || 0, icon: KeyRound, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Contenus Créés', value: contentsCount || 0, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Packs Premium', value: packsCount || 0, icon: BarChart3, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Statistiques Globales</h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble de l'activité sur la plateforme.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-navy-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-12 text-center text-gray-500 mt-8">
        <BarChart3 className="w-12 h-12 text-gray-300 mb-4 mx-auto" />
        <h2 className="text-xl font-bold text-navy-900 mb-2">Analytique Détaillée</h2>
        <p className="max-w-md mx-auto">
          Les graphiques d'engagement et de rétention seront disponibles dans une prochaine mise à jour de la plateforme.
        </p>
      </Card>
    </div>
  );
}
