import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, Input } from '@/components/ui';
import { Clock, CheckCircle, ArrowRight, BookOpen, Settings2, Loader2, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';
import { generateCustomExam, startOfficialExam } from '../actions/exams';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ModeExamenClient({ exams, subjects, themesBySubject }: { exams: any[]; subjects: any[]; themesBySubject?: Record<string, string[]> }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [startingExamId, setStartingExamId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');

  const handleGenerate = async (formData: FormData) => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateCustomExam(formData);
      if (result && !result.success) {
        setError(result.error);
        setIsGenerating(false);
      }
    } catch (e) {
      // The redirect throws an error in Next.js, so we handle it gracefully if it's not a redirect
      if (e instanceof Error && e.message !== 'NEXT_REDIRECT') {
        setError("Erreur inattendue");
        setIsGenerating(false);
      }
    }
  };

  const currentThemes = (themesBySubject && themesBySubject[selectedSubjectId]) || [];

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-display font-bold text-navy-900 mb-4">
          Mode Examen
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Choisissez un sujet officiel pour vous tester dans les conditions exactes, ou générez un examen sur-mesure (Examen Le Major) ciblant vos points faibles.
        </p>
      </div>

      <Tabs defaultValue="officiel" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="officiel">Sujets Officiels</TabsTrigger>
          <TabsTrigger value="personnalise">Examen Le Major</TabsTrigger>
        </TabsList>

        <TabsContent value="officiel" className="space-y-6 mt-4">
          {exams.length === 0 ? (
            <Card className="p-12 text-center text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-navy-900 mb-2">Aucun sujet officiel disponible</p>
              <p>Il n'y a pas d'examens publiés pour vos matières actuellement.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exams.map((exam) => (
                <Card key={exam.id} className="overflow-hidden hover:border-gold-300 transition-all shadow-sm hover:shadow-md">
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="p-6 flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-navy-600 bg-navy-50 px-2.5 py-1 rounded-md uppercase tracking-wide">
                          {exam.subjects?.name}
                        </span>
                        {exam.isCompleted && (
                          <span className="text-emerald-500 bg-emerald-50 p-1 rounded-full">
                            <CheckCircle className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                      
                      <h2 className="text-xl font-bold text-navy-900 mb-2 leading-tight">{exam.title}</h2>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-4 bg-gray-50 p-3 rounded-lg inline-flex">
                        <div className="flex items-center font-medium">
                          <Clock className="w-4 h-4 mr-2 text-gold-500" />
                          {exam.duration_minutes} min
                        </div>
                        {exam.bestScore !== null && (
                          <div className="flex items-center font-medium border-l border-gray-200 pl-4">
                            Score : {exam.bestScore}/20
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                      <Button 
                        onClick={async () => {
                          setStartingExamId(exam.id);
                          try {
                            await startOfficialExam(exam.id);
                          } catch(e) {
                            if (e instanceof Error && e.message !== 'NEXT_REDIRECT') {
                              setError("Erreur");
                              setStartingExamId(null);
                            }
                          }
                        }}
                        disabled={startingExamId === exam.id}
                        className="w-full bg-navy-900 hover:bg-navy-800 text-white shadow-sm"
                      >
                        {startingExamId === exam.id ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Chargement...</>
                        ) : (
                          <>
                            {exam.attemptsCount > 0 ? 'Refaire l\'examen' : 'Démarrer'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="personnalise" className="mt-4">
          <Card className="border-gold-200 shadow-card">
            <CardHeader className="bg-gold-50/50 border-b border-gold-100 pb-6">
              <CardTitle className="flex items-center text-navy-900">
                <Settings2 className="w-5 h-5 mr-3 text-gold-600" />
                Générateur d'Examen Le Major
              </CardTitle>
              <p className="text-sm text-gray-500 mt-2">
                Sélectionnez vos critères pour composer un examen sur-mesure.
              </p>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              
              <div className="mb-8 flex items-start space-x-3 bg-blue-50/80 border border-blue-100 p-4 rounded-xl text-blue-900">
                <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
                <p className="text-sm leading-relaxed">
                  <strong>Entraînement 100% réel :</strong> Le système pioche exclusivement parmi les exercices des annales officielles passées. Nous concevons le sujet idéal, adapté à vos points faibles, sans jamais utiliser de questions fictives.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}
              <form className="space-y-8" action={handleGenerate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-navy-900 text-lg border-b border-gray-100 pb-2">1. Matière</h3>
                    <select 
                      name="subject"
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                      className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
                      required
                    >
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-navy-900 text-lg border-b border-gray-100 pb-2">2. Filtre par Thème</h3>
                    <select 
                      name="theme"
                      className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
                    >
                      <option value="">Tous les chapitres</option>
                      {currentThemes.map(theme => (
                        <option key={theme} value={theme}>{theme}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">Cibler un chapitre spécifique, ou laisser sur "Tous".</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-navy-900 text-lg border-b border-gray-100 pb-2">3. Format du sujet</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Durée (min)</label>
                        <Input type="number" name="duration" defaultValue={120} min={30} max={240} className="h-11" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Nb. d'exercices</label>
                        <Input type="number" name="count" defaultValue={4} min={1} max={10} className="h-11" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-navy-900 text-lg border-b border-gray-100 pb-2">4. Difficulté visée</h3>
                    <select 
                      name="difficulty"
                      className="w-full h-11 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gold-500 bg-white"
                    >
                      <option value="all">Mixte (Conditions réelles)</option>
                      <option value="easy">Facile (Révisions de base)</option>
                      <option value="intermediate">Intermédiaire</option>
                      <option value="hard">Difficile (Entraînement intensif)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <Button type="submit" size="lg" className="bg-gold-500 hover:bg-gold-600 text-white px-8" disabled={isGenerating}>
                    {isGenerating ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Génération en cours...</>
                    ) : (
                      'Générer mon examen'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
