'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { CheckCircle2, AlertTriangle, ArrowRight, BarChart3, Clock, BookOpen, RotateCcw, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Mock data: 5 questions with LaTeX
const QUESTIONS = [
  {
    id: 'q1',
    number: 1,
    theme: 'Nombres Complexes',
    points: 4,
    statement: `Résoudre dans $\\mathbb{C}$ l'équation $z^2 - 4z + 13 = 0$.`,
    correction: `On calcule le discriminant de l'équation :\n$\\Delta = (-4)^2 - 4 \\times 1 \\times 13 = 16 - 52 = -36$\n\nComme $\\Delta < 0$, l'équation admet deux solutions complexes conjuguées :\n$z_1 = \\frac{4 - i\\sqrt{36}}{2} = 2 - 3i$\n$z_2 = \\frac{4 + i\\sqrt{36}}{2} = 2 + 3i$\n\nL'ensemble des solutions est $S = \\{2 - 3i ; 2 + 3i\\}$.`
  },
  {
    id: 'q2',
    number: 2,
    theme: 'Intégration',
    points: 4,
    statement: `Calculer l'intégrale $I = \\int_0^1 x e^x dx$.`,
    correction: `On utilise une intégration par parties.\nPosons $u(x) = x$ et $v'(x) = e^x$.\nAlors $u'(x) = 1$ et $v(x) = e^x$.\n\n$I = [x e^x]_0^1 - \\int_0^1 1 \\cdot e^x dx$\n$I = (1 \\cdot e^1 - 0) - [e^x]_0^1$\n$I = e - (e^1 - e^0) = e - e + 1 = 1$`
  },
  {
    id: 'q3',
    number: 3,
    theme: 'Probabilités',
    points: 3,
    statement: `Une variable aléatoire $X$ suit une loi binomiale $\\mathcal{B}(10, 0.2)$. Calculer $P(X = 2)$.`,
    correction: `La formule de la loi binomiale est $P(X = k) = \\binom{n}{k} p^k (1-p)^{n-k}$.\n\nIci $n = 10$, $p = 0.2$ et $k = 2$.\n$P(X = 2) = \\binom{10}{2} (0.2)^2 (0.8)^8$\n$P(X = 2) = 45 \\times 0.04 \\times 0.16777216 \\approx 0.302$`
  },
  {
    id: 'q4',
    number: 4,
    theme: 'Géométrie dans l\'espace',
    points: 5,
    statement: `Donner l'équation cartésienne du plan passant par $A(1, 2, 3)$ et de vecteur normal $\\vec{n}(2, -1, 4)$.`,
    correction: `L'équation du plan est de la forme $ax + by + cz + d = 0$ où $(a,b,c)$ sont les coordonnées du vecteur normal.\nDonc l'équation est $2x - y + 4z + d = 0$.\n\nLe point $A(1, 2, 3)$ appartient au plan, ses coordonnées vérifient l'équation :\n$2(1) - (2) + 4(3) + d = 0$\n$2 - 2 + 12 + d = 0 \\implies d = -12$\n\nL'équation cartésienne est donc $2x - y + 4z - 12 = 0$.`
  },
  {
    id: 'q5',
    number: 5,
    theme: 'Suites Numériques',
    points: 4,
    statement: `Soit $(u_n)$ définie par $u_0 = 2$ et $u_{n+1} = \\frac{1}{2}u_n + 3$. Déterminer la limite de $(u_n)$.`,
    correction: `Soit $l$ la limite éventuelle. Elle vérifie $l = \\frac{1}{2}l + 3$.\n$\\frac{1}{2}l = 3 \\implies l = 6$.\n\nPour prouver la convergence, on peut étudier la suite auxiliaire $v_n = u_n - 6$.\n$v_{n+1} = u_{n+1} - 6 = \\frac{1}{2}u_n + 3 - 6 = \\frac{1}{2}(u_n - 6) = \\frac{1}{2}v_n$.\n$(v_n)$ est géométrique de raison $1/2$. Comme $|1/2| < 1$, $\\lim v_n = 0$.\nDonc $\\lim u_n = 6$.`
  }
];

const TOTAL_POINTS = QUESTIONS.reduce((acc, q) => acc + q.points, 0);

function renderMath(text: string) {
  let html = text;
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, math) => {
    try {
      return katex.renderToString(math, { displayMode: true, throwOnError: false });
    } catch (e) {
      return match;
    }
  });
  html = html.replace(/\$([^\$]+)\$/g, (match, math) => {
    try {
      return katex.renderToString(math, { displayMode: false, throwOnError: false });
    } catch (e) {
      return match;
    }
  });
  return html.replace(/\n/g, '<br/>');
}

