import { Container } from "react-bootstrap";

// Fill these in before submitting to the App Store.
const EFFECTIVE_DATE = "[INSERT DATE]";
const CONTACT_EMAIL = "[INSERT CONTACT EMAIL]";

export const Privacy = () => (
  <Container style={{ maxWidth: 760, padding: "3.5rem 1rem 4rem" }}>
    <h1>Privacy Policy for LiftLedger</h1>
    <p style={{ color: "var(--color-text-muted)" }}>
      <strong>Effective date:</strong> {EFFECTIVE_DATE}
    </p>

    <p>
      This Privacy Policy explains how LiftLedger ("we," "us," or "the app")
      collects, uses, and protects your information when you use the LiftLedger
      mobile application. By using LiftLedger, you agree to the practices
      described below.
    </p>

    <h2>Information We Collect</h2>
    <p>
      We collect only the information needed to provide the app's
      functionality:
    </p>

    <h3>Account Information</h3>
    <p>
      When you sign up or log in, our authentication provider (Auth0) collects
      and verifies your credentials. From that process we store:
    </p>
    <ul>
      <li>Full name</li>
      <li>Email address</li>
      <li>A username</li>
      <li>An account identifier that links your account to your data</li>
    </ul>
    <p>
      We do <strong>not</strong> store your password. All login and
      authentication — including "Sign in with Apple" — is handled by Auth0.
      Please review{" "}
      <a
        href="https://www.okta.com/privacy-policy/"
        target="_blank"
        rel="noreferrer"
      >
        Auth0's Privacy Policy
      </a>{" "}
      for details on how they process your sign-in data.
    </p>

    <h3>Workout Data</h3>
    <p>When you use the app, we store the workout information you enter, including:</p>
    <ul>
      <li>Workout programs and their schedules</li>
      <li>
        Exercises (names, equipment/apparatus, and any custom exercise names you
        create)
      </li>
      <li>Sets, repetitions, weights, and notes you log</li>
      <li>Gym names you add</li>
      <li>App preferences such as rest-timer settings</li>
    </ul>
    <p>
      This data is tied to your account so it can sync to your device and be
      available across sessions.
    </p>

    <h2>How We Use Your Information</h2>
    <p>We use your information solely to:</p>
    <ul>
      <li>Authenticate you and keep your account secure</li>
      <li>Store, display, and sync your workout logs and preferences</li>
      <li>Provide and maintain the core functionality of the app</li>
    </ul>
    <p>
      We do <strong>not</strong> use your information for advertising, and we do{" "}
      <strong>not</strong> sell, rent, or share your personal information with
      third parties for marketing purposes.
    </p>

    <h2>How Your Information Is Stored and Shared</h2>
    <ul>
      <li>
        <strong>Authentication data</strong> is processed by <strong>Auth0</strong>,
        our third-party authentication provider.
      </li>
      <li>
        <strong>Your account and workout data</strong> are stored in our
        database (MongoDB) and served through our application backend (hosted on
        Fly.io).
      </li>
    </ul>
    <p>
      We do not use third-party analytics, advertising, or tracking services. We
      do not track your activity across other apps or websites.
    </p>
    <p>
      We may disclose information if required to do so by law, or to protect the
      rights, safety, or property of LiftLedger or its users.
    </p>

    <h2>Data Retention</h2>
    <p>
      We retain your account and workout data for as long as your account is
      active. If you delete your account, we delete your associated personal and
      workout data.
    </p>

    <h2>Your Rights</h2>
    <p>You may request to:</p>
    <ul>
      <li>Access the personal data we hold about you</li>
      <li>Correct inaccurate information</li>
      <li>Delete your account and associated data</li>
    </ul>
    <p>
      To make any of these requests, contact us at the email address below.
    </p>

    <h2>Children's Privacy</h2>
    <p>
      LiftLedger is not directed to children under the age of 13 (or the minimum
      age required in your jurisdiction), and we do not knowingly collect
      personal information from children. If you believe a child has provided us
      with personal information, please contact us so we can remove it.
    </p>

    <h2>Security</h2>
    <p>
      We take reasonable measures to protect your information. Authentication is
      delegated to Auth0, and data is transmitted over encrypted connections.
      However, no method of transmission or storage is completely secure, and we
      cannot guarantee absolute security.
    </p>

    <h2>Changes to This Policy</h2>
    <p>
      We may update this Privacy Policy from time to time. Changes will be posted
      here with an updated effective date. Continued use of the app after changes
      are posted constitutes acceptance of the revised policy.
    </p>

    <h2>Contact Us</h2>
    <p>
      If you have any questions about this Privacy Policy or your data, contact
      us at:
    </p>
    <p>
      <strong>Email:</strong>{" "}
      <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
    </p>
  </Container>
);
