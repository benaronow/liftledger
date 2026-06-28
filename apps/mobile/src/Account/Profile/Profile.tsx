import { useMe } from "@liftledger/api-client";
import {
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { LogoSpinner } from "../../components/LogoSpinner";
import { useTheme } from "react-native-paper";
import { SPACING } from "../../theme";
import { DangerZone } from "./DangerZone/DangerZone";
import { PersonalInfo } from "./PersonalInfo";
import { ProfilePicture } from "./ProfilePicture";

export const Profile = () => {
  const { data: curUser } = useMe();
  const { colors } = useTheme();

  if (!curUser) return <LogoSpinner />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.xxl,
        paddingHorizontal: SPACING.lg,
      }}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ alignItems: "center", gap: SPACING.lg }}>
          <ProfilePicture />
          <PersonalInfo />
          <DangerZone />
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
};
