/* eslint-disable import/no-anonymous-default-export */

// import plop from "plop";

export default function (plop) {
  plop.setHelper("camelCase", (text) => {
    const camelCase = text.charAt(0).toLowerCase() + text.slice(1);
    return camelCase;
  });
  plop.setGenerator("resource", {
    description: "Generate Repository resources",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Enter the name of the repository",
      },
      {
        type: "input",
        name: "url",
        message: "Enter the server url",
      },
      {
        type: "input",
        name: "path",
        message: "Enter the frontend path for the repository",
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/app/Repositories/{{name}}/data.ts",
        templateFile: "templates/data.hbs",
      },
      {
        type: "add",
        path: "src/app/Repositories/{{name}}/columns.ts",
        templateFile: "templates/columns.hbs",
      },
      {
        type: "add",
        path: "src/app/Repositories/{{name}}/rules.ts",
        templateFile: "templates/rules.hbs",
      },
      {
        type: "add",
        path: "src/app/Repositories/{{name}}/views.ts",
        templateFile: "templates/views.hbs",
      },
      {
        type: "add",
        path: "src/app/Repositories/{{name}}/config.ts",
        templateFile: "templates/config.hbs",
      },
      {
        type: "add",
        path: "src/app/Repositories/{{name}}/{{name}}Repository.ts",
        templateFile: "templates/repository.hbs",
      },
      {
        type: "add",
        path: "src/resources/views/crud/{{name}}.tsx",
        templateFile: "templates/component.hbs",
      },
      {
        type: "append",
        path: "src/bootstrap/repositories.ts",
        pattern: "/* PLOP_INJECT_REPOSITORY_IMPORT */",
        template: `import {{name}}Repository from "app/Repositories/{{name}}/{{name}}Repository";`,
      },
      {
        type: "append",
        path: "src/bootstrap/repositories.ts",
        pattern: "/* PLOP_INJECT_REPOSITORY_INSTANCE */",
        template: `new {{name}}Repository(),`,
      },
    ],
  });
}
