import React from 'react';
import { useReportStore } from '../../store/useReportStore';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { GripVertical, Plus, Copy, Trash2, FileText, Image as ImageIcon } from 'lucide-react';
import './Sidebar.css';

export const Sidebar: React.FC = () => {
    const {
        report, activeSectionId, activeItemId, setActiveIds,
        reorderSections, reorderItems, addSection, addItem,
        duplicateSection, removeSection, duplicateItem, removeItem
    } = useReportStore();

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        if (result.type === 'section') {
            reorderSections(result.source.index, result.destination.index);
        } else if (result.type === 'item') {
            // The droppableId is the sectionId
            const sectionId = result.source.droppableId;
            if (result.source.droppableId === result.destination.droppableId) {
                reorderItems(sectionId, result.source.index, result.destination.index);
            }
        }
    };

    return (
        <div className="sidebar-container">
            <div className="sidebar-header">
                <h2>Sections & Items</h2>
                <button className="icon-btn" onClick={addSection} title="Add Section"><Plus size={18} /></button>
            </div>

            <div className="sidebar-content">
                <div
                    className={`sidebar-row ${!activeSectionId && !activeItemId ? 'active' : ''}`}
                    onClick={() => setActiveIds(null, null)}
                >
                    <FileText size={16} /> Report Settings
                </div>

                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="sections" type="section">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="sections-list">
                                {report.sections.map((section, index) => (
                                    <Draggable key={section.id} draggableId={section.id} index={index}>
                                        {(provided) => (
                                            <div ref={provided.innerRef} {...provided.draggableProps} className="section-container">
                                                <div
                                                    className={`sidebar-row section-row ${activeSectionId === section.id && !activeItemId ? 'active' : ''}`}
                                                    onClick={() => setActiveIds(section.id, null)}
                                                >
                                                    <div {...provided.dragHandleProps} className="drag-handle">
                                                        <GripVertical size={16} />
                                                    </div>
                                                    <span className="row-title">{section.sectionTitle || 'Untitled Category'}</span>
                                                    <div className="row-actions">
                                                        <button onClick={(e) => { e.stopPropagation(); addItem(section.id); }}><Plus size={14} /></button>
                                                        <button onClick={(e) => { e.stopPropagation(); duplicateSection(section.id); }}><Copy size={14} /></button>
                                                        <button onClick={(e) => { e.stopPropagation(); removeSection(section.id); }} className="danger"><Trash2 size={14} /></button>
                                                    </div>
                                                </div>

                                                <Droppable droppableId={section.id} type="item">
                                                    {(provided) => (
                                                        <div {...provided.droppableProps} ref={provided.innerRef} className="items-list">
                                                            {section.items.map((item, itemIdx) => (
                                                                <Draggable key={item.id} draggableId={item.id} index={itemIdx}>
                                                                    {(provided) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            className={`sidebar-row item-row ${activeItemId === item.id ? 'active' : ''}`}
                                                                            onClick={(e) => { e.stopPropagation(); setActiveIds(section.id, item.id); }}
                                                                        >
                                                                            <div {...provided.dragHandleProps} className="drag-handle">
                                                                                <GripVertical size={14} />
                                                                            </div>
                                                                            <ImageIcon size={14} style={{ marginRight: '0.5rem', opacity: 0.5 }} />
                                                                            <span className="row-title">{item.productName || 'Unnamed Item'}</span>
                                                                            <div className="row-actions">
                                                                                <button onClick={(e) => { e.stopPropagation(); duplicateItem(section.id, item.id); }}><Copy size={12} /></button>
                                                                                <button onClick={(e) => { e.stopPropagation(); removeItem(section.id, item.id); }} className="danger"><Trash2 size={12} /></button>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                            {provided.placeholder}
                                                        </div>
                                                    )}
                                                </Droppable>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </div>
    );
};
