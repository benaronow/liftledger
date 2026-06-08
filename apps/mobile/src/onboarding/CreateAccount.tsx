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
} from "../paper";
import { SPACING } from "../theme";
import { useSnackbar } from "../providers/SnackbarProvider";
import { useLogout } from "../RootNavigator/AuthenticatedRouter/useLogout";

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

  const isConnectionUser = useMemo(
    () => user?.sub?.startsWith("auth0|") ?? false,
    [user?.sub],
  );
  const { data: profile, isLoading: profileLoading } =
    useAuth0Profile(isConnectionUser);

  const email = user?.email ?? "";
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [birthday, setBirthday] = useState<Date | undefined>(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isConnectionUser && profile?.username) setUsername(profile.username);
  }, [isConnectionUser, profile?.username]);

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
      surfaceDisabled: colors.textDisabled,
    },
  };

  // Paper hard-codes a disabled outlined-input's outline to 'transparent' in
  // dark mode (TextInput/helpers getOutlinedOutlineInputColor), so the outline
  // vanishes against the background. Forcing `dark: false` for just these
  // read-only fields routes them through the light-mode branch, which honors
  // our `surfaceDisabled` outline color while every other color stays themed.
  const disabledInputTheme = {
    dark: false,
    colors: { surfaceDisabled: colors.textDisabled },
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

          <TextInput
            mode="outlined"
            label="Full name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />

          <TextInput
            mode="outlined"
            label="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            disabled={isConnectionUser}
            right={
              isConnectionUser && profileLoading ? (
                <TextInput.Icon icon={() => <ActivityIndicator size={18} />} />
              ) : undefined
            }
            theme={disabledInputTheme}
          />

          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            disabled
            theme={disabledInputTheme}
          />

          {/* Plain View wrapper: PaperProvider renders a flex:1 Portal.Host that
          would otherwise stretch the date field to fill the column. */}
          <View>
            <PaperProvider theme={modalTheme}>
              <DatePickerInput
                locale="en"
                label="Birthday"
                value={birthday}
                onChange={setBirthday}
                inputMode="start"
                mode="outlined"
              />
            </PaperProvider>
          </View>

          {error !== "" && (
            <Text style={{ color: colors.danger, textAlign: "center" }}>
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
            <Button mode="text" textColor={colors.danger} onPress={logout}>
              Log out
            </Button>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
};
