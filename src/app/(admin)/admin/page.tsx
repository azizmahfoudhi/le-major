import React from 'react';
import { Users, Key, FileText, Brain, ArrowUpRight, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | Le Major',
};

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/connexion');
  }

  // Ensure user is admin
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') {
    redirect('/accueil');
  }

  // Fetch counts
  const { count: studentCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'student');

  const { count: activatedCodesCount } = await supabase
    .from('activation_codes')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'activated');

  const { count: publishedContentsCount } = await supabase
    .from('contents')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  const { count: exercisesCount } = await supabase
    .from('exercises')
    .select('*', { count: 'exact', head: true });

  const stats = [
    { label: 'Total étudiants', value: studentCount || 0, icon: Users, trend: 'Actif', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Codes activés', value: activatedCodesCount || 0, icon: Key, trend: 'Total', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Contenus publiés', value: publishedContentsCount || 0, icon: FileText, trend: 'En ligne', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Exercices', value: exercisesCount || 0, icon: Brain, trend: 'Base', color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  // Fetch recent exam attempts for activity
  const { data: recentAttempts } = await supabase
    .from('exam_attempts')
    .select(`
      id,
      started_at,
      status,
      profiles (first_name, last_name),
      exams (title)
    `)
    .order('started_at', { ascending: false })
    .limit(5);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activities = (recentAttempts || []).map((attempt: any) => ({
    id: attempt.id,
    user: `${attempt.profiles?.first_name || 'Étudiant'} ${attempt.profiles?.last_name || ''}`,
    action: attempt.status === 'completed' ? `a terminé l'examen ${attempt.exams?.title}` : `a commencé l'examen ${attempt.exams?.title}`,
    time: new Date(attempt.started_at).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
  }));

  if (activities.length === 0) {
    activities.push({
      id: 'mock',
      user: 'Système',
      action: 'Aucune activité récente',
      time: '-',
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 font-playfair">Tableau de Bord</h1>
        <p className="text-gray-500 mt-1">Bienvenue dans l'espace d'administration Le Major.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-4 flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-navy-900">{stat.value}</p>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                  {stat.trend}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-lg font-bold text-navy-900 mb-4">Activité des utilisateurs (Aperçu)</h2>
          <div className="h-64 flex items-end space-x-2">
            {/* Mock chart since we don't have historical daily data easily aggregatable yet */}
            {[40, 70, 45, 90, 65, 80, 100].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group">
                <div 
                  className="w-full bg-navy-100 group-hover:bg-gold-400 transition-colors rounded-t-sm" 
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-400 mt-2">Jour {i+1}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-navy-900 mb-4">Activité récente</h2>
          <div className="space-y-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {activities.map((activity: any) => (
              <div key={activity.id} className="flex space-x-3">
                <div className="mt-0.5">
                  <Clock className="h-4 w-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-medium text-navy-900">{activity.user}</span>{' '}
                    <span className="text-gray-600">{activity.action}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
