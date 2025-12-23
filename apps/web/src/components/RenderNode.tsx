/**
 * RenderNode - Adds visual indicators and toolbar to components
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { ROOT_NODE } from '@craftjs/utils';

export function RenderNode({ render }: { render: React.ReactElement }) {
  const { id } = useNode();
  const { actions, query, isActive } = useEditor((_, query) => ({
    isActive: query.getEvent('selected').contains(id),
  }));

  const {
    isHover,
    dom,
    name,
    moveable,
    deletable,
    connectors: { drag },
    parent,
  } = useNode((node) => ({
    isHover: node.events.hovered,
    dom: node.dom,
    name: node.data.custom?.displayName || node.data.displayName,
    moveable: query.node(node.id).isDraggable(),
    deletable: query.node(node.id).isDeletable(),
    parent: node.data.parent,
    props: node.data.props,
  }));

  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dom) {
      if (isActive || isHover) dom.classList.add('component-selected');
      else dom.classList.remove('component-selected');
    }
  }, [dom, isActive, isHover]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    actions.delete(id);
  }, [actions, id]);

  const handleSelectParent = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    actions.selectNode(parent);
  }, [actions, parent]);

  return (
    <>
      {id !== ROOT_NODE && (isHover || isActive) && (
        <div
          ref={currentRef}
          style={{
            position: 'fixed',
            left: dom ? `${dom.getBoundingClientRect().left}px` : '0',
            top: dom ? `${dom.getBoundingClientRect().top - 32}px` : '0',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: '#2563eb',
              color: 'white',
              padding: '6px 10px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ userSelect: 'none' }}>{name}</span>
            
            {moveable && (
              <div
                ref={drag as any}
                style={{
                  cursor: 'move',
                  padding: '2px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  borderLeft: '1px solid rgba(255,255,255,0.3)',
                  marginLeft: '4px',
                  paddingLeft: '8px',
                }}
                title="Drag to reorder"
              >
                ⠿
              </div>
            )}

            {parent && parent !== ROOT_NODE && (
              <div
                onClick={handleSelectParent}
                style={{
                  cursor: 'pointer',
                  padding: '2px 6px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Select parent"
              >
                ↑
              </div>
            )}

            {deletable && (
              <div
                onClick={handleDelete}
                style={{
                  cursor: 'pointer',
                  padding: '2px 6px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Delete component"
              >
                🗑
              </div>
            )}
          </div>
        </div>
      )}
      {render}
    </>
  );
}

