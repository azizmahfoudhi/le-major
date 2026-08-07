import React from 'react';
import { createClient } from '@/lib/supabase/server';
import SeriesClient from './series-client';
import { Badge } from '@/components/ui';

export default async function SeriesManager() {
  const supabase = await createClient();

  const { data: subjects } = await supabase.from('subjects').select('id, name').order('name');

  const { data: series } = await supabase
    .from('series')
    .select(`
      id,
      title,
      difficulty,
      is_premium,
      subject_id,
      subjects (
        name
      ),
      series_exercises (
        id
      )
    `)
    .order('title', { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedSeries = (series || []).map((s: any) => ({
    id: s.id,
    titre: s.title,
    matiere: s.subjects?.name || 'Inconnue',
    exercices: s.series_exercises?.length || 0,
    difficulte: s.difficulty === 'easy' ? (
      <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Facile</Badge>
    ) : s.difficulty === 'intermediate' ? (
      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Moyen</Badge>
    ) : (
      <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Difficile</Badge>
    ),
    acces: s.is_premium ? (
      <span className="text-gold-600 font-semibold text-sm">Premium</span>
    ) : (
      <span className="text-green-600 font-semibold text-sm">Gratuit</span>
    ),
    _raw: s
  }));

  return <SeriesClient initialSeries={formattedSeries} subjects={subjects || []} />;
}
