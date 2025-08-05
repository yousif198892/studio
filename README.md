# LinguaLeap Application Blueprint

## 1. Core Concept

**LinguaLeap** is an AI-enhanced language learning application designed for vocabulary acquisition. It uses a Spaced Repetition System (SRS) to help users memorize words effectively. The application supports two distinct user roles: **Students**, who learn the vocabulary, and **Supervisors**, who manage the content and track student engagement.

---

## 2. Technology Stack

- **Framework**: Next.js 15+ (with App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN UI, providing a consistent and modern component library.
- **AI Integration**: Genkit, specifically utilizing Google AI models for two key functions:
    1.  **`gemini-2.0-flash`**: To generate three plausible but incorrect multiple-choice distractors for a given vocabulary word, its definition, and an explanatory image.
    2.  **`gemini-2.5-flash-preview-tts`**: For text-to-speech conversion of vocabulary words.
- **Data Persistence**: The application simulates a database using the browser's **`localStorage`**. There is no backend database.
    - Initial data (users, words) is mocked in `src/lib/data.ts`.
    - User-generated content (new users, new words, user progress) is stored and retrieved from `localStorage`.
- **Authentication**: User authentication is simulated.
    - There are no real user sessions. The logged-in user's state is managed by passing their `userId` as a URL query parameter (e.g., `/dashboard?userId=user1`).
    - The login form validates credentials against a list of users compiled from both the mock data file and any new users saved in `localStorage`.

---

## 3. Key Features & User Flows

### 3.1. User Roles

- **Student**: The primary learner. Can register under a supervisor, review words, and track their personal progress.
- **Supervisor**: The content manager. Can add/edit/delete vocabulary words, view their list of students, and has an administrative view.
- **Main Admin**: A special type of Supervisor (`isMainAdmin: true`) who has access to an inbox for new supervisor requests and a panel to manage other supervisor accounts.

### 3.2. Authentication & Registration

- **Login (`/login`)**: A form where users enter an email and password. It checks against the combined list of mock users and users from `localStorage`. On success, it redirects to the dashboard with the user's ID in the URL.
- **Registration (`/register`)**:
    - A student registration form that requires a `name`, `email`, `password`, and a valid `supervisorId`.
    - A link to a "Contact Admin" page for individuals who wish to become supervisors.
- **Contact Admin (`/contact-admin`)**: A simple form that saves a message to `localStorage` for the Main Admin to review.
- **Welcome Page (`/welcome`)**: A transient page that takes a new user's data from the registration flow, saves it to `localStorage`, and then redirects to the dashboard.

### 3.3. Student Experience

- **Dashboard (`/dashboard`)**:
    - Displays a welcome message and a summary of learning statistics (total review time, words reviewed, etc.), which are tracked in `localStorage`.
    - Features a prominent card showing the number of "Words to Review," which links to the learning page.
- **Learn Page (`/learn`)**:
    - The core quiz interface. It fetches words that are due for review based on the SRS algorithm.
    - Words are displayed one at a time in a `QuizCard`.
    - The `QuizCard` shows the word, its definition, an image, and four multiple-choice options (the correct answer + 3 AI-generated distractors), which are shuffled.
    - After answering, the card provides immediate visual feedback (green for correct, red for incorrect).
    - The student's answer updates the word's SRS `strength` and `nextReview` date in `localStorage`.
    - The session ends when no more words are due for review.
- **Profile Page (`/dashboard/profile`)**:
    - Allows students to update their name and profile picture.
    - Provides options to change language, timezone, and font size (preferences are saved to `localStorage`).
    - Includes simulated "Reset Password" and "Delete Account" features.

### 3.4. Supervisor Experience

- **Dashboard (`/dashboard`)**:
    - Displays the supervisor's unique ID, which they share with students.
    - Shows a list of all students registered under their ID.
- **My Words Page (`/dashboard/words`)**:
    - Displays a table of all vocabulary words the supervisor has created.
    - Each row shows the word, its definition, and its image.
    - Provides "Edit" and "Delete" buttons for each word.
- **Add Word Page (`/dashboard/add-word`)**:
    - A form for adding a new vocabulary card. Fields include `word`, `definition`, `unit`, `lesson`, and an `image upload`.
    - Includes a client-side check to prevent adding duplicate words.
    - On submission, a server action calls the Genkit AI flow to generate three incorrect options.
    - The complete word object (including the AI-generated options and image data URI) is saved to `localStorage`.
- **Edit Word Page (`/dashboard/edit-word/[wordId]`)**: Allows modification of a word's text details and replacement of its image.
- **My Students Page (`/dashboard/students`)**: A dedicated view to list all students, with an option to remove a student (which detaches them from the supervisor).
- **Profile Page (`/dashboard/profile`)**: Similar to the student's profile for managing personal information.

### 3.5. Main Admin Features (for `isMainAdmin: true` Supervisors)

- **Messages Page (`/dashboard/messages`)**: An inbox that displays messages submitted through the "Contact Admin" page.
- **Admins Page (`/dashboard/admins`)**:
    - A form to create new supervisor accounts.
    - A table listing all other supervisors.
    - The ability to suspend or unsuspend other supervisor accounts, which prevents or allows them to log in.
    - The ability to delete other supervisor accounts.

---

## 4. Application Structure & Data Flow

- **Components**: Reusable UI elements are in `src/components/`, including `QuizCard`, `LoginForm`, `AddWordForm`, and the `DashboardSidebar`. UI primitives from ShadCN are in `src/components/ui/`.
- **Server Actions (`src/lib/actions.ts`)**: Handles all form submissions, including `login`, `register`, `addWord`, and `updateWord`. This is where server-side validation (using Zod) and calls to AI flows occur.
- **AI Flows (`src/ai/flows/`)**: Contains the Genkit definitions for AI-powered tasks (`generate-word-options.ts` and `text-to-speech-flow.ts`).
- **Data Simulation (`src/lib/data.ts`)**:
    - Contains the initial `mockUsers` and `mockMessages`.
    - Provides helper functions like `getUserById` and `getWordsBySupervisor` that abstract away the data source (combining mock data with `localStorage` data).
- **Client-Side Storage (`src/lib/storage.ts`)**: Manages all interactions with `localStorage`, specifically for storing student-specific word progress.
- **Internationalization (`src/lib/i18n.ts`)**: Stores translation strings for English and Arabic. The `useLanguage` hook provides the `t` function for translations throughout the app.
- **Routing**: Uses the Next.js App Router. All pages are located within the `src/app/` directory, with subfolders for routes (e.g., `src/app/dashboard/profile/`).
