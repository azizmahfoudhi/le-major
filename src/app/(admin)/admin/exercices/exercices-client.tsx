'use client';

import React, { useState, useRef } from 'react';
import { Plus, Brain, Edit, Trash2 } from 'lucide-react';
import { Button, Input, Badge } from '@/components/ui';
import { DataTable } from '@/components/admin/data-table';
import { createExercise, updateExercise, deleteExercise } from './actions';
import MediaPicker from '@/components/admin/media-picker';

type Subject = { id: string; name: string; };
type Exam = { id: string; title: string; };

type Exercise = {
  id: string;
  titre: string;
  matiere: string;
  difficulte: React.ReactNode;
  _raw: Record<string, unknown>;
};

export default function ExercicesClient({ 
  initialExercises, 
  subjects,
  exams 
}: { 
  initialExercises: Exercise[];
  subjects: Subject[];
  exams: Exam[];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [statement, setStatement] = useState('');
  const [solution, setSolution] = useState('');
  
  const statementRef = useRef<HTMLTextAreaElement>(null);
  const solutionRef = useRef<HTMLTextAreaElement>(null);
  
  // Nouvelles méta-données
  const [examId, setExamId] = useState('');
  const [theme, setTheme] = useState('');
  const [points, setPoints] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');

  const columns = [
    { accessorKey: 'titre', header: 'Titre' },
    { accessorKey: 'matiere', header: 'Matière' },
    { accessorKey: 'difficulte', header: 'Difficulté' }
  ];

  const handleOpenNew = () => {
    setEditingItem(null);
    setTitle('');
    setDifficulty('easy');
    setSubjectId(subjects[0]?.id || '');
    setStatement('');
    setSolution('');
    setExamId('');
    setTheme('');
    setPoints('');
    setDurationMinutes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ex: Exercise) => {
    setEditingItem(ex._raw);
    setTitle((ex._raw.title as string) || '');
    setDifficulty((ex._raw.difficulty as string) || 'easy');
    setSubjectId((ex._raw.subject_id as string) || subjects[0]?.id || '');
    setStatement((ex._raw.statement_body as string) || '');
    setSolution((ex._raw.solution_body as string) || '');
    setExamId((ex._raw.exam_id as string) || '');
    setTheme((ex._raw.theme as string) || '');
    setPoints(ex._raw.points ? String(ex._raw.points) : '');
    setDurationMinutes(ex._raw.duration_minutes ? String(ex._raw.duration_minutes) : '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet exercice ?')) {
      await deleteExercise(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title,
        difficulty,
        subject_id: subjectId,
        statement_body: statement,
        solution_body: solution,
        exam_id: examId || undefined,
        theme: theme || undefined,
        points: points ? parseFloat(points) : undefined,
        duration_minutes: durationMinutes ? parseInt(durationMinutes, 10) : undefined
      };
      
      if (editingItem) {
        await updateExercise(editingItem.id as string, payload);
      } else {
        await createExercise(payload);
      }
      setIsModalOpen(false);
    } catch {
      alert('Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleMediaSelect = (markdownLink: string, target: 'statement' | 'solution') => {
    const ref = target === 'statement' ? statementRef.current : solutionRef.current;
    if (!ref) return;
    
    const start = ref.selectionStart;
    const end = ref.selectionEnd;
    
    const currentText = target === 'statement' ? statement : solution;
    const newContent = currentText.substring(0, start) + markdownLink + currentText.substring(end);
    
    if (target === 'statement') setStatement(newContent);
    else setSolution(newContent);
    
    setTimeout(() => {
      ref.focus();
      ref.setSelectionRange(start + markdownLink.length, start + markdownLink.length);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Banque d'Exercices</h1>
          <p className="text-gray-500 mt-1">Gérez tous les exercices de la plateforme.</p>
        </div>
        <Button onClick={handleOpenNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Exercice
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
        {initialExercises.length > 0 ? (
          <DataTable 
            columns={columns} 
            data={initialExercises}
            enableSearch={true}
            searchPlaceholder="Rechercher un exercice..."
            actions={(item) => (
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(item)}>
                  <Edit className="w-4 h-4 text-gray-500" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </Button>
              </div>
            )}
          />
        ) : (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Brain className="w-12 h-12 text-gray-300 mb-4" />
            <p>Aucun exercice disponible.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-navy-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 shrink-0">
              <h2 className="text-xl font-bold text-navy-900">
                {editingItem ? 'Modifier l\'Exercice' : 'Nouvel Exercice'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <Input 
                    required 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="ex: QCM Fonctions..."
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
                  <select 
                    className="w-full h-10 rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm"
                    value={subjectId}
                    onChange={e => setSubjectId(e.target.value)}
                    required
                  >
                    <option value="">Sélectionner une matière...</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Examen Source (Optionnel)</label>
                  <select 
                    className="w-full h-10 rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm"
                    value={examId}
                    onChange={e => setExamId(e.target.value)}
                  >
                    <option value="">Aucun examen source...</option>
                    {exams.map(e => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thème (Chapitre secondaire)</label>
                  <Input 
                    value={theme} 
                    onChange={e => setTheme(e.target.value)} 
                    placeholder="ex: Monopole, Théorie des coûts..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-3 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                  <Input 
                    type="number"
                    step="0.25"
                    min="0"
                    value={points} 
                    onChange={e => setPoints(e.target.value)} 
                    placeholder="ex: 5"
                  />
                </div>
                <div className="col-span-3 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée Estimée (min)</label>
                  <Input 
                    type="number"
                    min="1"
                    value={durationMinutes} 
                    onChange={e => setDurationMinutes(e.target.value)} 
                    placeholder="ex: 30"
                  />
                </div>
                <div className="col-span-3 sm:col-span-1 flex items-end pb-2">
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulté</label>
                  <select 
                    className="w-full h-10 rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm"
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value)}
                  >
                    <option value="easy">Facile</option>
                    <option value="intermediate">Intermédiaire</option>
                    <option value="hard">Difficile</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Énoncé (Markdown / KaTeX)</label>
                  <MediaPicker onSelect={(link) => handleMediaSelect(link, 'statement')} />
                </div>
                <textarea 
                  ref={statementRef}
                  className="w-full flex min-h-[120px] rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm font-mono shadow-sm"
                  value={statement} 
                  onChange={e => setStatement(e.target.value)} 
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Correction détaillée (Markdown / KaTeX)</label>
                  <MediaPicker onSelect={(link) => handleMediaSelect(link, 'solution')} />
                </div>
                <textarea 
                  ref={solutionRef}
                  className="w-full flex min-h-[120px] rounded-md border border-gray-200 bg-transparent px-3 py-2 text-sm font-mono shadow-sm"
                  value={solution} 
                  onChange={e => setSolution(e.target.value)} 
                  required
                />
              </div>
              
              <div className="pt-4 flex justify-end gap-3 shrink-0">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
