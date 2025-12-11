'use client';

import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Edit2, Reply } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onEdit: () => void;
  onReply: () => void;
  onReact: (type: string) => void;
  canEdit: boolean;
}

export default function ContextMenu({ x, y, onClose, onEdit, onReply, onReact, canEdit }: ContextMenuProps) {
  // Calculate position using useMemo to avoid setState in useEffect
  const position = useMemo(() => {
    if (typeof window === 'undefined') return { top: y, left: x };
    
    const menuWidth = 180;
    const menuHeight = canEdit ? 120 : 60;
    const padding = 20;
    
    let newLeft = x;
    let newTop = y;
    
    // Prevent going off right edge
    if (x + menuWidth > window.innerWidth - padding) {
      newLeft = window.innerWidth - menuWidth - padding;
    }
    
    // Prevent going off left edge
    if (x < padding) {
      newLeft = padding;
    }
    
    // Prevent going off bottom edge
    if (y + menuHeight > window.innerHeight - padding) {
      newTop = y - menuHeight - 10;
    }
    
    // Prevent going off top edge
    if (newTop < padding) {
      newTop = padding;
    }
    
    return { top: newTop, left: newLeft };
  }, [x, y, canEdit]);

  const menuContent = (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0" 
        style={{ zIndex: 9998 }}
        onClick={onClose}
        onTouchStart={onClose}
      />
      {/* Menu */}
      <div 
        className="fixed min-w-[180px] bg-zinc-900 border border-white/20 rounded-xl shadow-2xl overflow-hidden"
        style={{ 
          zIndex: 9999, 
          top: position.top, 
          left: position.left
        }}
      >
        <div className="flex flex-col p-2 gap-1">
          {/* Reaction Bar */}
          <div className="flex items-center justify-between px-2 py-2 mb-1 border-b border-white/10">
             {['❤️', '😂', '😢', '🔥', '💯'].map(emoji => (
                <button
                    key={emoji}
                    onClick={(e) => { e.stopPropagation(); onReact(emoji === '❤️' ? 'HEART' : emoji === '😂' ? 'LAUGH' : emoji === '😢' ? 'CRY' : emoji === '🔥' ? 'FIRE' : 'LIT'); onClose(); }}
                    className="w-8 h-8 flex items-center justify-center text-lg hover:bg-white/10 rounded-full transition-transform hover:scale-125"
                >
                    {emoji}
                </button>
             ))}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onReply(); onClose(); }}
            className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/10 rounded-lg transition-colors w-full text-left"
          >
            <Reply className="w-5 h-5 text-blue-400" />
            Responder
          </button>
          
          {canEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); onClose(); }}
              className="flex items-center gap-3 px-4 py-3 text-sm text-white hover:bg-white/10 rounded-lg transition-colors w-full text-left"
            >
              <Edit2 className="w-5 h-5 text-green-400" />
              Editar
            </button>
          )}
        </div>
      </div>
    </>
  );
  
  // Only use portal on client side
  if (typeof window === 'undefined') return null;
  
  return createPortal(menuContent, document.body);
}

