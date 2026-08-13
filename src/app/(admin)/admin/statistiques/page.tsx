import React from 'react';
import { BarChart3, Users, BookOpen, KeyRound, PenTool, ClipboardList, Package, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui';
import { createClient } from '@/lib/supabase/server';

export default async function StatistiquesManager() {
  const supabase = await createClient();

  // --- Counts ---
  const [
    { count: studentsCount },
    { count: codesTotal },
    { count: codesUsed },
    { count: codesAvailable },
    { count: contentsCount },
    { count: exercicesCount },
    { count: examensCount },
    { count: packsCount },
    { count: activeActivationsCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('activation_codes').select('*', { count: 'exact', head: true }),
    supabase.from('activation_codes').select('*', { count: 'exact', head: true }).eq('status', 'activated'),
    supabase.from('activation_codes').select('*', { count: 'exact', head: true }).eq('status', 'available'),
    supabase.from('contents').select('*', { count: 'exact', head: true }),
    supabase.from('exercises').select('*', { count: 'exact', head: true }),
    supabase.from('exams').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('packages').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('student_activations').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ]);

  // --- Per-subject content breakdown ---
  const { data: subjects } = await supabase
    .from('subjects')
    .select(`
      id,
      name,
      chapters (
        id,
        contents ( id ),
        exercises: exercises ( id )
      )
    `)
    .order('name', { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subjectStats = (subjects || []).map((s: any) => {
    const chapters = s.chapters || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalContents = chapters.reduce((acc: number, ch: any) => acc + (ch.contents?.length || 0), 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalExercises = chapters.reduce((acc: number, ch: any) => acc + (ch.exercises?.length || 0), 0);
    return {
      name: s.name,
      chapters: chapters.length,
      contents: totalContents,
      exercises: totalExercises,
    };
  });

  // --- Recent activations ---
  const { data: recentActivations } = await supabase
    .from('student_activations')
    .select(`
      id,
      start_date,
      end_date,
      is_active,
      profiles ( first_name, last_name ),
      packages ( name )
    `)
    .order('start_date', { ascending: false })
    .limit(5);

  const topStats = [
    { label: 'Étudiants Inscrits', value: studentsCount || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Accès Actifs', value: activeActivationsCount || 0, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Contenus Publiés', value: contentsCount || 0, icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Packs Actifs', value: packsCount || 0, icon: Package, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Exercices', value: exercicesCount || 0, icon: PenTool, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'Examens Publiés', value: examensCount || 0, icon: ClipboardList, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ];

  const codeUsagePercent = codesTotal ? Math.round(((codesUsed || 0) / codesTotal) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 font-playfair">Statistiques Globales</h1>
        <p className="text-gray-500 mt-1">Vue d'ensemble de l'activité sur la plateforme.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {topStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="p-5">
              <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-3`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-navy-900">{stat.value}</p>
              <p className="text-xs font-medium text-gray-500 mt-1">{stat.label}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Codes d'activation usage */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <KeyRound className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <h2 className="font-semibold text-navy-900">Codes d'Activation</h2>
              <p className="text-xs text-gray-500">{codesTotal || 0} codes générés au total</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Taux d'utilisation</span>
              <span className="font-semibold text-navy-900">{codeUsagePercent}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-emerald-500 h-3 rounded-full transition-all"
                style={{ width: `${codeUsagePercent}%` }}
              />
            </div>
            <div className="flex justify-between text-sm pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-gray-700"><strong>{codesUsed || 0}</strong> activés</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-gray-700"><strong>{codesAvailable || 0}</strong> disponibles</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent activations */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h2 className="font-semibold text-navy-900">Derniers Accès Attribués</h2>
              <p className="text-xs text-gray-500">5 activations les plus récentes</p>
            </div>
          </div>

          {recentActivations && recentActivations.length > 0 ? (
            <div className="space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {recentActivations.map((act: any) => (
                <div key={act.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-navy-900">
                      {act.profiles?.first_name || ''} {act.profiles?.last_name || ''}
                    </p>
                    <p className="text-xs text-gray-500">{act.packages?.name || 'Pack inconnu'}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${act.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                      {act.is_active ? 'Actif' : 'Expiré'}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{new Date(act.start_date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Aucune activation récente.</p>
          )}
        </Card>
      </div>

      {/* Per-subject breakdown */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-purple-50 rounded-lg">
            <BarChart3 className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h2 className="font-semibold text-navy-900">Contenu par Matière</h2>
            <p className="text-xs text-gray-500">Répartition des chapitres, résumés et exercices</p>
          </div>
        </div>

        {subjectStats.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">Matière</th>
                  <th className="pb-3 font-medium text-center">Chapitres</th>
                  <th className="pb-3 font-medium text-center">Contenus</th>
                  <th className="pb-3 font-medium text-center">Exercices</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subjectStats.map((s, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-navy-900">{s.name}</td>
                    <td className="py-3 text-center text-gray-600">{s.chapters}</td>
                    <td className="py-3 text-center text-gray-600">{s.contents}</td>
                    <td className="py-3 text-center text-gray-600">{s.exercises}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic text-center py-8">Aucune matière créée pour le moment.</p>
        )}
      </Card>
    </div>
  );
}
