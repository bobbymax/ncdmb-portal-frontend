export class Validator {
  private fillables: string[];
  private rules: { [key: string]: string };
  private data: { [key: string]: any };
  private errors: string[] = [];

  constructor(
    fillabels: string[],
    rules: { [key: string]: string },
    data: { [key: string]: any }
  ) {
    this.fillables = fillabels;
    this.rules = rules;
    this.data = data;
  }

  /**
   * Validates all the data against the rules
   */
  public validate(): void {
    for (const field of this.fillables) {
      if (this.rules[field]) {
        this.applyRules(field, this.rules[field]);
      }
    }
  }

  /**
   * Checks if the validation passes
   */
  public passes(): boolean {
    return this.errors.length === 0;
  }

  /**
   * Checks if the validation fails
   */
  public fails(): boolean {
    return !this.passes();
  }

  /**
   * Retrieves validation errors
   */
  public getErrors(): string[] {
    return this.errors;
  }

  /**
   * Applies validation rules to a specific field
   */
  private applyRules(field: string, rules: string): void {
    const ruleList = rules.split("|");
    const value = this.data[field] || "";

    for (const rule of ruleList) {
      if (rule === "required" && !this.isRequiredValid(value)) {
        this.errors.push(`${field} is required`);
      }

      if (rule.startsWith("min:") && !this.isMinValid(value, rule)) {
        const minLength = rule.split(":")[1];
        this.errors.push(`${field} must be at least ${minLength} characters`);
      }

      if (rule.startsWith("max:") && !this.isMaxValid(value, rule)) {
        const maxLength = rule.split(":")[1];
        this.errors.push(`${field} must be at most ${maxLength} characters`);
      }

      if (rule === "email" && !this.isEmailValid(value)) {
        this.errors.push(`${field} must be a valid email address`);
      }
    }
  }

  /**
   * Rule checks
   */
  private isRequiredValid(value: any): boolean {
    return value !== null && value !== undefined && value !== "";
  }

  private isMinValid(value: string, rule: string): boolean {
    const minLength = parseInt(rule.split(":")[1], 10);
    return value.length >= minLength;
  }

  private isMaxValid(value: string, rule: string): boolean {
    const maxLength = parseInt(rule.split(":")[1], 10);
    return value.length <= maxLength;
  }

  private isEmailValid(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }
}
