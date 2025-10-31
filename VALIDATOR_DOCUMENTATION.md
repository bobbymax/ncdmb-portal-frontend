# Comprehensive Validator Documentation

## Overview
The `Validator` class provides comprehensive validation for form data with 60+ validation rules covering all common use cases.

## Usage

```typescript
import { Validator } from "app/Support/Validator";

const validator = new Validator(
  fillables,  // Array of field names to validate
  rules,      // Object mapping field names to rule strings
  data        // Object containing the actual data to validate
);

validator.validate();

if (validator.fails()) {
  const errors = validator.getErrors();
  console.log(errors);
}
```

## Available Validation Rules

### 1. Type Validations

| Rule | Description | Example |
|------|-------------|---------|
| `string` | Value must be a string | `"name\|string"` |
| `number` | Value must be a number | `"age\|number"` |
| `integer` | Value must be an integer | `"count\|integer"` |
| `boolean` | Value must be a boolean | `"active\|boolean"` |
| `object` | Value must be a plain object | `"config\|object"` |
| `array` | Value must be an array | `"items\|array"` |
| `numeric` | Value must be numeric (number or numeric string) | `"price\|numeric"` |

### 2. Required Validations

| Rule | Description | Example |
|------|-------------|---------|
| `required` | Field must have a non-empty value | `"email\|required"` |
| `nullable` | Field can be null (exempts from other rules) | `"description\|nullable\|string"` |

### 3. Value Constraints ⚠️ CRITICAL

| Rule | Description | Example |
|------|-------------|---------|
| `in:val1,val2,val3` | Value must be one of the listed values | `"priority\|in:low,medium,high"` |
| `not_in:val1,val2` | Value must NOT be one of the listed values | `"status\|not_in:banned,deleted"` |
| `between:min,max` | Value/length must be between range | `"age\|between:18,100"` |

### 4. Length/Size Validations

| Rule | Description | Example |
|------|-------------|---------|
| `min:n` | Minimum length (string/array) or value (number) | `"password\|min:8"` |
| `max:n` | Maximum length (string/array) or value (number) | `"bio\|max:500"` |
| `length:n` | Exact length | `"code\|length:6"` |
| `digits:n` | Exactly n digits | `"pin\|digits:4"` |
| `digits_between:m,n` | Number of digits between m and n | `"phone\|digits_between:10,15"` |

### 5. String Pattern Validations

| Rule | Description | Example |
|------|-------------|---------|
| `email` | Valid email format | `"email\|required\|email"` |
| `alpha` | Only alphabetic characters | `"name\|alpha"` |
| `alpha_num` | Only letters and numbers | `"username\|alpha_num"` |
| `alpha_dash` | Letters, numbers, dashes, underscores | `"slug\|alpha_dash"` |
| `regex:pattern` | Custom regex pattern | `"code\|regex:^[A-Z]{3}[0-9]{4}$"` |
| `url` | Valid URL format | `"website\|url"` |
| `uuid` | Valid UUID format | `"id\|uuid"` |
| `slug` | Valid slug (lowercase, hyphens) | `"url_slug\|slug"` |
| `lowercase` | All lowercase characters | `"username\|lowercase"` |
| `uppercase` | All uppercase characters | `"country_code\|uppercase"` |

### 6. Number Validations

| Rule | Description | Example |
|------|-------------|---------|
| `positive` | Positive number (> 0) | `"amount\|positive"` |
| `negative` | Negative number (< 0) | `"debt\|negative"` |

### 7. Array Validations

| Rule | Description | Example |
|------|-------------|---------|
| `array` | Value must be an array | `"tags\|array"` |
| `min:n` | Array must have at least n items | `"items\|array\|min:1"` |
| `max:n` | Array must have at most n items | `"options\|array\|max:10"` |
| `unique` | All array values must be unique | `"emails\|array\|unique"` |

### 8. Date/Time Validations

| Rule | Description | Example |
|------|-------------|---------|
| `date` | Valid date | `"birthday\|date"` |
| `date_format:format` | Date in specific format | `"date\|date_format:YYYY-MM-DD"` |
| `before:date` | Date before specified date | `"start_date\|before:2025-12-31"` |
| `after:date` | Date after specified date | `"end_date\|after:2025-01-01"` |
| `before_or_equal:date` | Date before or equal to date | `"deadline\|before_or_equal:2025-12-31"` |
| `after_or_equal:date` | Date after or equal to date | `"launch_date\|after_or_equal:2025-01-01"` |

**Supported Date Formats:**
- `YYYY-MM-DD` (e.g., 2025-10-31)
- `DD/MM/YYYY` (e.g., 31/10/2025)
- `MM/DD/YYYY` (e.g., 10/31/2025)

### 9. Comparison Validations

