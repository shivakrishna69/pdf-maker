import React from 'react';
import { useReportStore } from '../../store/useReportStore';
import { ReportEditor } from './ReportEditor';
import { SectionEditor } from './SectionEditor';
import { ItemEditor } from './ItemEditor';

export const Editor: React.FC = () => {
    const { activeSectionId, activeItemId } = useReportStore();

    return (
        <div style={{ padding: '1.5rem', height: '100%', overflowY: 'auto' }}>
            {!activeSectionId && !activeItemId && <ReportEditor />}
            {activeSectionId && !activeItemId && <SectionEditor sectionId={activeSectionId} />}
            {activeSectionId && activeItemId && <ItemEditor sectionId={activeSectionId} itemId={activeItemId} />}
        </div>
    );
};
