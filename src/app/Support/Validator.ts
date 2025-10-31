import _ from "lodash";

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
    const value = this.data[field];

    // Check for nullable rule first
    const isNullable = ruleList.includes("nullable");
    if (isNullable && (value === null || value === undefined || value === "")) {
      return; // Skip all other validations
    }

    for (const rule of ruleList) {
      // Skip nullable rule itself
      if (rule === "nullable") continue;

      // Required validation
      if (rule === "required" && !this.isRequiredValid(value)) {
        this.errors.push(`${field} is required`);
        continue;
      }

      // Skip other validations if value is empty and not required
      if (!this.isRequiredValid(value) && rule !== "required") {
        continue;
      }

      // Type validations
      if (rule === "string" && !this.isString(value)) {
        this.errors.push(`${field} must be a string`);
      }

      if (rule === "number" && !this.isNumber(value)) {
        this.errors.push(`${field} must be a number`);
      }

      if (rule === "integer" && !this.isInteger(value)) {
        this.errors.push(`${field} must be an integer`);
      }

      if (rule === "boolean" && !this.isBoolean(value)) {
        this.errors.push(`${field} must be a boolean`);
      }

      if (rule === "object" && !this.isObject(value)) {
        this.errors.push(`${field} must be an object`);
      }

      if (rule === "array" && !this.isValidArray(value)) {
        this.errors.push(`${field} must be an array`);
      }

      if (rule === "numeric" && !this.isNumeric(value)) {
        this.errors.push(`${field} must be numeric`);
      }

      // Value constraint validations
      if (rule.startsWith("in:") && !this.isInList(value, rule)) {
        const values = rule.substring(3).split(",").join(", ");
        this.errors.push(`${field} must be one of: ${values}`);
      }

      if (rule.startsWith("not_in:") && !this.isNotInList(value, rule)) {
        const values = rule.substring(7).split(",").join(", ");
        this.errors.push(`${field} must not be one of: ${values}`);
      }

      if (rule.startsWith("between:") && !this.isBetween(value, rule)) {
        const [min, max] = rule.substring(8).split(",");
        this.errors.push(`${field} must be between ${min} and ${max}`);
      }

      // Length/Size validations
      if (rule.startsWith("min:") && !this.isMinValid(value, rule)) {
        const minValue = rule.split(":")[1];
        const type = this.getValueType(value);
        this.errors.push(
          `${field} must be at least ${minValue} ${
            type === "array" ? "items" : type === "number" ? "" : "characters"
          }`
        );
      }

      if (rule.startsWith("max:") && !this.isMaxValid(value, rule)) {
        const maxValue = rule.split(":")[1];
        const type = this.getValueType(value);
        this.errors.push(
          `${field} must be at most ${maxValue} ${
            type === "array" ? "items" : type === "number" ? "" : "characters"
          }`
        );
      }

      if (rule.startsWith("length:") && !this.isExactLength(value, rule)) {
        const length = rule.split(":")[1];
        this.errors.push(`${field} must be exactly ${length} characters`);
      }

      if (rule.startsWith("digits:") && !this.isDigits(value, rule)) {
        const digits = rule.split(":")[1];
        this.errors.push(`${field} must be exactly ${digits} digits`);
      }

      if (
        rule.startsWith("digits_between:") &&
        !this.isDigitsBetween(value, rule)
      ) {
        const [min, max] = rule.substring(15).split(",");
        this.errors.push(`${field} must be between ${min} and ${max} digits`);
      }

      // String pattern validations
      if (rule === "email" && !this.isEmailValid(value)) {
        this.errors.push(`${field} must be a valid email address`);
      }

      if (rule === "alpha" && !this.isAlpha(value)) {
        this.errors.push(`${field} must contain only letters`);
      }

      if (rule === "alpha_num" && !this.isAlphaNum(value)) {
        this.errors.push(`${field} must contain only letters and numbers`);
      }

      if (rule === "alpha_dash" && !this.isAlphaDash(value)) {
        this.errors.push(
          `${field} must contain only letters, numbers, dashes, and underscores`
        );
      }

      if (rule.startsWith("regex:") && !this.isRegexValid(value, rule)) {
        this.errors.push(`${field} format is invalid`);
      }

      if (rule === "url" && !this.isUrl(value)) {
        this.errors.push(`${field} must be a valid URL`);
      }

      if (rule === "uuid" && !this.isUuid(value)) {
        this.errors.push(`${field} must be a valid UUID`);
      }

      if (rule === "slug" && !this.isSlug(value)) {
        this.errors.push(
          `${field} must be a valid slug (lowercase letters, numbers, and hyphens)`
        );
      }

      if (rule === "lowercase" && !this.isLowercase(value)) {
        this.errors.push(`${field} must be lowercase`);
      }

      if (rule === "uppercase" && !this.isUppercase(value)) {
        this.errors.push(`${field} must be uppercase`);
      }

      // Number validations
      if (rule === "positive" && !this.isPositive(value)) {
        this.errors.push(`${field} must be a positive number`);
      }

      if (rule === "negative" && !this.isNegative(value)) {
        this.errors.push(`${field} must be a negative number`);
      }

      // Array validations
      if (rule === "unique" && !this.isUniqueArray(value)) {
        this.errors.push(`${field} must contain unique values`);
      }

      // Date validations
      if (rule === "date" && !this.isDate(value)) {
        this.errors.push(`${field} must be a valid date`);
      }

      if (rule.startsWith("date_format:") && !this.isDateFormat(value, rule)) {
        const format = rule.split(":")[1];
        this.errors.push(`${field} must be in format ${format}`);
      }

      if (rule.startsWith("before:") && !this.isBefore(value, rule)) {
        const date = rule.split(":")[1];
        this.errors.push(`${field} must be before ${date}`);
      }

      if (rule.startsWith("after:") && !this.isAfter(value, rule)) {
        const date = rule.split(":")[1];
        this.errors.push(`${field} must be after ${date}`);
      }

      if (
        rule.startsWith("before_or_equal:") &&
        !this.isBeforeOrEqual(value, rule)
      ) {
        const date = rule.split(":")[1];
        this.errors.push(`${field} must be before or equal to ${date}`);
      }

      if (
        rule.startsWith("after_or_equal:") &&
        !this.isAfterOrEqual(value, rule)
      ) {
        const date = rule.split(":")[1];
        this.errors.push(`${field} must be after or equal to ${date}`);
      }

      // Comparison validations
      if (rule.startsWith("same:") && !this.isSameAs(field, value, rule)) {
        const otherField = rule.split(":")[1];
        this.errors.push(`${field} must match ${otherField}`);
      }

      if (
        rule.startsWith("different:") &&
        !this.isDifferentFrom(field, value, rule)
      ) {
        const otherField = rule.split(":")[1];
        this.errors.push(`${field} must be different from ${otherField}`);
      }

      if (rule === "confirmed" && !this.isConfirmed(field, value)) {
        this.errors.push(`${field} confirmation does not match`);
      }

      // Phone validations
      if (rule === "phone" && !this.isPhone(value)) {
        this.errors.push(`${field} must be a valid phone number`);
      }

      if (rule === "phone_e164" && !this.isPhoneE164(value)) {
        this.errors.push(`${field} must be a valid E.164 phone number`);
      }

      // Network validations
      if (rule === "ip" && !this.isIp(value)) {
        this.errors.push(`${field} must be a valid IP address`);
      }

      if (rule === "ipv4" && !this.isIpv4(value)) {
        this.errors.push(`${field} must be a valid IPv4 address`);
      }

      if (rule === "ipv6" && !this.isIpv6(value)) {
        this.errors.push(`${field} must be a valid IPv6 address`);
      }

      // Format validations
      if (rule === "json" && !this.isJson(value)) {
        this.errors.push(`${field} must be valid JSON`);
      }

      if (rule === "base64" && !this.isBase64(value)) {
        this.errors.push(`${field} must be valid base64`);
      }

      if (rule === "hex_color" && !this.isHexColor(value)) {
        this.errors.push(`${field} must be a valid hex color`);
      }

      // Conditional validations
      if (
        rule.startsWith("required_if:") &&
        !this.isRequiredIf(field, value, rule)
      ) {
        const [otherField, otherValue] = rule.substring(12).split(",");
        this.errors.push(
          `${field} is required when ${otherField} is ${otherValue}`
        );
      }

      if (
        rule.startsWith("required_unless:") &&
        !this.isRequiredUnless(field, value, rule)
      ) {
        const [otherField, otherValue] = rule.substring(16).split(",");
        this.errors.push(
          `${field} is required unless ${otherField} is ${otherValue}`
        );
      }

      if (
        rule.startsWith("required_with:") &&
        !this.isRequiredWith(field, value, rule)
      ) {
        const fields = rule.substring(14);
        this.errors.push(`${field} is required when ${fields} is present`);
      }

      if (
        rule.startsWith("required_without:") &&
        !this.isRequiredWithout(field, value, rule)
      ) {
        const fields = rule.substring(17);
        this.errors.push(`${field} is required when ${fields} is not present`);
      }
    }
  }

  /**
   * Get value type for error messages
   */
  private getValueType(value: any): string {
    if (_.isArray(value)) return "array";
    if (_.isNumber(value)) return "number";
    return "string";
  }

  /**
   * Basic type checks
   */
  private isRequiredValid(value: any): boolean {
    if (_.isArray(value)) return value.length > 0;
    if (_.isString(value)) return value.trim() !== "";
    return value !== null && value !== undefined && value !== "";
  }

  private isString(value: any): boolean {
    return _.isString(value);
  }

  private isNumber(value: any): boolean {
    return _.isNumber(value) && !_.isNaN(value);
  }

  private isInteger(value: any): boolean {
    return _.isInteger(value);
  }

  private isBoolean(value: any): boolean {
    return _.isBoolean(value);
  }

  private isObject(value: any): boolean {
    return _.isPlainObject(value);
  }

  private isValidArray(value: any): boolean {
    return _.isArray(value);
  }

  private isNumeric(value: any): boolean {
    if (_.isNumber(value)) return !_.isNaN(value);
    if (_.isString(value))
      return !isNaN(parseFloat(value)) && isFinite(Number(value));
    return false;
  }

  /**
   * Value constraint checks
   */
  private isInList(value: any, rule: string): boolean {
    const list = rule
      .substring(3)
      .split(",")
      .map((v) => v.trim());
    return list.includes(String(value));
  }

  private isNotInList(value: any, rule: string): boolean {
    const list = rule
      .substring(7)
      .split(",")
      .map((v) => v.trim());
    return !list.includes(String(value));
  }

  private isBetween(value: any, rule: string): boolean {
    const [min, max] = rule
      .substring(8)
      .split(",")
      .map((v) => parseFloat(v));
    if (_.isNumber(value)) {
      return value >= min && value <= max;
    }
    if (_.isString(value)) {
      return value.length >= min && value.length <= max;
    }
    if (_.isArray(value)) {
      return value.length >= min && value.length <= max;
    }
    return false;
  }

  /**
   * Length/Size checks
   */
  private isMinValid(value: any, rule: string): boolean {
    const minValue = parseFloat(rule.split(":")[1]);
    if (_.isNumber(value)) return value >= minValue;
    if (_.isString(value)) return value.length >= minValue;
    if (_.isArray(value)) return value.length >= minValue;
    return false;
  }

  private isMaxValid(value: any, rule: string): boolean {
    const maxValue = parseFloat(rule.split(":")[1]);
    if (_.isNumber(value)) return value <= maxValue;
    if (_.isString(value)) return value.length <= maxValue;
    if (_.isArray(value)) return value.length <= maxValue;
    return false;
  }

  private isExactLength(value: any, rule: string): boolean {
    const length = parseInt(rule.split(":")[1], 10);
    if (_.isString(value)) return value.length === length;
    if (_.isArray(value)) return value.length === length;
    return false;
  }

  private isDigits(value: any, rule: string): boolean {
    const digits = parseInt(rule.split(":")[1], 10);
    const digitStr = String(value).replace(/\D/g, "");
    return digitStr.length === digits;
  }

  private isDigitsBetween(value: any, rule: string): boolean {
    const [min, max] = rule
      .substring(15)
      .split(",")
      .map((v) => parseInt(v, 10));
    const digitStr = String(value).replace(/\D/g, "");
    return digitStr.length >= min && digitStr.length <= max;
  }

  /**
   * String pattern checks
   */
  private isEmailValid(value: any): boolean {
    if (!_.isString(value)) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  private isAlpha(value: any): boolean {
    if (!_.isString(value)) return false;
    return /^[a-zA-Z]+$/.test(value);
  }

  private isAlphaNum(value: any): boolean {
    if (!_.isString(value)) return false;
    return /^[a-zA-Z0-9]+$/.test(value);
  }

  private isAlphaDash(value: any): boolean {
    if (!_.isString(value)) return false;
    return /^[a-zA-Z0-9_-]+$/.test(value);
  }

  private isRegexValid(value: any, rule: string): boolean {
    if (!_.isString(value)) return false;
    const pattern = rule.substring(6);
    try {
      const regex = new RegExp(pattern);
      return regex.test(value);
    } catch {
      return false;
    }
  }

  private isUrl(value: any): boolean {
    if (!_.isString(value)) return false;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  private isUuid(value: any): boolean {
    if (!_.isString(value)) return false;
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  private isSlug(value: any): boolean {
    if (!_.isString(value)) return false;
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
  }

  private isLowercase(value: any): boolean {
    if (!_.isString(value)) return false;
    return value === value.toLowerCase();
  }

  private isUppercase(value: any): boolean {
    if (!_.isString(value)) return false;
    return value === value.toUpperCase();
  }

  /**
   * Number checks
   */
  private isPositive(value: any): boolean {
    return this.isNumber(value) && value > 0;
  }

  private isNegative(value: any): boolean {
    return this.isNumber(value) && value < 0;
  }

  /**
   * Array checks
   */
  private isUniqueArray(value: any): boolean {
    if (!_.isArray(value)) return false;
    return _.uniq(value).length === value.length;
  }

  /**
   * Date checks
   */
  private isDate(value: any): boolean {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  private isDateFormat(value: any, rule: string): boolean {
    if (!_.isString(value)) return false;
    const format = rule.split(":")[1];

    // Simple format checks
    if (format === "YYYY-MM-DD") {
      return /^\d{4}-\d{2}-\d{2}$/.test(value);
    }
    if (format === "DD/MM/YYYY") {
      return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
    }
    if (format === "MM/DD/YYYY") {
      return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
    }

    return this.isDate(value);
  }

  private isBefore(value: any, rule: string): boolean {
    const compareDate = rule.split(":")[1];
    const valueDate = new Date(value);
    const targetDate = new Date(compareDate);
    return valueDate.getTime() < targetDate.getTime();
  }

  private isAfter(value: any, rule: string): boolean {
    const compareDate = rule.split(":")[1];
    const valueDate = new Date(value);
    const targetDate = new Date(compareDate);
    return valueDate.getTime() > targetDate.getTime();
  }

  private isBeforeOrEqual(value: any, rule: string): boolean {
    const compareDate = rule.split(":")[1];
    const valueDate = new Date(value);
    const targetDate = new Date(compareDate);
    return valueDate.getTime() <= targetDate.getTime();
  }

  private isAfterOrEqual(value: any, rule: string): boolean {
    const compareDate = rule.split(":")[1];
    const valueDate = new Date(value);
    const targetDate = new Date(compareDate);
    return valueDate.getTime() >= targetDate.getTime();
  }

  /**
   * Comparison checks
   */
  private isSameAs(field: string, value: any, rule: string): boolean {
    const otherField = rule.split(":")[1];
    return value === this.data[otherField];
  }

  private isDifferentFrom(field: string, value: any, rule: string): boolean {
    const otherField = rule.split(":")[1];
    return value !== this.data[otherField];
  }

  private isConfirmed(field: string, value: any): boolean {
    const confirmField = `${field}_confirmation`;
    return value === this.data[confirmField];
  }

  /**
   * Phone checks
   */
  private isPhone(value: any): boolean {
    if (!_.isString(value)) return false;
    // Basic phone validation (10-15 digits with optional +, spaces, dashes, parentheses)
    return /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(
      value
    );
  }

  private isPhoneE164(value: any): boolean {
    if (!_.isString(value)) return false;
    // E.164 format: +[country code][number] (max 15 digits)
    return /^\+[1-9]\d{1,14}$/.test(value);
  }

  /**
   * Network checks
   */
  private isIp(value: any): boolean {
    return this.isIpv4(value) || this.isIpv6(value);
  }

  private isIpv4(value: any): boolean {
    if (!_.isString(value)) return false;
    const ipv4Regex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Regex.test(value);
  }

  private isIpv6(value: any): boolean {
    if (!_.isString(value)) return false;
    const ipv6Regex =
      /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    return ipv6Regex.test(value);
  }

  /**
   * Format checks
   */
  private isJson(value: any): boolean {
    if (!_.isString(value)) return false;
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }

  private isBase64(value: any): boolean {
    if (!_.isString(value)) return false;
    const base64Regex =
      /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    return base64Regex.test(value);
  }

  private isHexColor(value: any): boolean {
    if (!_.isString(value)) return false;
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
  }

  /**
   * Conditional checks
   */
  private isRequiredIf(field: string, value: any, rule: string): boolean {
    const [otherField, otherValue] = rule.substring(12).split(",");
    if (String(this.data[otherField]) === otherValue.trim()) {
      return this.isRequiredValid(value);
    }
    return true;
  }

  private isRequiredUnless(field: string, value: any, rule: string): boolean {
    const [otherField, otherValue] = rule.substring(16).split(",");
    if (String(this.data[otherField]) !== otherValue.trim()) {
      return this.isRequiredValid(value);
    }
    return true;
  }

  private isRequiredWith(field: string, value: any, rule: string): boolean {
    const fields = rule.substring(14).split(",");
    const hasAnyField = fields.some((f) =>
      this.isRequiredValid(this.data[f.trim()])
    );
    if (hasAnyField) {
      return this.isRequiredValid(value);
    }
    return true;
  }

  private isRequiredWithout(field: string, value: any, rule: string): boolean {
    const fields = rule.substring(17).split(",");
    const missingAnyField = fields.some(
      (f) => !this.isRequiredValid(this.data[f.trim()])
    );
    if (missingAnyField) {
      return this.isRequiredValid(value);
    }
    return true;
  }
}
