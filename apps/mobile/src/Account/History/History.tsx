import { useBlock, useMe } from "@liftledger/api-client";
import { ScrollView, View } from "react-native";
import { Text, useTheme } from "../../paper";
import { LogoSpinner } from "../../components/LogoSpinner";
import { FONT, RADIUS, SPACING } from "../../theme";
import { CompletedBlock } from "./CompletedBlock";

export const History = () => {
  const { data: curUser, isLoading: isUserLoading } = useMe();
  const { data: curBlock, isLoading: isBlockLoading } = useBlock(
    curUser?._id,
    curUser?.curBlock,
  );
  const { colors } = useTheme();

  if (isUserLoading || isBlockLoading) return <LogoSpinner />;

  const completedBlocks =
    curUser?.blocks.filter((block) => block._id !== curBlock?._id) ?? [];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: "center",
        paddingTop: SPACING.lg,
        paddingBottom: SPACING.xxl,
        paddingHorizontal: SPACING.lg,
      }}
    >
      {completedBlocks.length > 0 ? (
        completedBlocks.map((block, idx) => (
          <CompletedBlock key={block._id} block={block} idx={idx} />
        ))
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
