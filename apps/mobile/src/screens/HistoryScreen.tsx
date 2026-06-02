import { useBlock, useMe } from "@liftledger/api-client";
import { Block, COLORS } from "@liftledger/shared";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ActionButton } from "../components/ActionButton";
import { LogoSpinner } from "../components/LogoSpinner";
import type { TabNav } from "../navigation/types";
import { FONT, RADIUS, SPACING } from "../theme";

export const HistoryScreen = () => {
  const navigation = useNavigation<TabNav<"History">>();
  const { data: curUser, isLoading: isUserLoading } = useMe();
  const { data: curBlock, isLoading: isBlockLoading } = useBlock(
    curUser?._id,
    curUser?.curBlock,
  );

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
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {completedBlocks.length > 0 ? (
        completedBlocks.map((block, idx) => {
          const completedDate = getCompletedDate(block);
          return (
            <View key={block._id ?? idx} style={styles.row}>
              <Text style={styles.rowText} numberOfLines={1}>
                <Text style={styles.rowName}>{`${idx + 1}. ${block.name}`}</Text>
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
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No completed blocks yet</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    height: 35,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.dark,
    borderRadius: RADIUS.sm,
    paddingLeft: SPACING.sm,
    // The duplicate button squares its left edge against the row.
    overflow: "hidden",
  },
  rowText: { flex: 1, color: "white", fontSize: FONT.sm },
  rowName: { fontWeight: "700" },
  empty: {
    width: "100%",
    alignItems: "center",
    backgroundColor: COLORS.container,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
  },
  emptyText: { color: "white", fontSize: FONT.base, fontWeight: "700" },
});
