import { Container, Row, Col } from "react-bootstrap";
import { FaApple } from "react-icons/fa";
import styles from "./landing.module.css";

const FEATURES = [
  {
    title: "Fully custom programs",
    body: "Build your own training programs with rotating sessions that fit however you split your week.",
  },
  {
    title: "Log every set",
    body: "Record reps, weight, and notes set by set, and check them off as you go — no fumbling mid-workout.",
  },
  {
    title: "Track your progress",
    body: "Every completed session is saved, so you can look back and see your lifts climb over time.",
  },
  {
    title: "Built-in rest timer",
    body: "Preset rest timers between sets keep you moving and take the guesswork out of recovery.",
  },
];

export const Landing = () => (
  <>
    <section className={styles.hero}>
      <Container className={styles.heroContent}>
        <img src="/icon.png" alt="LiftLedger logo" className={styles.logo} />
        <h1 className={styles.wordmark}>LiftLedger</h1>
        <p className={styles.tagline}>Log anything and everything.</p>
        <div className={styles.badge} aria-label="Coming soon on the App Store">
          <FaApple className={styles.badgeIcon} aria-hidden="true" />
          <span>
            <span className={styles.badgeSmall}>Coming soon on the</span>
            <span className={styles.badgeLarge}>App Store</span>
          </span>
        </div>
      </Container>
    </section>
    <section className={styles.features}>
      <Container>
        <Row className="g-4">
          {FEATURES.map((feature) => (
            <Col key={feature.title} md={6} lg={3}>
              <div className={styles.card}>
                <div className={styles.accentBar} />
                <h2 className={styles.cardTitle}>{feature.title}</h2>
                <p className={styles.cardBody}>{feature.body}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  </>
);
