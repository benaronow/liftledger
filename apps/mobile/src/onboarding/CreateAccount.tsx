import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useAuth0 } from "react-native-auth0";
import { useAuth0Profile, useCreateUser } from "@liftledger/api-client";
import {
  ActivityIndicator,
  Button,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { useThemePreference } from "../providers/ThemeProvider";
import { AppTextInput } from "../components/inputs";
import { SPACING } from "../theme";
import { useSnackbar } from "../providers/SnackbarProvider";
import { useLogout } from "../RootNavigator/AuthenticatedRouter/useLogout";
import { SectionCard } from "../components/SectionCard";

const DEFAULT_TIMER_PRESETS = { 0: 120, 1: 150, 2: 180, 3: 210, 4: 240 };

const errorMessage = (e: unknown, fallback: string): string => {
  const data = (e as { response?: { data?: { error?: string } } })?.response
    ?.data;
  return data?.error ?? (e as Error)?.message ?? fallback;
};

export const CreateAccount = () => {
  const { user } = useAuth0();
  const { colors } = useTheme();
  const { showSnackbar } = useSnackbar();
  const logout = useLogout();
  const { trigger: createUser, isMutating: creating } = useCreateUser();
  const { scheme } = useThemePreference();

  const isNonConnectionUser = useMemo(
    () => user?.sub?.startsWith("auth0|") ?? false,
    [user?.sub],
  );
  const { data: profile, isLoading: profileLoading } =
    useAuth0Profile(isNonConnectionUser);

  const email = user?.email ?? "";
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isNonConnectionUser && profile?.username) setUsername(profile.username);
  }, [isNonConnectionUser, profile?.username]);

  const canSubmit =
    fullName.trim() !== "" &&
    username.trim() !== "" &&
    email !== "" &&
    !creating;

  const handleCreate = useCallback(async () => {
    if (!user?.sub) return;
    setError("");
    try {
      await createUser({
        auth0Id: user.sub,
        email,
        username: username.trim(),
        fullName: fullName.trim(),
        timerPresets: DEFAULT_TIMER_PRESETS,
      });
    } catch (e: unknown) {
      const msg = errorMessage(e, "Failed to create account");
      setError(msg);
      showSnackbar(msg, "error");
    }
  }, [user?.sub, email, username, fullName, createUser, showSnackbar]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View
          style={{
            flexGrow: 1,
            justifyContent: "center",
            gap: SPACING.xl,
            padding: SPACING.xl,
          }}
        >
          <Text
            style={{ fontSize: 28, fontWeight: "700", textAlign: "center" }}
          >
            Finish your account
          </Text>
          <SectionCard>
            <AppTextInput
              label="Full Name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="none"
            />
            <AppTextInput
              label="Email"
              value={email}
              disabled
              theme={{
                colors: {
                  surfaceDisabled:
                    scheme === "dark" ? colors.surfaceVariant : "white",
                },
              }}
            />
            <AppTextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              disabled={isNonConnectionUser}
              right={
                !isNonConnectionUser && profileLoading ? (
                  <TextInput.Icon
                    icon={() => <ActivityIndicator size={18} />}
                  />
                ) : undefined
              }
              theme={{
                colors: {
                  surfaceDisabled:
                    scheme === "dark" ? colors.surfaceVariant : "white",
                },
              }}
            />
            {error !== "" && (
              <Text style={{ color: colors.error, textAlign: "center" }}>
                {error}
              </Text>
            )}
            <View style={{ gap: SPACING.sm, marginTop: SPACING.sm }}>
              <Button
                mode="contained"
                onPress={handleCreate}
                loading={creating}
                disabled={!canSubmit}
              >
                Create account
              </Button>
              <Button mode="text" textColor={colors.error} onPress={logout}>
                Log out
              </Button>
            </View>
          </SectionCard>
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
};
