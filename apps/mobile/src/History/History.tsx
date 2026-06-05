import { useBlock, useMe } from "@liftledger/api-client";
import { Block } from "@liftledger/shared";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import { ScrollView, Text, View } from "react-native";
import { ActionButton } from "../components/ActionButton";
import { LogoSpinner } from "../components/LogoSpinner";
import type { TabNav } from "../navigation/types";
import { useTheme } from "../providers/ThemeProvider";
import { FONT, RADIUS, SPACING } from "../theme";

export const History = () => {
  const navigation = useNavigation<TabNav<"History">>();
  const { data: curUser, isLoading: isUserLoading } = useMe();
  const { data: curBlock, isLoading: isBlockLoading } = useBlock(
    curUser?._id,
    curUser?.curBlock,
  );
  const { colors } = useTheme();

  const getCompletedDate = (block: Block) => {
    if (block.endDate) return block.endDate;
    const finalWeek = block.weeks[block.weeks.length - 1];
    const finalDay = finalWeek[finalWeek.length - 1];
    return finalDay.completedDate;
  };

  if (isUserLoading || isBlockLoading) return <LogoSpinner />;

  // Past blocks = every block except the one currently in progress.
  const completedBlocks =
    curUser?.blocks.filter((block) => block._id !== curBlock?._id) ?? [];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: "center",
        paddingVertical: SPACING.lg,
        paddingHorizontal: SPACING.lg,
      }}
    >
      {completedBlocks.length > 0 ? (
        completedBlocks.map((block, idx) => {
          const completedDate = getCompletedDate(block);
          return (
            <View
              key={block._id ?? idx}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                height: 35,
                marginBottom: SPACING.md,
                borderRadius: RADIUS.sm,
                paddingLeft: SPACING.sm,
                overflow: "hidden",
                backgroundColor: colors.dark,
              }}
            >
              <Text
                style={{ flex: 1, fontSize: FONT.sm, color: colors.text }}
                numberOfLines={1}
              >
                <Text
                  style={{ fontWeight: "700" }}
                >{`${idx + 1}. ${block.name}`}</Text>
                <Text>{`  (${dayjs(block.startDate).format("M/DD/YY")} - ${
                  completedDate ? dayjs(completedDate).format("M/DD/YY") : "N/A"
                })`}</Text>
              </Text>
              <ActionButton
                roundedSide="end"
                height={35}
                width={35}
                icon={
                  <Ionicons name="duplicate-outline" size={20} color="white" />
                }
                onPress={() =>
                  navigation.navigate("EditBlock", {
                    duplicateFrom: block._id,
                  })
                }
              />
            </View>
          );
        })
      ) : (
        <View
          style={{
            width: "100%",
            alignItems: "center",
            borderRadius: RADIUS.sm,
            padding: SPACING.md,
          }}
        >
          <Text style={{ fontSize: FONT.base, fontWeight: "700" }}>
            No completed blocks yet
          </Text>
        </View>
      )}
    </ScrollView>
  );
};
