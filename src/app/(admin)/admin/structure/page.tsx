'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Plus, Edit2, Trash2, Folder, FolderOpen, Book, BookOpen } from 'lucide-react';
import { Button, Card, EmptyState, Modal, Input } from '@/components/ui';
import { getAcademicTree, TreeNode } from '../../actions/admin';

function TreeItem({ node, level = 0 }: { node: TreeNode; level?: number }) {
  const [isOpen, setIsOpen] = useState(level < 2); // Auto-open up to level 2
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div 
        className="flex items-center group py-2 hover:bg-gray-50 rounded-md px-2 transition-colors cursor-pointer"
        style={{ paddingLeft: `${level * 24 + 8}px` }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-5 h-5 flex items-center justify-center mr-1">
          {hasChildren ? (
            isOpen ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronRight className="h-4 w-4 text-gray-500" />
          ) : (
            <span className="w-4 h-4" />
          )}
        </div>
        
        <div className="flex items-center space-x-2 flex-1">
          {node.type === 'Matière' ? (
            <Book className="h-4 w-4 text-blue-500" />
          ) : node.type === 'Chapitre' ? (
            <BookOpen className="h-4 w-4 text-emerald-500" />
          ) : isOpen && hasChildren ? (
            <FolderOpen className="h-4 w-4 text-gold-500" />
          ) : (
            <Folder className="h-4 w-4 text-gold-500" />
          )}
          <span className="font-medium text-navy-900">{node.name}</span>
          <span className="text-xs text-gray-400 font-normal px-2 py-0.5 bg-gray-100 rounded-full">
            {node.type}
          </span>
        </div>

        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {node.type !== 'Chapitre' && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-gray-500 hover:text-navy-900" onClick={(e) => { e.stopPropagation(); alert('Création non implémentée pour cette version')}}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-7 px-2 text-gray-500 hover:text-navy-900" onClick={(e) => { e.stopPropagation(); alert('Édition non implémentée')}}>
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {isOpen && hasChildren && (
        <div className="mt-1">
          {node.children!.map((child) => (
            <TreeItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function StructureManager() {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAcademicTree()
      .then(data => {
        setTree(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 font-playfair">Structure Académique</h1>
          <p className="text-gray-500 mt-1">Gérez les universités, formations, niveaux et matières.</p>
        </div>
      </div>

      <Card className="p-4">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Chargement de la structure...</div>
        ) : tree.length === 0 ? (
          <div className="p-8 text-center text-gray-500">La base de données est vide. Utilisez les scripts SQL pour initialiser la structure.</div>
        ) : (
          <div className="space-y-1">
            {tree.map((node) => (
              <TreeItem key={node.id} node={node} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
