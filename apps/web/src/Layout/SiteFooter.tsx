import { Container } from "react-bootstrap";
import { Link } from "react-router";

export const SiteFooter = () => (
  <footer
    style={{
      borderTop: "1px solid var(--color-border)",
      padding: "2rem 0",
      color: "var(--color-text-muted)",
    }}
  >
    <Container className="d-flex flex-wrap justify-content-between align-items-center gap-2">
      <span>© {new Date().getFullYear()} LiftLedger</span>
      <Link to="/privacy" style={{ color: "var(--color-text-muted)" }}>
        Privacy Policy
      </Link>
    </Container>
  </footer>
);
