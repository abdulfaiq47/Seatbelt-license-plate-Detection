# Professional Video Detection Website Implementation Plan

The goal is to transform the default Next.js template into a high-end, professional video detection platform that interfaces with a backend API for video processing.

## Proposed Changes

### UI Design & Aesthetics
- **Theme**: Premium dark mode with a primary accent color (e.g., Cyber Blue or Electric Purple).
- **Glassmorphism**: Use semi-transparent backgrounds with blur effects for cards and overlays.
- **Animations**: Implement smooth transitions using `framer-motion` for page loads, file uploads, and status updates.
- **Typography**: Utilize modern fonts (Inter/Geist) for a clean look.

### Core Components
#### [NEW] `components/UploadZone.js`
- A drag-and-drop component with haptic-like animations on hover and drop.
- Visual feedback for file selection.

#### [NEW] `components/StatusTracker.js`
- Displays current job status (`queued`, `processing`, `done`).
- Animated progress indicators.

#### [NEW] `components/ResultsDisplay.js`
- Split view: Processed video on one side, violation details on the other.
- Data cards for each result (violation, label, plate text).

#### [MODIFY] `app/page.js`
- Integrate all components into a cohesive landing page.
- Manage state for `jobId` and `jobResults`.

#### [MODIFY] `app/globals.css`
- Define the design system tokens (colors, gradients, shadows).
- Add custom scrollbars and global utility classes.

### Backend Integration
- **Upload**: `POST https://localhost:500/upload-video`
- **Status**: `GET https://localhost:500/job-status/<job_id>`
- **Video**: `GET https://localhost:500/get-video/<job_id>`

## Open Questions
- [IMPORTANT] The user specified `https://localhost:500`. Standard Flask/FastAPI ports are `5000` or `8000`. Is `500` correct or should I make it a configurable environment variable?
- [NOTE] For the bounding box visualization, does the user want them rendered on top of the original video via Canvas, or is the "processed video" from the backend already annotated? (The API `get-video` suggests the backend provides an annotated video).

## Verification Plan
### Automated Tests
- Mock the API responses in a test suite to ensure polling logic and UI updates correctly.
### Manual Verification
- Test file upload with a sample video.
- Observe the transition from `queued` to `processing` to `done`.
- Verify that results are displayed correctly and the video plays.
