# Livestock Fattening SPV - Interaction Design

## Core User Interactions

### 1. Application Form (Public Facing)
**Location**: Index page main content area
**Functionality**: 
- Multi-step form with smooth transitions
- Real-time validation for NIN format
- Dynamic form fields based on financial choice selection
- Credit consent checkbox appears only when financing option is selected
- Submit button triggers loading state and serverless function
- Success redirects to confirmation page

### 2. Dashboard Interface (Authenticated)
**Location**: Dashboard page
**Functionality**:
- Top section: SPV status and account overview
- Left sidebar: Navigation menu with icons
- Main area: Action cards for different functions
- Connect Wallet button with modal popup (simulated)
- Request forms toggle expandable sections
- New projects displayed as cards with hover effects

### 3. Confirmation System
**Location**: Confirmation page
**Functionality**:
- Animated checkmark on load
- Countdown timer showing 24-hour review period
- Status updates simulation
- Return to home button

### 4. Interactive Elements
- Animated livestock counter showing running numbers
- Progress indicators for form completion
- Hover effects on all clickable elements
- Smooth page transitions
- Loading states for all async operations

## User Flow
1. Land on homepage → See SPV information and application form
2. Fill application → Choose financial option → Submit
3. Redirect to confirmation → See waiting list status
4. (Simulated approval) → Access dashboard
5. Use dashboard tools → Connect wallet → View projects