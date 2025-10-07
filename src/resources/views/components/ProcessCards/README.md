# ProcessCard Components Directory

## 📁 Purpose

This directory contains **dynamic ProcessCard components** that are loaded based on the `component` field in `ProcessCardResponseData`.

---

## 🎯 How It Works

### **1. ProcessCard Configuration**

When creating a ProcessCard in the admin panel (`/intelligence/process-cards/create`), you specify:

```typescript
ProcessCard {
  name: "Employee Budget Clearance"
  component: "EmployeeBudgetClear"  // ← Component file name (without .tsx)
  service: "budget"
  rules: { ... }
}
```

### **2. ProgressTracker Attachment**

The ProcessCard is attached to a ProgressTracker stage:

```typescript
ProgressTracker {
  id: 5
  order: 3
  process_card_id: 12  // ← Links to ProcessCard
  process_card: {
    name: "Employee Budget Clearance"
    component: "EmployeeBudgetClear"
    ...
  }
}
```

### **3. Dynamic Component Loading**

When a document reaches that stage, `ProcessGeneratorTab` dynamically loads the component:

```typescript
// Automatically imports from: ../ProcessCards/EmployeeBudgetClear.tsx
import EmployeeBudgetClear from "../ProcessCards/EmployeeBudgetClear";
```

---

## 📦 Component Template

Every ProcessCard component receives these props:

```typescript
interface ProcessCardProps {
  processCard: ProcessCardResponseData; // The ProcessCard configuration
  currentProcess: ProgressTrackerResponseData; // Current ProgressTracker stage
  document: DocumentResponseData | null; // Current document
}
```

### **Example Component:**

```tsx
import React from "react";
import { ProcessCardResponseData } from "@/app/Repositories/ProcessCard/data";
import { ProgressTrackerResponseData } from "@/app/Repositories/ProgressTracker/data";
import { DocumentResponseData } from "@/app/Repositories/Document/data";

interface MyProcessCardProps {
  processCard: ProcessCardResponseData;
  currentProcess: ProgressTrackerResponseData;
  document: DocumentResponseData | null;
}

const MyProcessCard: React.FC<MyProcessCardProps> = ({
  processCard,
  currentProcess,
  document,
}) => {
  return (
    <div className="my-process-card">
      <h5>{processCard.name}</h5>
      <p>
        Stage {currentProcess.order}: {currentProcess.stage?.name}
      </p>

      {/* Your custom logic here */}
    </div>
  );
};

export default MyProcessCard;
```

---

## 🎨 Creating a New ProcessCard Component

### **Step 1: Create Component File**

Create a new file in this directory:

```
src/resources/views/components/ProcessCards/YourComponentName.tsx
```

### **Step 2: Use the Template**

```tsx
import React from "react";
import { ProcessCardResponseData } from "@/app/Repositories/ProcessCard/data";
import { ProgressTrackerResponseData } from "@/app/Repositories/ProgressTracker/data";
import { DocumentResponseData } from "@/app/Repositories/Document/data";

interface YourComponentNameProps {
  processCard: ProcessCardResponseData;
  currentProcess: ProgressTrackerResponseData;
  document: DocumentResponseData | null;
}

const YourComponentName: React.FC<YourComponentNameProps> = ({
  processCard,
  currentProcess,
  document,
}) => {
  // Access ProcessCard rules
  const rules = processCard.rules;

  // Access payment (if document is payment-related)
  const payment = document?.documentable;

  return (
    <div className="your-component-card">
      <h5>{processCard.name}</h5>

      {/* Your custom UI here */}
    </div>
  );
};

export default YourComponentName;
```

### **Step 3: Create ProcessCard in Admin**

Navigate to `/intelligence/process-cards/create` and set:

- **Name**: "Your Process Card Name"
- **Component**: "YourComponentName" (exact file name without .tsx)
- **Service**: "your-service"
- **Rules**: Configure as needed

### **Step 4: Attach to ProgressTracker**

