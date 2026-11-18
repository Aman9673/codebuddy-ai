import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors } from "@/constants/theme";

const tabItems = [
  { name: "index", title: "Home", icon: "🏠" },
  { name: "lessons", title: "Learn", icon: "📚" },
  { name: "playground", title: "Code", icon: "💻" },
  { name: "tutor", title: "Panda", icon: "🐼" },
  { name: "notes", title: "Notes", icon: "📝" },
] as const;

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.purple,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          height: 66,
          paddingTop: 7,
          paddingBottom: 8,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
      }}
    >
      {tabItems.map((item) => (
        <Tabs.Screen
          key={item.name}
          name={item.name}
          options={{
            title: item.title,
            tabBarIcon: ({ focused }) => (
              <Text style={{ fontSize: 18, opacity: focused ? 1 : 0.72 }}>
                {item.icon}
              </Text>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