export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  type Stage = 'intro' | 'correction' | 'evaluation' | 'results';
  const [stage, setStage] = useState<Stage>('intro');
  const [scores, setScores] = useState<Record<string, number | null>>({});
  const [revealedCorrections, setRevealedCorrections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Initialize scores
    const initialScores: Record<string, null> = {};
    QUESTIONS.forEach(q => initialScores[q.id] = null);
    setScores(initialScores);
  }, []);

  const handleReveal = (qId: string) => {
    setRevealedCorrections(prev => ({ ...prev, [qId]: true }));
  };

  const handleScoreChange = (qId: string, value: string) => {
    const num = parseFloat(value.replace(',', '.'));
    const maxPoints = QUESTIONS.find(q => q.id === qId)?.points || 0;
    
    if (value === '') {
      setScores(prev => ({ ...prev, [qId]: null }));
    } else if (!isNaN(num) && num >= 0 && num <= maxPoints) {
      setScores(prev => ({ ...prev, [qId]: num }));
    }
  };

  const evaluatedCount = Object.values(scores).filter(s => s !== null).length;
  const allEvaluated = evaluatedCount === QUESTIONS.length;

  const totalScore = Object.values(scores).reduce((acc: number, val) => acc + (val || 0), 0);
  const percentage = (totalScore / TOTAL_POINTS) * 100;

  // Render Intro Stage
  if (stage === 'intro') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-xl w-full p-10 text-center shadow-card rounded-card border-gray-100 bg-white">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-display font-bold text-navy-900 mb-4">Examen Terminé</h1>
          <p className="text-slate-600 text-lg mb-8 leading-relaxed">
            Votre session est maintenant terminée. Il est temps de passer à l'étape la plus importante : l'analyse de vos réponses et l'auto-évaluation.
          </p>
          <Button 
            size="lg"
            onClick={() => setStage('correction')}
            className="w-full bg-gold-500 hover:bg-gold-500/90 text-white font-bold py-6 text-lg rounded-lg group"
          >
            Voir la correction
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Card>
      </div>
    );
  }

  // Render Correction / Evaluation Stages
  if (stage === 'correction' || stage === 'evaluation') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-card shadow-sm border border-gray-100">
            <div>
              <h1 className="text-2xl font-display font-bold text-navy-900 mb-2">
                {stage === 'correction' ? 'Phase de Correction' : 'Auto-évaluation'}
              </h1>
              <p className="text-slate-600">
                {stage === 'correction' 
                  ? "Consultez la correction détaillée pour chaque question." 
                  : "Attribuez-vous des points pour chaque question de manière honnête."}
              </p>
            </div>
            {stage === 'evaluation' && (
              <div className="mt-4 sm:mt-0 text-right">
                <span className="inline-block bg-navy-900/5 text-navy-900 px-4 py-2 rounded-full font-medium">
                  {evaluatedCount} / {QUESTIONS.length} questions évaluées
                </span>
              </div>
            )}
          </div>

          <div className="space-y-8">
            {QUESTIONS.map((q) => (
              <Card key={q.id} className="p-6 sm:p-8 shadow-sm rounded-card border-gray-100 bg-white overflow-hidden">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                  <h3 className="text-xl font-display font-bold text-navy-900">Question {q.number}</h3>
                  <span className="px-3 py-1 bg-gold-500/10 text-gold-600 rounded-full font-bold text-sm">
                    {q.points} points
                  </span>
                </div>
                
                {/* Statement */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Énoncé</h4>
                  <div 
                    className="prose prose-slate max-w-none text-slate-800"
                    dangerouslySetInnerHTML={{ __html: renderMath(q.statement) }}
                  />
                </div>

                {/* Correction Reveal (Stage 1) */}
                {stage === 'correction' && !revealedCorrections[q.id] && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
                    <Button 
                      variant="outline"
                      onClick={() => handleReveal(q.id)}
                      className="border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white"
                    >
                      Afficher la correction
                    </Button>
                  </div>
                )}

                {/* Correction Content */}
                {(stage === 'evaluation' || revealedCorrections[q.id]) && (
                  <div className="bg-green-50/50 border border-green-100 rounded-lg p-6 mb-6">
                    <h4 className="text-sm font-bold text-green-700 uppercase tracking-wider mb-3 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Correction
                    </h4>
                    <div 
                      className="prose prose-slate max-w-none text-slate-800"
                      dangerouslySetInnerHTML={{ __html: renderMath(q.correction) }}
                    />
                  </div>
                )}

                {/* Evaluation Input (Stage 2) */}
                {stage === 'evaluation' && (
                  <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between bg-slate-50 p-4 rounded-lg">
                    <span className="font-medium text-navy-900">Votre note pour cette question :</span>
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        min="0"
                        max={q.points}
                        step="0.5"
                        value={scores[q.id] ?? ''}
                        onChange={(e) => handleScoreChange(q.id, e.target.value)}
                        className="w-20 text-center text-lg font-bold p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-navy-500 focus:border-navy-900 outline-none"
                        placeholder="--"
                      />
                      <span className="text-lg font-bold text-slate-500">/ {q.points}</span>
                      {scores[q.id] !== null && (
                        <Check className="w-6 h-6 text-green-500 ml-2" />
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* Action Footer */}
          <div className="mt-8 sticky bottom-8 flex justify-center z-10">
            {stage === 'correction' ? (
              <Button 
                size="lg"
                onClick={() => setStage('evaluation')}
                className="bg-navy-900 hover:bg-navy-900/90 text-white font-bold py-6 px-10 text-lg rounded-full shadow-xl transition-transform hover:scale-105"
              >
                Passer à l'auto-évaluation
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            ) : (
              <Button 
                size="lg"
                disabled={!allEvaluated}
                onClick={() => setStage('results')}
                className={cn(
                  "font-bold py-6 px-10 text-lg rounded-full shadow-xl transition-all",
                  allEvaluated 
                    ? "bg-gold-500 hover:bg-gold-500/90 text-white hover:scale-105" 
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                )}
              >
                Voir mon résultat
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render Dashboard (Stage 3)
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-navy-900 mb-4">Bilan de l'Examen</h1>
        <p className="text-lg text-slate-600">
          Session #{id.substring(0, 6)} • Mathématiques
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="p-8 shadow-card rounded-card border-gray-100 bg-white md:col-span-2 flex flex-col justify-center items-center">
          <h2 className="text-xl font-bold text-slate-500 mb-2">Note Finale</h2>
          <div className="text-6xl font-display font-bold text-navy-900 mb-4">
            {totalScore.toString().replace('.', ',')} <span className="text-4xl text-slate-400">/ {TOTAL_POINTS}</span>
          </div>
          <div className="bg-slate-100 px-6 py-2 rounded-full">
            <span className={cn(
              "text-xl font-bold",
              percentage >= 70 ? "text-green-600" : percentage >= 50 ? "text-amber-500" : "text-red-500"
            )}>
              {percentage.toFixed(1).replace('.', ',')} %
            </span>
          </div>
        </Card>

        <Card className="p-8 shadow-card rounded-card border-gray-100 bg-white flex flex-col justify-center items-center text-center">
          <Clock className="w-12 h-12 text-gold-600 mb-4" />
          <h2 className="text-lg font-bold text-slate-500 mb-2">Temps Utilisé</h2>
          <div className="text-3xl font-display font-bold text-navy-900">
            01:18:24
          </div>
          <p className="text-sm text-slate-400 mt-2">sur 02:00:00</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Points Forts */}
        <Card className="p-6 sm:p-8 shadow-sm rounded-card border-green-100 bg-green-50/30">
          <h3 className="flex items-center text-xl font-bold text-green-800 mb-6">
            <CheckCircle2 className="w-6 h-6 mr-2 text-green-600" />
            Points forts (≥ 70%)
          </h3>
          <ul className="space-y-4">
            {QUESTIONS.filter(q => ((scores[q.id] || 0) / q.points) >= 0.7).map(q => (
              <li key={q.id} className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <span className="font-medium text-slate-700">{q.theme}</span>
                <span className="text-green-600 font-bold bg-green-100 px-3 py-1 rounded-full text-sm">
                  {scores[q.id]} / {q.points}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* A Revoir */}
        <Card className="p-6 sm:p-8 shadow-sm rounded-card border-red-100 bg-red-50/30">
          <h3 className="flex items-center text-xl font-bold text-red-800 mb-6">
            <AlertTriangle className="w-6 h-6 mr-2 text-red-600" />
            À revoir (&lt; 50%)
          </h3>
          <ul className="space-y-4">
            {QUESTIONS.filter(q => ((scores[q.id] || 0) / q.points) < 0.5).map(q => (
              <li key={q.id} className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-red-100">
                <span className="font-medium text-slate-700">{q.theme}</span>
                <span className="text-red-600 font-bold bg-red-100 px-3 py-1 rounded-full text-sm">
                  {scores[q.id]} / {q.points}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button 
          variant="outline"
          onClick={() => setStage('correction')}
          className="px-6 py-4 text-navy-900 border-gray-200 hover:bg-slate-50 bg-white"
        >
          <BookOpen className="w-5 h-5 mr-2" />
          Revoir la correction
        </Button>
        <Button 
          onClick={() => router.push('/mode-examen')}
          className="px-6 py-4 bg-navy-900 hover:bg-navy-900/90 text-white shadow-md"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Refaire un examen
        </Button>
      </div>
    </div>
  );
}
