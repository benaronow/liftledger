import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { ProgressStackParamList } from "../RootNavigator/types";
import { ProgramDetail } from "./ProgramDetail";
import { ProgramList } from "./ProgramList";
import { ChartScreen } from "./ChartScreen";

const Stack = createNativeStackNavigator<ProgressStackParamList>();

export const Progress = () => (
  <Stack.Navigator
    initialRouteName="Chart"
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen
      name="Chart"
      component={ChartScreen}
      options={{ animation: "none" }}
    />
    <Stack.Screen
      name="ProgramList"
      component={ProgramList}
      options={{ animation: "none" }}
    />
    <Stack.Screen name="ProgramDetail" component={ProgramDetail} />
  </Stack.Navigator>
);
