import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet } from "react-native";
import { useAuth0 } from "react-native-auth0";

interface Props {
  onPress: () => void;
}

// Header-right avatar (mirrors web's Header). Shows the Auth0 profile picture,
// falling back to a person glyph; tapping opens the Profile screen.
export const AvatarButton = ({ onPress }: Props) => {
  const { user } = useAuth0();

  return (
    <Pressable style={styles.button} onPress={onPress}>
      {user?.picture ? (
        <Image source={{ uri: user.picture }} style={styles.image} />
      ) : (
        <Ionicons name="person" size={18} color="#6d6e71" />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 32,
    width: 32,
    borderRadius: 16,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: { height: 32, width: 32, borderRadius: 16 },
});
