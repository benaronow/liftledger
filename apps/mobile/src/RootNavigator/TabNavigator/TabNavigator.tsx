import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FloatingTabBar } from "./FloatingTabBar";
import { Progress } from "../../Progress";
import { Dashboard } from "../../Dashboard/Dashboard";
import { EditBlock } from "../../EditBlock";
import type { TabParamList } from "../types";

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      tabBar={(props) => <FloatingTabBar {...props} />}
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
        name="EditBlock"
        component={EditBlock}
        options={{
          title: "Edit Block",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="pencil" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
