import { Container } from "react-bootstrap";

const SUPPORT_EMAIL = "support@liftledger.app";

export const Support = () => (
  <Container style={{ maxWidth: 760, padding: "3.5rem 1rem 4rem" }}>
    <h1>LiftLedger Support</h1>
    <p>
      Need help, hit a bug, or have a feature request? We&apos;re happy to help.
      Email us and we&apos;ll get back to you as soon as we can.
    </p>
    <p>
      <strong>Email:</strong>{" "}
      <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
    </p>

    <h2>Frequently asked questions</h2>

    <h3>How do I reset my password?</h3>
    <p>
      On the login screen, choose &quot;Forgot password&quot; and follow the
      emailed link. Sign-in is handled by our authentication provider (Auth0),
      so the reset link comes from there.
    </p>

    <h3>How do I change my email address?</h3>
    <p>
      Open the app and go to Account → Profile. Update your email there;
      you&apos;ll receive a verification email to confirm the change.
    </p>

    <h3>How do I delete my account?</h3>
    <p>
      In the app, go to Account → Profile and use the account-deletion option.
      Deleting your account removes your personal information and workout data.
      If you&apos;re unable to access the app, email us and we&apos;ll remove it
      for you.
    </p>

    <h3>How is my data handled?</h3>
    <p>
      We only store what&apos;s needed to run the app, and we don&apos;t sell
      your data or use third-party advertising or tracking. See our{" "}
      <a href="/privacy">Privacy Policy</a> for the full details.
    </p>

    <h3>What devices does LiftLedger support?</h3>
    <p>
      LiftLedger is available for iPhone. Your programs and logs are tied to
      your account, so they stay in sync across sign-ins.
    </p>

    <h2>Still need help?</h2>
    <p>
      Reach out any time at{" "}
      <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and include your
      account email and a description of the issue so we can help faster.
    </p>
  </Container>
);
