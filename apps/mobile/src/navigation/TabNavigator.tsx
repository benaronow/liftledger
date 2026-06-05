import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useTheme } from "../providers/ThemeProvider";
import { Progress } from "../Progress";
import { Dashboard } from "../Dashboard/Dashboard";
import { EditBlock } from "../EditBlock";
import { History } from "../History";
import { Settings } from "../Settings/Settings";
import type { TabParamList } from "./types";

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10 },
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: colors.dark,
          paddingHorizontal: 10,
        },
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textDisabled,
      }}
    >
      <Tab.Screen
        name="Progress"
        component={Progress}
        options={{
          title: "Progress",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={History}
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="EditBlock"
        component={EditBlock}
        options={{
          title: "Edit Block",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-sharp" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
