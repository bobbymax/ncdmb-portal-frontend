import React, { useEffect, useState } from "react";
import { useTemplateBoard } from "app/Context/TemplateBoardContext";
import { DocumentCategoryResponseData } from "@/app/Repositories/DocumentCategory/data";
import { TemplateResponseData } from "@/app/Repositories/Template/data";
import { BaseRepository } from "@/app/Repositories/BaseRepository";
import { useAuth } from "app/Context/AuthContext";
import Button from "resources/views/components/forms/Button";
import { toast } from "react-toastify";

interface CategorySelectorProps {
  Repository: BaseRepository;
  category?: DocumentCategoryResponseData | null;
  template?: TemplateResponseData | null;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  Repository,
  category,
  template,
}) => {
  const { state, actions } = useTemplateBoard();
  const { staff } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize category and template from props
  useEffect(() => {
    if (category && !state.category) {
      actions.setCategory(category);
    }
    if (template && !state.template) {
      actions.setTemplate(template);
    }
  }, [category, template, state.category, state.template, actions]);

  // Initialize document state when category is set
  useEffect(() => {
    if (state.category && staff) {
      actions.updateDocumentState({
        documentable_id: 0,
        user_id: staff.id,
        department_id: staff.department_id,
        document_category_id: state.category.id,
        document_type_id: state.category.document_type_id,
        workflow_id: state.category.workflow_id,
      });
    }
  }, [state.category, staff, actions]);

  const handleCategorySelect = async (
    selectedCategory: DocumentCategoryResponseData
  ) => {
    setIsLoading(true);
    try {
      actions.setCategory(selectedCategory);
      toast.success(
        `Category "${selectedCategory.name}" selected successfully`
      );
    } catch (error) {
      console.error("Error selecting category:", error);
      toast.error("Failed to select category");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = async (
    selectedTemplate: TemplateResponseData
  ) => {
    setIsLoading(true);
    try {
      actions.setTemplate(selectedTemplate);
      toast.success(
        `Template "${selectedTemplate.name}" selected successfully`
      );
    } catch (error) {
      console.error("Error selecting template:", error);
      toast.error("Failed to select template");
    } finally {
      setIsLoading(false);
    }
  };

  if (!state.category) {
    return (
      <div className="category__selector__container">
        <div className="category__selector__header">
          <h4>Select Document Category</h4>
          <p>
            Choose a document category to get started with template building
          </p>
        </div>

        <div className="category__selector__content">
          <div className="category__selector__loading">
            <i className="ri-loader-4-line"></i>
            <p>Loading available categories...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!state.template) {
    return (
      <div className="category__selector__container">
        <div className="category__selector__header">
          <h4>Select Template</h4>
          <p>
            Choose a template for category:{" "}
            <strong>{state.category.name}</strong>
          </p>
        </div>

        <div className="category__selector__content">
          <div className="category__selector__loading">
            <i className="ri-loader-4-line"></i>
            <p>Loading available templates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="category__selector__container">
      <div className="category__selector__header">
        <h4>Document Configuration</h4>
        <p>Category and template selected successfully</p>
      </div>

      <div className="category__selector__content">
        <div className="category__info__card">
          <div className="category__info__header">
            <i className="ri-file-list-3-line"></i>
            <h5>Selected Category</h5>
          </div>
          <div className="category__info__body">
            <p>
              <strong>Name:</strong> {state.category.name}
            </p>
            <p>
              <strong>Service:</strong> {state.category.service}
            </p>
            <p>
              <strong>Type:</strong> {state.category.document_type || "N/A"}
            </p>
          </div>
        </div>

        <div className="template__info__card">
          <div className="template__info__header">
            <i className="ri-layout-line"></i>
            <h5>Selected Template</h5>
          </div>
          <div className="template__info__body">
            <p>
              <strong>Name:</strong> {state.template.name}
            </p>
            <p>
              <strong>Footer:</strong> {state.template.footer || "No footer"}
            </p>
            <p>
              <strong>Header:</strong> {state.template.header || "N/A"}
            </p>
          </div>
        </div>

        <div className="category__selector__actions">
          <Button
            label="Change Category"
            icon="ri-edit-line"
            handleClick={() => actions.setCategory(null)}
            variant="primary"
            size="sm"
          />
          <Button
            label="Change Template"
            icon="ri-edit-line"
            handleClick={() => actions.setTemplate(null)}
            variant="primary"
            size="sm"
          />
        </div>
      </div>
    </div>
  );
};

export default CategorySelector;
