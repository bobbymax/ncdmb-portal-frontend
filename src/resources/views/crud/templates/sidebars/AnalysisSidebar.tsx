import { BaseRepository, BaseResponse } from "app/Repositories/BaseRepository";
import { DocumentResponseData } from "app/Repositories/Document/data";
import { DocumentTypeResponseData } from "app/Repositories/DocumentType/data";
import { ProgressTrackerResponseData } from "app/Repositories/ProgressTracker/data";
import { WidgetResponseData } from "app/Repositories/Widget/data";
import React, { lazy, Suspense, useMemo } from "react";
import { DocketSidebarProps } from "resources/views/pages/FileDocket";

export interface SidebarProps<T extends BaseResponse> {
  resource: T;
  widget: WidgetResponseData;
  tracker: ProgressTrackerResponseData;
  uploadCount: number;
  docType: DocumentTypeResponseData;
  document: DocumentResponseData;
}

const AnalysisSidebar: React.FC<DocketSidebarProps<DocumentResponseData>> = ({
  resource,
  drafts,
  tracker,
  workflow,
  tab,
  docType,
  uploads,
  document,
}) => {
  const widgets = useMemo(() => {
    if (!docType || !Array.isArray(docType.widgets)) return [];
    return docType.widgets;
  }, [docType]);

  // Map of widget.component => lazy-loaded component
  const widgetComponents = useMemo(() => {
    const map: Record<string, React.LazyExoticComponent<React.FC<any>>> = {};

    widgets.forEach((widget) => {
      const componentName = widget.component.replace(/[^a-zA-Z0-9]/g, "");

      try {
        map[widget.component] = lazy(
          () => import(`../widgets/${componentName}`)
        );
      } catch (e) {
        console.warn(`Widget ${componentName} failed to load.`);
      }
    });

    return map;
  }, [widgets]);

  return (
    <div>
      {widgets.length > 0 ? (
        widgets.map((widget) => {
          const WidgetComponent = widgetComponents[widget.component];

          if (!WidgetComponent) {
            return (
              <div key={widget.id}>
                <small className="text-danger">
                  Unknown widget: {widget.component}
                </small>
              </div>
            );
          }

          return (
            <Suspense
              fallback={<div>Loading {widget.title}...</div>}
              key={widget.id}
            >
              <WidgetComponent
                widget={widget}
                resource={resource}
                tracker={tracker}
                uploadsCount={uploads.length}
                docType={docType}
                document={document}
              />
            </Suspense>
          );
        })
      ) : (
        <p>No widgets to display</p>
      )}
    </div>
  );
};

export default AnalysisSidebar;
