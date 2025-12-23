/**
 * RenderNode - Adds visual indicators and toolbar to components
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
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

  const [pos, setPos] = useState({ left: 0, top: 0 });

  // Update position when DOM changes
  useEffect(() => {
    if (dom) {
      const rect = dom.getBoundingClientRect();
      setPos({ left: rect.left, top: rect.top - 36 });
    }
  }, [dom, isHover, isActive]);

  useEffect(() => {
    if (dom) {
      if (isActive || isHover) dom.classList.add('component-selected');
      else dom.classList.remove('component-selected');
    }
  }, [dom, isActive, isHover]);

  // Keep node selected when clicking toolbar
  const keepSelected = useCallback(() => {
    actions.selectNode(id);
  }, [actions, id]);

  const handleDelete = useCallback(() => {
    actions.delete(id);
  }, [actions, id]);

  const handleSelectParent = useCallback(() => {
    if (parent) actions.selectNode(parent);
  }, [actions, parent]);

  // Don't render for root or if not hovered/active
  if (id === ROOT_NODE || (!isHover && !isActive)) {
    return <>{render}</>;
  }

  // Use portal to render toolbar outside of Craft.js event handlers
  const toolbar = ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        left: pos.left,
        top: pos.top,
        zIndex: 99999,
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        keepSelected();
      }}
    >
      <div
        style={{
          background: '#2563eb',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ userSelect: 'none' }}>{name}</span>
        
        {moveable && (
          <div
            ref={drag as any}
            style={{
              cursor: 'grab',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '4px',
            }}
            title="Drag to reorder"
          >
            ⠿
          </div>
        )}

        {parent && parent !== ROOT_NODE && (
          <div
            onMouseDown={(e) => {
              e.stopPropagation();
              handleSelectParent();
            }}
            style={{
              cursor: 'pointer',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '4px',
            }}
            title="Select parent"
          >
            ↑
          </div>
        )}

        {deletable && (
          <div
            onMouseDown={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            style={{
              cursor: 'pointer',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '4px',
            }}
            title="Delete component"
          >
            🗑
          </div>
        )}
      </div>
    </div>,
    document.body
  );

  return (
    <>
      {toolbar}
      {render}
    </>
  );
}

