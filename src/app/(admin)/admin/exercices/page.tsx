import React from 'react';
import { createClient } from '@/lib/supabase/server';
import ExercicesClient from './exercices-client';
import { Badge } from '@/components/ui';

export default async function ExercicesManager() {
  const supabase = await createClient();

  // Fetch subjects to populate the select dropdown
  const { data: subjectsData } = await supabase
    .from('subjects')
    .select('id, name')
    .order('name');

  // Fetch exams for the source dropdown
  const { data: examsData } = await supabase
    .from('exams')
    .select('id, title')
    .order('title');

  // Fetch chapters to populate the theme dropdown per subject
  const { data: chaptersData } = await supabase
    .from('chapters')
    .select('id, title, subject_id')
    .order('order_index', { ascending: true });

  // Fetch exercises — use only the original base columns to avoid crashing
  // if the migration (exercises_schema_migration.sql) hasn't been run yet.
  // Once the migration is applied, the full select below can be used.
  const { data: exercises, error: exercisesError } = await supabase
    .from('exercises')
    .select(`
      id,
      title,
      difficulty,
      subject_id,
      statement_body,
      solution_body,
      exam_id,
      theme,
      points,
      duration_minutes,
      subjects ( name ),
      exams ( title )
    `)
    .order('created_at', { ascending: false });

  if (exercisesError) {
    console.error('[ExercicesManager] Supabase error:', exercisesError.message);
  }

  const getDifficultyBadge = (level: string) => {
    switch (level) {
      case 'hard': return <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50">Difficile</Badge>;
      case 'intermediate': return <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Intermédiaire</Badge>;
      default: return <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Facile</Badge>;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedExercises = (exercises || []).map((ex: any) => ({
    id: ex.id,
    titre: ex.title,
    matiere: ex.subjects?.name || 'Inconnue',
    difficulte: getDifficultyBadge(ex.difficulty),
    _raw: ex
  }));

  return (
    <>
      {exercisesError && (
        <div className="mb-4 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <strong>⚠️ Migration requise :</strong> La table <code>exercises</code> n&apos;a pas encore été mise à jour.
          Veuillez exécuter le fichier <code>exercises_schema_migration.sql</code> dans le SQL Editor de Supabase.
          <br/>
          <span className="text-xs mt-1 block text-amber-600">Détail : {exercisesError.message}</span>
        </div>
      )}
      <ExercicesClient 
        initialExercises={formattedExercises} 
        subjects={subjectsData || []} 
        exams={examsData || []}
        chapters={chaptersData || []}
        migrationRequired={!!exercisesError}
      />
    </>
  );
}
