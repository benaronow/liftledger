import { Image, View } from "react-native";
import { useAuth0 } from "react-native-auth0";
import { useTheme } from "react-native-paper";

export const ProfilePicture = () => {
  const { user: auth0User } = useAuth0();
  const { dark } = useTheme();

  return (
    <View
      style={{
        width: "100%",
        alignItems: "center",
      }}
    >
      {auth0User?.picture && (
        // Shadow lives on a wrapper View — iOS won't cast a reliable shadow
        // from an Image, and `elevation` isn't a valid ImageStyle prop.
        <View
          style={{
            borderRadius: 40,
            // A black drop shadow is invisible on a dark background, so in dark
            // mode we cast a soft light "glow" instead — this keeps the picture
            // visibly lifted off the surface in both themes.
            shadowColor: dark ? "white" : "black",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: dark ? 0.35 : 0.25,
            shadowRadius: 6,
            elevation: 6,
          }}
        >
          <Image
            source={{ uri: auth0User.picture }}
            style={{
              height: 80,
              width: 80,
              borderRadius: 40,
              borderWidth: 2,
              borderColor: "white",
            }}
          />
        </View>
      )}
    </View>
  );
};
