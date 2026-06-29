import { useEffect, useMemo } from "react";
import { Animated, Easing } from "react-native";

const SPEED_MULT_MIN = 0.45;
const SPEED_MULT_MAX = 2.1;
const BREAK_TIME_MIN = 40;
const BREAK_TIME_MAX = 950;
const BREAK_PROB_MIN = 0.05;
const BREAK_PROB_MAX = 0.65;

const FLARE_LEVEL_MIN = 0.1;
const FLARE_LEVEL_MAX = 2;
const FLARE_DURATION_MIN = 110;
const FLARE_DURATION_MAX = 300;

const REST_LEVEL_MIN = 0;
const REST_LEVEL_MAX = 0.45;
const REST_DURATION_MIN = 150;
const REST_DURATION_MAX = 380;

const randBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

export const useTongueAnimation = () => {
  const tongueAnimation = useMemo(() => new Animated.Value(Math.random()), []);

  const speed = randBetween(SPEED_MULT_MIN, SPEED_MULT_MAX);
  const breakTime = randBetween(BREAK_TIME_MIN, BREAK_TIME_MAX);
  const breakProbability = randBetween(BREAK_PROB_MIN, BREAK_PROB_MAX);

  useEffect(() => {
    let active = true;

    const tick = () => {
      if (!active) return;

      const flareAnimation = Animated.timing(tongueAnimation, {
        toValue: randBetween(FLARE_LEVEL_MIN, FLARE_LEVEL_MAX),
        duration: randBetween(FLARE_DURATION_MIN, FLARE_DURATION_MAX) * speed,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      });

      const restAnimation = Animated.timing(tongueAnimation, {
        toValue: randBetween(REST_LEVEL_MIN, REST_LEVEL_MAX),
        duration: randBetween(REST_DURATION_MIN, REST_DURATION_MAX) * speed,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      });

      const animationSequence = [flareAnimation, restAnimation];

      if (Math.random() < breakProbability)
        animationSequence.push(Animated.delay(breakTime));

      Animated.sequence(animationSequence).start(({ finished }) => {
        if (finished) tick();
      });
    };

    tick();

    return () => {
      active = false;
      tongueAnimation.stopAnimation();
    };
  }, [tongueAnimation, speed, breakTime, breakProbability]);

  return tongueAnimation;
};
