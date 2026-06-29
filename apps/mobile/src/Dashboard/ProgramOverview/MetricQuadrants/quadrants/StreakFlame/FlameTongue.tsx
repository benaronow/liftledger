import { Animated } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { useTongueAnimation } from "./useTongueAnimation";

export const MAX_TONGUE_HEIGHT = 12;
export const TONGUE_WIDTH = 16;
const MIN_TONGUE_HEIGHT = 0.4;
const BASE_SINK = 2;

type Props = {
  index: number;
  centerX: number;
  baseColor: string;
};

export const FlameTongue = ({ index, centerX, baseColor }: Props) => {
  const tongueAnimation = useTongueAnimation();

  const heightMultiplier = 0.65 + Math.random() * 0.4;
  const tongueHeight = MAX_TONGUE_HEIGHT * heightMultiplier + BASE_SINK;
  const baseAnchorOffset = (tongueHeight * (1 - MIN_TONGUE_HEIGHT)) / 2;

  const tonguePath = `M 0 ${tongueHeight} C ${TONGUE_WIDTH * 0.12} ${tongueHeight * 0.5}, ${TONGUE_WIDTH * 0.32} ${tongueHeight * 0.45}, ${TONGUE_WIDTH / 2} 0 C ${TONGUE_WIDTH * 0.68} ${tongueHeight * 0.45}, ${TONGUE_WIDTH * 0.88} ${tongueHeight * 0.5}, ${TONGUE_WIDTH} ${tongueHeight} Z`;

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: -BASE_SINK,
        left: centerX - TONGUE_WIDTH / 2,
        width: TONGUE_WIDTH,
        height: tongueHeight,
        transform: [
          {
            translateY: tongueAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [baseAnchorOffset, 0],
            }),
          },
          {
            scaleY: tongueAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [MIN_TONGUE_HEIGHT, 1],
            }),
          },
          {
            scaleX: tongueAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
            }),
          },
        ],
        shadowColor: "#ff7a00",
        shadowOpacity: 0.6,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 0 },
      }}
    >
      <Svg width={TONGUE_WIDTH} height={tongueHeight}>
        <Defs>
          <LinearGradient id={`tongue${index}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#ff5a1f" stopOpacity={0.12} />
            <Stop offset="0.55" stopColor="#ff7a1f" stopOpacity={1} />
            <Stop offset="1" stopColor={baseColor} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <Path d={tonguePath} fill={`url(#tongue${index})`} />
      </Svg>
    </Animated.View>
  );
};
