# TypeScript Web Application Framework

## Project Overview

This repository contains a **TypeScript-Based Web Application Framework** designed to be **modular, scalable, and easily maintainable**. It leverages core architectural principles like **repositories, services, middlewares, guards, and a custom validator system** to ensure a clean and efficient codebase. The goal of this project is to provide a strong foundation for building robust applications while keeping the structure flexible for future enhancements.

## Key Features

- **Repository Pattern**: Organizes data interaction logic, allowing developers to extend functionality in a clean, decoupled way.
- **Service Layer**: Handles API requests and authorization, promoting separation of concerns and reusability across the app.
- **Custom Form Validator**: A flexible class-based validator that checks form inputs against dynamic rules, providing clear error reporting.
- **Middleware and Guards**: Ensures protected routes and access control are easily implemented, particularly for authentication and authorization logic.
- **Extensible Rules Engine**: Each validation rule is a standalone class, making it easy to add new rules or extend existing ones.
- **Modular Structure**: Separate folders for Interfaces, Hooks, Handlers, Middlewares, Services, and Repositories to ensure a well-organized codebase.

## Folder Structure

- **Interfaces**: Defines contracts for data structures, making type-checking and maintainability easier.
- **Hooks**: Encapsulates reusable logic, such as form handling or HTTP requests.
- **Handlers**: Manages error handling and logging.
- **Repositories**: Contains entities and methods for data interactions (e.g., `getState()` methods for models like `StaffRepository`).
- **Services**: Manages API requests and authentication, allowing flexibility in communication with the backend (e.g., Laravel API).
- **Middlewares**: Handles pre-processing for requests, especially for authentication guards.
- **Guards**: Manages application route protection and layout guards.
- **Providers**: A flexible container for shared resources and bindings for easy access.

## Getting Started

To get started with this framework:

1. Clone this repository:

   ```bash
   git clone https://github.com/storm-web-framework.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Customize the services, repositories, and middleware to your application’s needs.

4. Run the application:
   ```bash
   npm run start
   ```

## Example Usage

Here's an example of how to use a repository in the application:

```bash
// Example: Accessing StaffRepository
const repo = new StaffRepository();
const staffState = repo.getState("staff");
```

### Form Validator

The Validator class accepts three arguments: fillables, rules, and data. It validates form inputs based on dynamic rules defined within each repository.

```bash
const validator = new Validator(fillables, rules, formData);
if (validator.fails()) {
  console.log(validator.errors);
} else {
  console.log('Validation Passed');
}
```

### Folder Structure Breakdown

```bash
src/
│
├── app/
│   ├── Interfaces/         # Define all data structures and types
│   ├── Hooks/              # Reusable logic (form handling, API requests)
│   ├── Handlers/           # Error handling classes
│   ├── Repositories/       # Data logic and custom methods for each entity
│   ├── Services/           # API requests and authentication
│   ├── Middlewares/        # Middleware for request processing
│   ├── Guards/             # Guards for protected routes
│   ├── Providers/          # Shared resources and bindings
│   └── init.ts             # Entry point to initialize services
│
└── index.ts                # Main entry point for the application
```

## Contributing

We’re looking for collaborators who can help make this project better! Here are some ways you can contribute:

- **Fork the repository** and make pull requests for any improvements.
- **Suggest new features:** We encourage feedback and suggestions on how to enhance the architecture or implement new patterns.
- **Extend the validation rules:** If you have ideas for new validation rules or a better way to handle existing ones, feel free to share.
- **Add Middleware or Services:** Contributions to improve the core middleware and service layer will be highly appreciated.

### How to Contribute

    1.	Fork the repository.
    2.	Create your feature branch (git checkout -b feature/new-feature).
    3.	Commit your changes (git commit -m 'Add some feature').
    4.	Push to the branch (git push origin feature/new-feature).
    5.	Open a pull request.

## Feedback & Suggestions

Feel free to open issues with any bugs, suggestions, or improvements you have. This project is a work in progress, and every bit of feedback makes it better!

This should give your project a professional, inviting presence while also encouraging community involvement and collaboration!

## License

This project is licensed under the MIT License.
