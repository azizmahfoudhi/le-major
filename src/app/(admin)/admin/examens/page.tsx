import React from 'react';
import { createClient } from '@/lib/supabase/server';
import ExamensClient from './examens-client';
import { Badge } from '@/components/ui';

export default async function ExamensManager() {
  const supabase = await createClient();

  const { data: subjects } = await supabase.from('subjects').select('id, name').order('name');

  const { data: exams } = await supabase
    .from('exams')
    .select(`
      id,
      title,
      duration_minutes,
      status,
      is_mock_exam,
      subject_id,
      subjects (
        name
      )
    `)
    .order('title', { ascending: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedExams = (exams || []).map((e: any) => ({
    id: e.id,
    titre: e.title,
    matiere: e.subjects?.name || 'Inconnue',
    type: e.is_mock_exam ? (
      <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">Examen Blanc</Badge>
    ) : (
      <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Sujet Réel</Badge>
    ),
    duree: `${e.duration_minutes} min`,
    statut: e.status === 'published' ? (
      <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">Publié</Badge>
    ) : e.status === 'archived' ? (
      <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">Archivé</Badge>
    ) : (
      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Brouillon</Badge>
    ),
    _raw: e
  }));

  return <ExamensClient initialExams={formattedExams} subjects={subjects || []} />;
}
