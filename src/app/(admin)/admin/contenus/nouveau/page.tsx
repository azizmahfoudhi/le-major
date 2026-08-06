'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Check, Bold, Italic, Heading1, Heading2, List, ListOrdered, Quote, Code } from 'lucide-react';
import { Button, Input, Select, Card, Textarea } from '@/components/ui';
import ReactMarkdown from 'react-markdown';

export default function NewContent() {
  const router = useRouter();
  const [markdown, setMarkdown] = useState('# Nouveau Titre\n\nCommencez à écrire votre contenu ici...');

  const insertText = (before: string, after: string = '') => {
    const textarea = document.getElementById('markdown-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const selectedText = text.substring(start, end);
    const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);
    
    setMarkdown(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Créer un Contenu</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Brouillon
          </Button>
          <Button>
            <Check className="h-4 w-4 mr-2" />
            Publier
          </Button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Editor & Preview Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white rounded-card border border-gray-100 shadow-card overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center space-x-1 p-2 border-b border-gray-100 bg-gray-50">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertText('**', '**')} title="Gras">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertText('*', '*')} title="Italique">
              <Italic className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-gray-300 mx-2" />
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertText('# ', '')} title="Titre 1">
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertText('## ', '')} title="Titre 2">
              <Heading2 className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-gray-300 mx-2" />
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertText('- ', '')} title="Liste à puces">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertText('1. ', '')} title="Liste numérotée">
              <ListOrdered className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-gray-300 mx-2" />
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertText('> ', '')} title="Citation">
              <Quote className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => insertText('```\n', '\n```')} title="Code">
              <Code className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 px-2 ml-auto text-gold-600 font-medium" onClick={() => insertText('> [!NOTE]\n> ', '')}>
              Callout
            </Button>
          </div>

          {/* Split Pane */}
          <div className="flex-1 flex overflow-hidden">
            <textarea
              id="markdown-editor"
              className="flex-1 p-6 resize-none focus:outline-none bg-white text-navy-900 border-r border-gray-100 font-mono text-sm leading-relaxed"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Saisissez votre contenu en Markdown..."
            />
            <div className="flex-1 p-6 bg-gray-50 overflow-y-auto prose prose-navy prose-sm max-w-none">
              <ReactMarkdown>{markdown}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Sidebar Metadata */}
        <div className="w-80 flex flex-col space-y-6 overflow-y-auto">
          <Card className="p-5 space-y-4">
            <h3 className="font-semibold text-navy-900">Métadonnées</h3>
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-900">Titre</label>
              <Input placeholder="Titre du contenu" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-900">Type</label>
              <Select
                options={[
                  { label: 'Cours', value: 'cours' },
                  { label: 'Résumé', value: 'resume' },
                  { label: 'Ressource', value: 'ressource' },
                ]}
                placeholder="Sélectionnez un type"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-900">Matière</label>
              <Select
                options={[
                  { label: 'Microéconomie', value: 'micro' },
                  { label: 'Macroéconomie', value: 'macro' },
                  { label: 'Mathématiques', value: 'math' },
                ]}
                placeholder="Sélectionnez une matière"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-900">Chapitre</label>
              <Input placeholder="Ex: Chapitre 1" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
