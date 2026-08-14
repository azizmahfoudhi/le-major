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
    .select('id, title, subject_id')
    .order('title');

  // Fetch chapters to populate the theme dropdown per subject
  const { data: chaptersData } = await supabase
    .from('chapters')
    .select('id, title, subject_id')
    .order('order_index', { ascending: true });


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
      exams ( title )
    `)
    .order('created_at', { ascending: false });

  if (exercisesError) {
    console.error('Error fetching exercises:', exercisesError.message);
  }

  // Manually resolve subject names from our already-fetched subjectsData
  const subjectMap = Object.fromEntries((subjectsData || []).map(s => [s.id, s.name]));

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
    matiere: ex.subject_id ? (subjectMap[ex.subject_id] || 'Inconnue') : 'Inconnue',
    examen: ex.exams?.title || '-',
    theme: ex.theme || '-',
    difficulte: getDifficultyBadge(ex.difficulty),
    _raw: ex
  }));

  return (
    <ExercicesClient 
      initialExercises={formattedExercises} 
      subjects={subjectsData || []} 
      exams={examsData || []}
      chapters={chaptersData || []}
    />
  );
}
