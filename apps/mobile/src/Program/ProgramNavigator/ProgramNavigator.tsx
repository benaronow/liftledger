import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { ProgramStackParamList } from "../../RootNavigator/types";
import { RotationScreen } from "./RotationScreen";
import { SessionScreen } from "./SessionScreen";
import { View } from "react-native";
import { useTheme } from "react-native-paper";
import { ProgramLeaveGuard } from "./ProgramLeaveGuard";

const Stack = createNativeStackNavigator<ProgramStackParamList>();

export const ProgramNavigator = () => {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Rotation" component={RotationScreen} />
        <Stack.Screen name="Session" component={SessionScreen} />
      </Stack.Navigator>
      <ProgramLeaveGuard />
    </View>
  );
};
