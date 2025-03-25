import { FileTemplateResponseData } from "app/Repositories/FileTemplate/data";
import FileTemplateRepository from "app/Repositories/FileTemplate/FileTemplateRepository";
import { BuilderComponentProps } from "bootstrap";
import React, { useState } from "react";
import { DndProvider, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import LogoWidget from "../components/widgets/LogoWidget";
import BatchBanner from "../components/widgets/BatchBanner";

interface TemplateItem {
  id: string;
  identifier?: string;
  type: string;
  component_type: string;
  column_name?: string;
  x: number;
  y: number;
  z?: number;
  width?: number;
  height?: number;
  data?: any;
}

const TemplateBuilder: React.FC<
  BuilderComponentProps<FileTemplateResponseData, FileTemplateRepository>
> = ({ state, setState, repo, resource }) => {
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<TemplateItem | null>(null);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  );

  // Enable dropping components onto the canvas
  const [, dropRef] = useDrop({
    accept: "component",
    drop: (item: any, monitor) => {
      const offset = monitor.getSourceClientOffset();
      if (offset) {
        addComponent(item.type, offset.x, offset.y);
      }
    },
  });

  // Add new component to the template
  const addComponent = (type: string, x: number, y: number) => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        component_type: type,
        x,
        y,
        data: null,
        type,
      },
    ]);
  };

  // Update component content
  const updateComponentData = (id: string, newData: any) => {
    setItems(
      items.map((item) => (item.id === id ? { ...item, data: newData } : item))
    );
  };

  // Save template
  const saveTemplate = async () => {
    const payload = {
      orientation,
      components: items,
      resource_id: 1, // Assuming template is linked to a resource
    };
    // await axios.post("/api/templates/save", payload);
    alert("Template saved successfully!");
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="row">
        <div className="col-md-8 mb-3">
          <div className="template custom-card file__card"></div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="widgets custom-card file__card">
            <h5>Widgets</h5>

            <div className="widget__items">
              <BatchBanner />
              <LogoWidget />
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default TemplateBuilder;