When creating/editing a ProgressTracker, select your ProcessCard from the dropdown.

---

## 🔄 Available Data

### **ProcessCard Rules**

Access all configured rules via `processCard.rules`:

```typescript
processCard.rules.currency; // "NGN"
processCard.rules.transaction; // "debit" | "credit"
processCard.rules.generate_transactions; // boolean
processCard.rules.auto_settle_fund; // boolean
processCard.rules.min_stage_order; // number
processCard.rules.execute_at_stages; // number[]
// ... all 47+ properties available!
```

### **Current Stage Info**

```typescript
currentProcess.order; // Stage order (1, 2, 3...)
currentProcess.stage?.name; // Stage name
currentProcess.process_card_id; // ProcessCard ID
currentProcess.permission; // "r" | "rw" | "rwx"
```

### **Document Data**

```typescript
document?.ref; // Document reference
document?.documentable_type; // "App\Models\Payment"
document?.documentable; // The actual payment/claim/etc.
document?.progress_tracker_id; // Current stage ID
```

---

## 📋 Example Components

### **1. EmployeeBudgetClear** (Example)

File: `EmployeeBudgetClear.tsx`

Purpose: Clear employee budget allocation

Features:

- Shows ProcessCard configuration
- Displays current stage
- Shows document reference
- Custom action button

### **2. VendorPaymentApproval** (Create this)

File: `VendorPaymentApproval.tsx`

Purpose: Approve vendor payments

Example:

```tsx
const VendorPaymentApproval: React.FC<Props> = ({
  processCard,
  currentProcess,
  document,
}) => {
  const payment = document?.documentable as PaymentResponseData;

  const handleApprove = () => {
    // Approval logic
  };

  return (
    <div className="card">
      <div className="card-body">
        <h5>Vendor Payment Approval</h5>
        <p>Amount: ₦{payment?.total_approved_amount}</p>
        <button onClick={handleApprove}>Approve Payment</button>
      </div>
    </div>
  );
};
```

### **3. ExpenseValidation** (Create this)

File: `ExpenseValidation.tsx`

Purpose: Validate expense claims

### **4. FundSettlement** (Create this)

File: `FundSettlement.tsx`

Purpose: Settle funds at final stage

---

## 🎯 Best Practices

### **1. Naming Convention**

- Use PascalCase for component names
- Match the filename exactly
- Be descriptive: `VendorPaymentApproval` not `VPA`

### **2. Error Handling**

- Always check if data exists before using it
- Provide fallback UI for missing data
- Show loading states

### **3. User Experience**

- Show clear stage information
- Display relevant ProcessCard rules
- Provide action buttons
- Show success/error messages

### **4. Type Safety**

- Use TypeScript interfaces
- Import proper types
- Type your props correctly

---

## 🔍 Debugging

### **Check Component Loading**

Console will show:

```
Loading ProcessCard component: EmployeeBudgetClear
```

### **Check Component Not Found**

If component doesn't exist, you'll see:

```
Failed to load ProcessCard component: NonExistentComponent
```

And a warning UI will show:

```
⚠️ ProcessCard component "NonExistentComponent" not found.
```

### **Check Props Received**

Add to your component:

```tsx
useEffect(() => {
  console.log("ProcessCard Props:", {
    processCard,
    currentProcess,
    document,
  });
}, [processCard, currentProcess, document]);
```

---

## 📝 Summary

1. ✅ Create component file in this directory
2. ✅ Use proper TypeScript props interface
3. ✅ Export as default
4. ✅ Create ProcessCard in admin with matching component name
5. ✅ Attach ProcessCard to ProgressTracker
6. ✅ Component loads automatically when stage is reached!

**The system handles all the dynamic loading for you!** 🎉

---

## 🚀 Next Steps

Create your ProcessCard components based on your business needs:

- Budget clearance
- Payment approvals
- Expense validations
- Fund settlements
- Reconciliation workflows
- Custom data collection
- Signature requests
- Document generation

**Each stage can have its own unique ProcessCard component!**
