import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomBlur } from "../../components/BottomBlur";
import { FloatingTabBar, floatingTabBarClearance } from "./FloatingTabBar";
import { Progress } from "../../Progress";
import { Dashboard } from "../../Dashboard/Dashboard";
import { Program } from "../../Program";
import type { TabParamList } from "../types";

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      tabBar={(props) => (
        <>
          <BottomBlur height={floatingTabBarClearance(insets.bottom) + 24} />
          <FloatingTabBar {...props} />
        </>
      )}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="Progress"
        component={Progress}
        options={{
          title: "Progress",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="trending-up"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Program"
        component={Program}
        options={{
          title: "Program",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dumbbell" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
