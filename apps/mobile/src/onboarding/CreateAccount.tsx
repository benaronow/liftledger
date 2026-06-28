import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useAuth0 } from "react-native-auth0";
import { DatePickerInput } from "react-native-paper-dates";
import { useAuth0Profile, useCreateUser } from "@liftledger/api-client";
import {
  ActivityIndicator,
  Button,
  PaperProvider,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { useThemePreference } from "../providers/ThemeProvider";
import { AppTextInput } from "../components/inputs";
import { INPUT_HEIGHT, RADIUS, SPACING } from "../theme";
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
  const theme = useTheme();
  const { colors } = theme;
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
  const [birthday, setBirthday] = useState<Date | undefined>(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isNonConnectionUser && profile?.username) setUsername(profile.username);
  }, [isNonConnectionUser, profile?.username]);

  const canSubmit =
    fullName.trim() !== "" &&
    username.trim() !== "" &&
    email !== "" &&
    !!birthday &&
    !creating;

  const handleCreate = useCallback(async () => {
    if (!user?.sub || !birthday) return;
    setError("");
    try {
      await createUser({
        auth0Id: user.sub,
        email,
        username: username.trim(),
        fullName: fullName.trim(),
        birthday: birthday.toISOString(),
        timerPresets: DEFAULT_TIMER_PRESETS,
      });
      // Success writes the meKey cache, so the router swaps to the main app.
    } catch (e: unknown) {
      const msg = errorMessage(e, "Failed to create account");
      setError(msg);
      showSnackbar(msg, "error");
    }
  }, [
    user?.sub,
    email,
    username,
    fullName,
    birthday,
    createUser,
    showSnackbar,
  ]);

  const modalTheme = {
    ...theme,
    colors: {
      ...colors,
      surface: colors.background,
      surfaceDisabled: colors.onSurfaceDisabled,
    },
  };

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
                  surfaceDisabled: scheme === "dark" ? colors.surfaceVariant : "white",
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
                  surfaceDisabled: scheme === "dark" ? colors.surfaceVariant : "white",
                },
              }}
            />
            <View>
              <PaperProvider theme={modalTheme}>
                <DatePickerInput
                  style={{ height: INPUT_HEIGHT }}
                  outlineStyle={{ borderRadius: RADIUS.md }}
                  mode="outlined"
                  locale="en"
                  label="Birthday"
                  value={birthday}
                  onChange={setBirthday}
                  inputMode="start"
                />
              </PaperProvider>
            </View>
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
