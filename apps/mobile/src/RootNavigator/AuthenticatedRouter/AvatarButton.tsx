import { Avatar, TouchableRipple } from "react-native-paper";
import { useAuth0 } from "react-native-auth0";

interface Props {
  onPress: () => void;
}

export const AvatarButton = ({ onPress }: Props) => {
  const { user } = useAuth0();

  return (
    <TouchableRipple onPress={onPress}>
      {user?.picture ? (
        <Avatar.Image
          size={36}
          source={{ uri: user.picture }}
          style={{ backgroundColor: "transparent" }}
        />
      ) : (
        <Avatar.Icon
          size={36}
          icon="account"
          color="#6d6e71"
          style={{ backgroundColor: "white" }}
        />
      )}
    </TouchableRipple>
  );
};