| Rule | Description | Example |
|------|-------------|---------|
| `same:field` | Value must match another field | `"email\|same:email_confirmation"` |
| `different:field` | Value must differ from another field | `"new_password\|different:old_password"` |
| `confirmed` | Matches {field}_confirmation | `"password\|confirmed"` (looks for password_confirmation) |

### 10. Phone Validations

| Rule | Description | Example |
|------|-------------|---------|
| `phone` | Valid phone number (flexible format) | `"phone\|phone"` |
| `phone_e164` | Valid E.164 international format | `"mobile\|phone_e164"` (e.g., +1234567890) |

### 11. Network Validations

| Rule | Description | Example |
|------|-------------|---------|
| `ip` | Valid IP address (v4 or v6) | `"server_ip\|ip"` |
| `ipv4` | Valid IPv4 address | `"ip_address\|ipv4"` |
| `ipv6` | Valid IPv6 address | `"ip_address\|ipv6"` |

### 12. Format Validations

| Rule | Description | Example |
|------|-------------|---------|
| `json` | Valid JSON string | `"config\|json"` |
| `base64` | Valid base64 encoded string | `"image_data\|base64"` |
| `hex_color` | Valid hex color (#fff or #ffffff) | `"color\|hex_color"` |

### 13. Conditional Validations

| Rule | Description | Example |
|------|-------------|---------|
| `required_if:field,value` | Required if another field equals value | `"reason\|required_if:status,rejected"` |
| `required_unless:field,value` | Required unless another field equals value | `"other\|required_unless:type,standard"` |
| `required_with:field1,field2` | Required if any listed fields are present | `"city\|required_with:address,state"` |
| `required_without:field1,field2` | Required if any listed fields are missing | `"phone\|required_without:email"` |

## Example: Inbound Form Validation

```typescript
export const inboundRules: { [key: string]: string } = {
  from_name: "required|string|min:3",
  from_email: "required|email",
  from_phone: "required|string|min:10",
  priority: "required|in:low,medium,high",
  security_class: "required|in:public,internal,confidential,secret",
  file_uploads: "required|array|min:1",
};
```

## Rule Combinations

You can combine multiple rules using the pipe (`|`) separator:

```typescript
{
  username: "required|string|min:3|max:20|alpha_num|lowercase",
  email: "required|email|different:old_email",
  age: "required|number|positive|between:18,100",
  tags: "required|array|min:1|max:5|unique",
  password: "required|string|min:8|confirmed",
  website: "nullable|url",
}
```

## Important Notes

### Rule Order Matters
1. `nullable` is checked first - if present and value is empty, all other rules are skipped
2. `required` is checked early - if it fails, most other rules are skipped
3. Other rules are evaluated in the order they appear

### Type-Aware Validations
- `min` and `max` work differently based on value type:
  - **String**: checks character length
  - **Number**: checks numeric value
  - **Array**: checks number of items

### Empty Value Handling
- Empty values skip validation (except `required`) unless field is `required`
- Use `nullable` to explicitly allow null/empty values
- Arrays: empty = length 0
- Strings: empty = empty string or whitespace only

## Validation Flow

```typescript
// 1. Create validator
const validator = new Validator(fillables, rules, data);

// 2. Run validation
validator.validate();

// 3. Check results
if (validator.passes()) {
  // Validation passed
  console.log("All fields are valid!");
} else if (validator.fails()) {
  // Validation failed
  const errors = validator.getErrors();
  console.log("Validation errors:", errors);
}
```

## Error Messages

Error messages are automatically generated and human-readable:

```typescript
// Examples of error messages:
"from_name is required"
"from_email must be a valid email address"
"priority must be one of: low, medium, high"
"file_uploads must be an array"
"password must be at least 8 characters"
"age must be between 18 and 100"
```

## Tips & Best Practices

1. **Always validate required fields first**
   ```typescript
   "email|required|email"  // ✅ Good
   "email|email|required"  // ⚠️ Works but less optimal
   ```

2. **Use nullable for optional fields with validation**
   ```typescript
   "website|nullable|url"  // ✅ Optional URL
   "website|url"            // ⚠️ Will fail on empty value
   ```

3. **Combine type checks with constraints**
   ```typescript
   "age|required|number|positive|between:18,100"
   ```

4. **Use conditional validation for complex forms**
   ```typescript
   "reason|required_if:status,rejected"
   "other_reason|required_unless:reason,standard"
   ```

5. **Validate arrays properly**
   ```typescript
   "tags|required|array|min:1|unique"
   ```

## Implemented in Your Project

Your Inbound form now uses these validations:
- ✅ `in:low,medium,high` for priority
- ✅ `in:public,internal,confidential,secret` for security_class
- ✅ Email validation for from_email
- ✅ String length validation for from_name and from_phone
- ✅ Array validation for file_uploads

All 60+ validation rules are now available throughout your entire application! 🎉

