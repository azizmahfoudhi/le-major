import { Metadata } from 'next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Target, Activity, Award, Brain } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Progression | Le Major',
  description: 'Suivez vos performances et votre évolution',
};

export default async function ProgressPage() {
  // TODO: Fetch real progress data from Supabase

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-4xl text-navy-900">Progression</h1>
        <p className="text-gray-600">Analysez vos performances et ciblez vos révisions.</p>
      </div>

      {/* Global Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-card border border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Moyenne Générale</p>
                <p className="text-3xl font-display text-navy-900">14.5<span className="text-xl text-gray-400">/20</span></p>
              </div>
              <div className="p-3 bg-gold-500/10 text-gold-600 rounded-xl">
                <Target className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-card border border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Assiduité</p>
                <p className="text-3xl font-display text-navy-900">85%</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-card border border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Excellence</p>
                <p className="text-3xl font-display text-navy-900">Top 15%</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl">
                <Award className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-card border border-gray-100 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Sujets Maîtrisés</p>
                <p className="text-3xl font-display text-navy-900">12</p>
              </div>
              <div className="p-3 bg-purple-50 text-purple-500 rounded-xl">
                <Brain className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress per subject */}
      <section>
        <h2 className="text-xl font-semibold text-navy-900 mb-4">Progression par matière</h2>
        <Card className="rounded-card border border-gray-100 shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {/* Mathématiques */}
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-navy-900">Mathématiques Appliquées</h3>
                    <p className="text-sm text-gray-500">3/12 chapitres complétés</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium text-navy-900">30%</p>
                  </div>
                </div>
                <ProgressBar value={30} className="h-2 bg-gray-100" indicatorClassName="bg-blue-500" />
              </div>
              {/* Économie */}
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-navy-900">Microéconomie</h3>
                    <p className="text-sm text-gray-500">5/8 chapitres complétés</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium text-navy-900">65%</p>
                  </div>
                </div>
                <ProgressBar value={65} className="h-2 bg-gray-100" indicatorClassName="bg-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-card border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-emerald-700">Points forts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center justify-between">
                <span className="text-gray-700">Théorie du consommateur</span>
                <span className="text-emerald-600 font-medium">Excellent</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-gray-700">Calcul différentiel</span>
                <span className="text-emerald-600 font-medium">Très bien</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="rounded-card border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-rose-700">À consolider</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center justify-between">
                <span className="text-gray-700">Algèbre linéaire</span>
                <span className="text-rose-600 font-medium">À revoir</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-gray-700">Droit des obligations</span>
                <span className="text-rose-600 font-medium">En cours</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
