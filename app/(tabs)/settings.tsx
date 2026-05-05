import { useClerk, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/(auth)/sign-in");
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <View className="gap-6">
        <View>
          <Text className="text-3xl font-sans-bold text-primary">Settings</Text>
          <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
            Manage your Recurrly account.
          </Text>
        </View>

        <View className="rounded-[28px] border border-border bg-card p-5">
          <Text className="text-sm font-sans-semibold uppercase text-muted-foreground">
            Signed in as
          </Text>
          <Text className="mt-2 text-lg font-sans-bold text-primary">
            {user?.primaryEmailAddress?.emailAddress ?? "Your account"}
          </Text>
        </View>

        <Pressable
          className="items-center rounded-2xl bg-primary py-4"
          onPress={handleSignOut}
          style={({ pressed }) => [{ opacity: pressed ? 0.88 : 1 }]}
        >
          <Text className="text-base font-sans-bold text-background">Log out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
