import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@liftledger/shared";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image, StyleSheet } from "react-native";
import { ProgressScreen } from "../features/progress/ProgressScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { EditBlockScreen } from "../screens/EditBlockScreen";
import { HistoryScreen } from "../screens/HistoryScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import type { TabParamList } from "./types";

const Tab = createBottomTabNavigator<TabParamList>();

// Bottom tabs mirroring the web footer. Icon-only, dark bar. The header is owned
// by the parent native-stack (one header implementation app-wide → uniform
// height), so tabs render headerless and the stack derives its title/avatar
// from the focused tab.
export const TabNavigator = () => (
  <Tab.Navigator
    initialRouteName="Dashboard"
    screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: "#8e8e93",
    }}
  >
    <Tab.Screen
      name="Progress"
      component={ProgressScreen}
      options={{
        title: "Progress",
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="trending-up" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="History"
      component={HistoryScreen}
      options={{
        title: "History",
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="time" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{
        title: "Home",
        tabBarIcon: () => (
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
          />
        ),
      }}
    />
    <Tab.Screen
      name="EditBlock"
      component={EditBlockScreen}
      options={{
        title: "Edit Block",
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="create" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        title: "Settings",
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="settings-sharp" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: { backgroundColor: COLORS.dark, borderTopWidth: 0 },
  logo: { height: 32, width: 32 },
});
