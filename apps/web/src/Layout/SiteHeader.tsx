import { Container } from "react-bootstrap";
import { Link } from "react-router";

export const SiteHeader = () => (
  <header
    style={{
      borderBottom: "1px solid var(--color-border)",
      padding: "1rem 0",
    }}
  >
    <Container className="d-flex align-items-center">
      <Link
        to="/"
        className="d-inline-flex align-items-center gap-2 text-decoration-none mt-1"
        style={{ color: "var(--color-text)" }}
      >
        <img
          src="/icon.png"
          alt=""
          width={32}
          height={32}
          className="mb-1 me-1"
        />
        <span
          style={{
            fontFamily: '"League Spartan", "Lato", sans-serif',
            fontWeight: 800,
            fontSize: "1.35rem",
            letterSpacing: "-0.02em",
          }}
        >
          LiftLedger
        </span>
      </Link>
    </Container>
  </header>
);
