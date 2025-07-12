declare module "@ckeditor/ckeditor5-react" {
  import * as React from "react";
  import { Editor } from "@ckeditor/ckeditor5-core";

  export interface ToolbarConfig {
    items?: string[];
    shouldNotGroupWhenFull?: boolean;
  }

  export interface HeadingOption {
    model: string;
    view: string;
    title: string;
    class?: string;
  }

  export interface LinkDecoratorAutomatic {
    mode: "automatic";
    callback: (url: string) => boolean;
    attributes: Record<string, string>;
  }

  export interface LinkDecoratorManual {
    mode: "manual";
    label: string;
    defaultValue?: boolean;
    attributes: Record<string, string>;
  }

  export interface CKEditorConfig {
    toolbar?: ToolbarConfig | string[];
    placeholder?: string;
    heading?: {
      options?: HeadingOption[];
    };
    image?: {
      toolbar?: string[];
      styles?: string[];
      resizeOptions?: any[];
    };
    link?: {
      decorators?: {
        [key: string]: LinkDecoratorAutomatic | LinkDecoratorManual;
      };
    };
    [key: string]: any; // allow other extensions/plugins
  }

  export interface CKEditorProps<TEditor = Editor> {
    editor: {
      create: (...args: any[]) => Promise<TEditor>;
    };
    data?: string;
    config?: CKEditorConfig;
    disabled?: boolean;
    onReady?: (editor: TEditor) => void;
    onChange?: (event: any, editor: TEditor) => void;
    onBlur?: (event: any, editor: TEditor) => void;
    onFocus?: (event: any, editor: TEditor) => void;
  }

  export const CKEditor: React.FC<CKEditorProps>;
}
