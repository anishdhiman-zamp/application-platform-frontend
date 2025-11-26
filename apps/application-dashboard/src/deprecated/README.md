# Deprecated Code Documentation

This folder contains code that is **no longer being used** in the application. The code in this folder has been deprecated and is kept for reference purposes only. **Do not use this code in any new development.**

## Overview

The deprecated folder contains code that is no longer in use. These files have been replaced, removed from active use, or are no longer needed. They are maintained here for historical reference only.

## Contents

### APIs (`apis/`)

Deprecated API-related files:

- `paymentApi.types.ts` - Legacy payment API type definitions
- `payments.ts` - Legacy payment API implementations
- `policies.types.ts` - Legacy policy API type definitions

### Modules (`modules/`)

#### Admin Module (`modules/admin/`)

Legacy admin functionality for dataset management:

- `AdminDatasetActions.tsx` - Dataset action handlers
- `AdminDatasetByIdV2.tsx` - Dataset detail view (v2)
- `AdminDatasetDag.tsx` - Dataset DAG visualization
- `AdminDatasetDelete.tsx` - Dataset deletion functionality
- `AdminDatasetListing.tsx` - Dataset listing component
- `AdminDatasetTransform.tsx` - Dataset transformation logic
- `AdminEditTemplate.tsx` - Template editing functionality
- `AdminHeader.tsx` - Admin header component
- `CreateDataset.tsx` - Dataset creation component
- `admin.constants.ts` - Admin-related constants
- `admin.types.ts` - Admin type definitions
- `admin.utils.ts` - Admin utility functions
- `components/previewSidebar/` - Preview sidebar components
  - `EditConfig.tsx` - Configuration editor
  - `FormattedJson.tsx` - JSON formatter
  - `index.tsx` - Preview sidebar main component

#### Dual Admin Module (`modules/dualAdmin/`)

Legacy dual admin approval functionality:

- `DualAdminCard.tsx` - Dual admin card component
- `DualAdminHome.tsx` - Dual admin home page
- `components.tsx/` - Dual admin components
  - `ApprovalsDropdown.tsx` - Approvals dropdown component
  - `PolicyApproveCard.tsx` - Policy approval card
  - `RequestApprovalDialogue.tsx` - Approval request dialogue

#### Payments Module (`modules/payments/`)

Legacy payments functionality:

**Core Files:**

- `AccountsList.tsx` - Accounts listing component
- `CustomisePaymentsAccess.tsx` - Payment access customization
- `PaymentsHome.tsx` - Payments home page
- `payments.constant.ts` - Payment-related constants
- `payments.types.ts` - Payment type definitions
- `components/PaymentActions.tsx` - Payment action handlers

**Connect Account (`connect-account/`):**

- `ConnectAccount.tsx` - Main connect account component
- `connect-account-dummydata.ts` - Dummy data for connect account
- `components/`:
  - `ConnectAccountGetStarted.tsx` - Get started component
  - `ConnectAccountSelectDataset.tsx` - Dataset selection
  - `DatasetColumnsMapping.tsx` - Column mapping component
  - `SelectAccountDataset.tsx` - Account dataset selector

**Move Money (`move-money/`):**

- `AmountDetailsStep.tsx` - Amount details step
- `MoveMoneyHome.tsx` - Move money home page
- `MoveMoneyMoreInfo.tsx` - Additional information component
- `ReviewMoneyTransfer.tsx` - Money transfer review
- `SelectBeneficiaryStep.tsx` - Beneficiary selection step
- `SelectSourceAccount.tsx` - Source account selection
- `SuccessMoveMoney.tsx` - Success page for money transfer
- `moveMoney.context.tsx` - Move money context provider
- `components/`:
  - `AccountWithLogo.tsx` - Account display with logo
  - `DropdownToggle.tsx` - Dropdown toggle component
  - `MoveMoneyButton.tsx` - Move money button
  - `MoveMoneyTemplateListCard.tsx` - Template list card
  - `RecipientCard.tsx` - Recipient card component
  - `SelectAccountDropdown.tsx` - Account dropdown selector
  - `SelectBeneDropdown.tsx` - Beneficiary dropdown selector
  - `TemplateFilter.tsx` - Template filter component

**Payment Details (`payment-details/`):**

- `PaymentApprovals.tsx` - Payment approvals component
- `PaymentDetails.tsx` - Payment details component
- `PaymentDetailsSideDrawer.tsx` - Payment details side drawer
- `PaymentDetailsSkeleton.tsx` - Payment details skeleton loader
- `components/`:
  - `ApprovalDetailsBadge.tsx` - Approval details badge
  - `ApprovalSkeleton.tsx` - Approval skeleton loader
  - `ApprovalStatusCard.tsx` - Approval status card
  - `ApproveActionCard.tsx` - Approve action card

**Recipients (`recipients/`):**

- `AddRecipient.tsx` - Add recipient component
- `AddRecipientAccount.tsx` - Add recipient account component
- `RecipientDetails.tsx` - Recipient details component
- `RecipientsList.tsx` - Recipients list component
- `RecipientsSidedrawer.tsx` - Recipients side drawer
- `recipient.dummy.ts` - Dummy data for recipients
- `components/`:
  - `RecipientAccountCard.tsx` - Recipient account card
  - `RecipientCard.tsx` - Recipient card component
  - `RecipientCardSkeleton.tsx` - Recipient card skeleton loader

**Templates (`templates/`):**

- `TemplateListSideDrawer.tsx` - Template list side drawer
- `templates.constant.ts` - Template-related constants
- `components/`:
  - `CreateTemplatePopover.tsx` - Create template popover
  - `TemplateApproval.tsx` - Template approval component
  - `TemplateApprovalCard.tsx` - Template approval card
  - `TemplateCard.tsx` - Template card component
  - `TemplateList.tsx` - Template list component

**Share Resource (`share-resource/`):**

- `SharePaymentsPopup.tsx` - Share payments popup component

#### Policies Module (`modules/policies/`)

Legacy policy management functionality:

**Core Files:**

- `commons.tsx` - Common policy utilities
- `constants.ts` - Policy-related constants
- `types.ts` - Policy type definitions

**Components (`components/`):**

- `PolicyStepDetails.tsx` - Policy step details component
- `ReviewPolicyUpdatePopover.tsx` - Policy update review popover
- `UpdatePolicyCard.tsx` - Update policy card component

**Create (`create/`):**

- `index.tsx` - Main create policy component
- `ApprovalFlow.tsx` - Approval flow component
- `ApprovalStep.tsx` - Approval step component
- `ApproverList.tsx` - Approver list component
- `AttributeInputDropdown.tsx` - Attribute input dropdown
- `AttributeMenuDropdown.tsx` - Attribute menu dropdown
- `PolicyQuorumDropdown.tsx` - Policy quorum dropdown
- `SequenceStep.tsx` - Sequence step component
- `constants.ts` - Create policy constants

**Listing (`listing/`):**

- `DetailsView.tsx` - Policy details view
- `ListView.tsx` - Policy list view
- `PoliciesListSideDrawer.tsx` - Policies list side drawer
- `PolicyActionsDropdown.tsx` - Policy actions dropdown
- `PolicyAttributeTags.tsx` - Policy attribute tags
- `PolicyCard.tsx` - Policy card component
- `PolicyDeleteConfirmPopup.tsx` - Policy delete confirmation popup

### Pages (`pages/`)

Legacy page components:

**Admin Pages (`pages/admin/`):**

- `page.tsx` - Main admin page
- `datasets/page.tsx` - Datasets listing page
- `datasets/[id]/page.tsx` - Dataset detail page
- `datasets/dag/page.tsx` - Dataset DAG page

**BFF Page (`pages/bff/`):**

- `page.tsx` - BFF page

**Dual Admin Page (`pages/dual-admin/`):**

- `page.tsx` - Dual admin page

**Payments Pages (`pages/payments/`):**

- `page.tsx` - Main payments page
- `layout.tsx` - Payments layout
- `money-transfer/page.tsx` - Money transfer page
- `policies/create/page.tsx` - Create policy page
- `policies/create/[policyId]/page.tsx` - Edit policy page
- `policies/delete/[policyId]/page.tsx` - Delete policy page

**Settings Page (`pages/settings/`):**

- `page.tsx` - Settings page

## Important Notes

⚠️ **WARNING: This code is not being used anymore.**

1. **Do NOT import** from this folder in any code
2. **Do NOT reference** these files in new development
3. **Do NOT use** any of this code as a basis for new features
4. These files are kept **only for historical reference**

## Status

All files in this folder are **no longer in use** and have been deprecated. They are maintained here solely for:

- Historical reference
- Understanding what was previously implemented
- Reference during code reviews or audits

**These files should not be used, imported, or referenced in any active codebase.**
